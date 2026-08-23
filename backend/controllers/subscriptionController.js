import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Razorpay instance — created lazily after env vars are loaded
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// Plan IDs loaded directly from .env — set these after creating plans manually in Razorpay dashboard
const getPlanIds = () => ({
  starter: process.env.RAZORPAY_PLAN_STARTER_ID,
  pro: process.env.RAZORPAY_PLAN_PRO_ID,
});

// Internal helper to get or create user record
const getOrCreateUser = async (clerkId) => {
  let user = await User.findOne({ clerkId });
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown';
    const role = email === 'dev.satabda@gmail.com' ? 'admin' : 'user';
    user = await User.create({ clerkId, email, role });
  }
  return user;
};

// GET /api/subscription/plans
// Returns plan info to the frontend for display
export const getPlans = async (req, res, next) => {
  try {
    const { starter, pro } = getPlanIds();

    if (!starter || !pro) {
      return res.status(500).json({
        success: false,
        error: 'Plan IDs are not configured. Please add RAZORPAY_PLAN_STARTER_ID and RAZORPAY_PLAN_PRO_ID to your .env file.'
      });
    }

    res.status(200).json({
      success: true,
      plans: {
        starter: { id: starter, amount: 999 },
        pro: { id: pro, amount: 2999 }
      }
    });
  } catch (error) {
    console.error('Error in getPlans:', error);
    next(error);
  }
};

// GET /api/subscription/status
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const user = await getOrCreateUser(clerkId);
    res.status(200).json({
      success: true,
      role: user.role,
      planType: user.planType,
      subscriptionStatus: user.subscriptionStatus
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/subscription/create
export const createSubscription = async (req, res, next) => {
  try {
    const { planType } = req.body;
    const clerkId = req.auth.userId;
    const user = await getOrCreateUser(clerkId);

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Admin users do not need a subscription.' });
    }

    const planIds = getPlanIds();
    const planId = planIds[planType];

    if (!planId) {
      return res.status(400).json({
        error: `Plan ID for "${planType}" is not configured. Please add RAZORPAY_PLAN_STARTER_ID and RAZORPAY_PLAN_PRO_ID to your .env file.`
      });
    }

    const rzp = getRazorpay();

    // Create Razorpay customer if not exists
    let customerId = user.razorpayCustomerId;
    if (!customerId) {
      const customer = await rzp.customers.create({
        name: user.email.split('@')[0],
        email: user.email
      });
      customerId = customer.id;
      user.razorpayCustomerId = customerId;
      await user.save();
    }

    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
      customer_id: customerId
    });

    user.razorpaySubscriptionId = subscription.id;
    user.subscriptionStatus = 'created';
    await user.save();

    res.status(200).json({
      success: true,
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    next(error);
  }
};

// POST /api/subscription/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planType } = req.body;
    const clerkId = req.auth.userId;
    const user = await getOrCreateUser(clerkId);

    const text = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      user.subscriptionStatus = 'active';
      user.planType = planType;
      await user.save();
      res.status(200).json({ success: true, message: 'Payment verified and subscription activated.' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    next(error);
  }
};

// POST /api/subscription/webhook (public — called by Razorpay)
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const payload = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature === signature) {
      const event = req.body.event;

      if (event === 'subscription.charged') {
        const subscriptionId = req.body.payload.subscription.entity.id;
        const user = await User.findOne({ razorpaySubscriptionId: subscriptionId });
        if (user) {
          user.subscriptionStatus = 'active';
          user.currentPeriodEnd = new Date(req.body.payload.subscription.entity.current_end * 1000);
          await user.save();
        }
      } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
        const subscriptionId = req.body.payload.subscription.entity.id;
        const user = await User.findOne({ razorpaySubscriptionId: subscriptionId });
        if (user) {
          user.subscriptionStatus = 'cancelled';
          user.planType = 'none';
          await user.save();
        }
      }

      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } catch (error) {
    console.error('Error in razorpay webhook:', error);
    next(error);
  }
};

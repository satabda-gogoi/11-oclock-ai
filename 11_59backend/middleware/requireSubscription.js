import User from '../models/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireSubscription = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId });
    
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || 'unknown';
      const role = email === 'dev.satabda@gmail.com' ? 'admin' : 'user';
      
      user = await User.create({
        clerkId,
        email,
        role
      });
    }

    // Always allow admin
    if (user.role === 'admin') {
      return next();
    }

    // Check subscription status
    if (user.subscriptionStatus === 'active') {
      // Check if past period end
      if (user.currentPeriodEnd && user.currentPeriodEnd < new Date()) {
        user.subscriptionStatus = 'past_due';
        await user.save();
        return res.status(403).json({ error: "Subscription expired. Please renew to continue generating content.", code: "SUBSCRIPTION_EXPIRED" });
      }
      return next();
    }

    return res.status(403).json({ error: "Active subscription required.", code: "SUBSCRIPTION_REQUIRED" });
  } catch (error) {
    console.error("Error in requireSubscription middleware:", error);
    return res.status(500).json({ error: "Internal server error during authorization." });
  }
};

import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { 
  getPlans, 
  getSubscriptionStatus, 
  createSubscription, 
  verifyPayment,
  handleWebhook
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Public webhook endpoint for Razorpay
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(ClerkExpressRequireAuth());

router.get('/plans', getPlans);
router.get('/status', getSubscriptionStatus);
router.post('/create', createSubscription);
router.post('/verify', verifyPayment);

export default router;

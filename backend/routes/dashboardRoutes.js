// routes/dashboardRoutes.js
import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { 
  dispatchPrompt, 
  getHistory, 
  getIntegrations, 
  connectIntegration,
  getMasterApps,
  handleWebhookComplete,
  getChatById,
  getTwitterOauthUrl,
  getTwitterOauthCallback,
  getLinkedinOauthUrl,
  getLinkedinOauthCallback,
  deleteIntegration,
  deleteChatById,
  createScheduledPost,
  getScheduledPosts,
  deleteScheduledPost,
  getPendingScheduledPosts
} from '../controllers/dashboardController.js';
import { requireSubscription } from '../middleware/requireSubscription.js';

const router = express.Router();

router.post('/webhook/complete', handleWebhookComplete);

// Callback endpoint (must be public so Twitter can redirect user's browser here)
router.get('/integrations/twitter/callback', getTwitterOauthCallback);
router.get('/integrations/linkedin/callback', getLinkedinOauthCallback);

// Public pending schedules endpoint (securely authenticated via secret checking in controller)
router.get('/scheduled/pending', getPendingScheduledPosts);

// Apply your Clerk authentication guard layer globally to all routes below in this file
router.use(ClerkExpressRequireAuth());

router.post('/dispatch', requireSubscription, dispatchPrompt);
router.get('/history', getHistory);
router.get('/chat/:chatId', getChatById);
router.delete('/chat/:chatId', deleteChatById);
router.get('/integrations', getIntegrations);
router.delete('/integrations/:integrationId', deleteIntegration);
router.post('/integrations/connect', requireSubscription, connectIntegration); // Modal save hook endpoint
router.get('/integrations/linkedin/oauth-url', requireSubscription, getLinkedinOauthUrl);
router.get('/integrations/twitter/oauth-url', requireSubscription, getTwitterOauthUrl);
router.get('/master-apps', getMasterApps);

// Scheduled posts CRUD operations
router.post('/scheduled', requireSubscription, createScheduledPost);
router.get('/scheduled', getScheduledPosts);
router.delete('/scheduled/:id', deleteScheduledPost);

export default router;
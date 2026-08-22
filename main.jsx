// controllers/dashboardController.js
import PromptHistory from '../models/PromptHistory.js';
import Integration from '../models/Integration.js';
import MasterApp from '../models/MasterApp.js';
import { encrypt, decrypt } from '../utils/cryptoHelper.js';

// @desc    Forward prompt dynamically to the correct platform webhook and save content
// @route   POST /api/dashboard/dispatch
// controllers/dashboardController.js

// controllers/dashboardController.js

// @desc    Forward prompt asynchronously to n8n and return immediate tracking token
// @route   POST /api/dashboard/dispatch
// controllers/dashboardController.js

export const dispatchPrompt = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    // 💡 Extract optional attachments array from the incoming client request body
    const { prompt, scheduling, targetPlatform, attachments } = req.body;

    console.log(`🔐 Authenticated Request from User: ${userId}`);
    console.log(`🎯 Context Platform Target Flag: ${targetPlatform}`);
    if (attachments && attachments.length > 0) {
      console.log(`📎 Media Attachments Detected: ${attachments.length} file(s) attached.`);
    }

    if (!targetPlatform) {
      return res.status(400).json({ error: "No destination platform context provided." });
    }

    // 1. Resolve MasterApp
    const masterApp = await MasterApp.findOne({ iconKey: targetPlatform.toLowerCase(), isActive: true });
    if (!masterApp) {
      return res.status(404).json({ error: `Platform '${targetPlatform}' is currently unavailable.` });
    }

    // 2. Fetch user integration credentials
    const userIntegration = await Integration.findOne({
      userId,
      appId: masterApp._id,
      authStatus: 'authorized'
    });

    if (!userIntegration) {
      return res.status(401).json({ 
        error: `Account not linked. Please connect your ${masterApp.name} channel in the sidebar first.` 
      });
    }

    console.log(`🔓 Decrypting connection credentials securely in-memory...`);
    let decryptedCredentials;
    try {
      decryptedCredentials = decrypt(
        userIntegration.encryptedData,
        userIntegration.iv,
        userIntegration.authTag,
        true
      );
    } catch (cryptoError) {
      console.error("🚨 Cryptographic Failure during decryption:", cryptoError);
      return res.status(500).json({ error: "Failed to securely verify platform keys." });
    }

    // 3. Match target key to its unique n8n pipeline environment URL route
    const workflowWebhookMap = {
      linkedin: process.env.N8N_LINKEDIN_WEBHOOK_URL,
      twitter: process.env.N8N_TWITTER_WEBHOOK_URL,
      instagram: process.env.N8N_INSTAGRAM_WEBHOOK_URL
    };

    const targetWebhookUrl = workflowWebhookMap[targetPlatform.toLowerCase()];
    if (!targetWebhookUrl) {
      return res.status(500).json({ error: `Routing error: No workflow webhook configured for ${targetPlatform}.` });
    }

    console.log(`💾 Initializing Async Tracking Record in MongoDB (Status: processing)...`);

    // 💡 4. INITIALIZE THE HISTORY DOCUMENT WITH ATTACHMENTS
    const historyRecord = new PromptHistory({
      userId,
      title: prompt, 
      inputPrompt: prompt,
      generatedContent: "",
      status: 'processing',
      platform: targetPlatform.toLowerCase(),
      attachments: attachments || [] // 👈 Commits file metadata strings directly into your database row
    });

    await historyRecord.save();

    console.log(`🚀 Triggering n8n background execution flow pipeline asynchronously...`);

    // 💡 5. FIRE ASYNC PAYLOAD DOWN THE PIPELINE WITH MEDIA ATTRIBUTES
    fetch(targetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        userId, 
        strategy: scheduling || "instant",
        recordId: historyRecord._id, 
        attachments: attachments || [], // 👈 n8n can now directly read fileUrl strings instantly!
        credentials: decryptedCredentials 
      })
    }).catch(err => {
      console.error("🚨 Background Fetch pipeline initialization fault:", err.message);
    });

    return res.status(202).json({
      success: true,
      message: "Content compilation pipeline spawned successfully.",
      recordId: historyRecord._id,
      status: "processing"
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past generated items
// @route   GET /api/dashboard/history
export const getHistory = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const history = await PromptHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: history.length, history });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's connected social channels
// @route   GET /api/dashboard/integrations
export const getIntegrations = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const integrations = await Integration.find({ userId, authStatus: 'authorized' })
      .populate('appId', 'name iconKey');

    res.status(200).json({ success: true, integrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect a new social network account channel with polymorphic credentials
// @route   POST /api/dashboard/integrations/connect
// @desc    Connect a new social network account channel with polymorphic encrypted credentials
// @route   POST /api/dashboard/integrations/connect
export const connectIntegration = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { appId, credentials } = req.body;

    console.log(`🔒 Encrypting connection payload keys for MasterApp ID: ${appId}`);

    // 💡 Run GCM cryptographic lock on incoming plain-text credentials object
    const cryptoPackage = encrypt(credentials);

    const newIntegration = new Integration({
      userId,
      appId,
      authStatus: 'authorized',
      encryptedData: cryptoPackage.encryptedData,
      iv: cryptoPackage.iv,
      authTag: cryptoPackage.authTag
    });

    await newIntegration.save();
    res.status(201).json({ success: true, data: { _id: newIntegration._id, authStatus: newIntegration.authStatus } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active platform apps
// @route   GET /api/dashboard/master-apps
export const getMasterApps = async (req, res, next) => {
  try {
    const apps = await MasterApp.find({ isActive: true });
    res.status(200).json({ success: true, apps });
  } catch (error) {
    next(error);
  }
};


// @desc    Callback endpoint for n8n to report background task completion
// @route   POST /api/dashboard/webhook/complete
export const handleWebhookComplete = async (req, res, next) => {
  try {
    // 💡 Catch the tracking parameters and output payload sent from n8n
    const { recordId, output, topic, status } = req.body;

    console.log(`🛰️ Callback received from n8n for Record ID: ${recordId}`);

    if (!recordId) {
      return res.status(400).json({ error: "Missing required reference token 'recordId'." });
    }

    // Find the pending task document row inside MongoDB
    const historyRecord = await PromptHistory.findById(recordId);
    if (!historyRecord) {
      return res.status(404).json({ error: "Target historical log record not found." });
    }

    // Update document properties with final assets
    historyRecord.status = status === 'failed' ? 'failed' : 'completed';
    if (output) historyRecord.generatedContent = output;
    if (topic) historyRecord.title = topic;

    await historyRecord.save();
    console.log(`💾 Record ${recordId} successfully updated to status: ${historyRecord.status}`);

    return res.status(200).json({ success: true, message: "Workspace log updated successfully." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single chat by its ID (checking ownership)
// @route   GET /api/dashboard/chat/:chatId
export const getChatById = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { chatId } = req.params;

    const chat = await PromptHistory.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat history not found." });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this chat." });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};
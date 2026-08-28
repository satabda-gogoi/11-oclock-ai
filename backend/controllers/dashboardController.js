// controllers/dashboardController.js
import PromptHistory from '../models/PromptHistory.js';
import Integration from '../models/Integration.js';
import MasterApp from '../models/MasterApp.js';
import TempOauthState from '../models/TempOauthState.js';
import ScheduledPost from '../models/ScheduledPost.js';
import { encrypt, decrypt } from '../utils/cryptoHelper.js';
import crypto from 'crypto';

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

      // Auto-refresh X/Twitter OAuth access token if expired or near expiry
      if (targetPlatform.toLowerCase() === 'twitter') {
        decryptedCredentials = await refreshTwitterTokenIfNeeded(userIntegration, decryptedCredentials);
      }
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
      profileName: credentials.profileName || "",
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
    // Verify secret token to authenticate the webhook source
    const webhookSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    if (!webhookSecret || !expectedSecret || webhookSecret !== expectedSecret) {
      console.warn("🚨 Unauthorized attempt to hit n8n callback webhook!");
      return res.status(401).json({ error: "Unauthorized webhook source." });
    }

    // 💡 Catch the tracking parameters and output payload sent from n8n
    const { recordId, output, topic, status } = req.body;

    console.log(`🛰️ Callback received from n8n for Record ID: ${recordId}`);
    console.log("Incoming webhook payload body:", JSON.stringify(req.body, null, 2));

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
    
    // Extract output or check alternative standard response fields
    const finalOutput = output || req.body.generatedContent || req.body.content || req.body.text || req.body.response;
    if (finalOutput) {
      historyRecord.generatedContent = finalOutput;
    }
    
    if (topic) historyRecord.title = topic;

    await historyRecord.save();
    console.log(`💾 Record ${recordId} successfully updated to status: ${historyRecord.status}`);

    // Update corresponding ScheduledPost status / recycle daily
    try {
      const scheduledPost = await ScheduledPost.findOne({ historyRecordId: recordId });
      if (scheduledPost) {
        if (scheduledPost.scheduleType === 'once') {
          scheduledPost.status = status === 'failed' ? 'failed' : 'completed';
        } else if (scheduledPost.scheduleType === 'daily') {
          scheduledPost.lastRun = new Date();
          scheduledPost.status = 'scheduled'; // reset back to scheduled for tomorrow
        }
        await scheduledPost.save();
        console.log(`⏰ Scheduled post ${scheduledPost._id} status updated/recycled.`);
      }
    } catch (schedErr) {
      console.error("⚠️ Failed to update scheduled post status in webhook callback:", schedErr);
    }

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

// @desc    Disconnect/Delete a social channel integration
// @route   DELETE /api/dashboard/integrations/:integrationId
export const deleteIntegration = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { integrationId } = req.params;

    const integration = await Integration.findById(integrationId);
    if (!integration) {
      return res.status(404).json({ error: "Integration not found." });
    }

    if (integration.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized operation." });
    }

    await Integration.deleteOne({ _id: integrationId });
    res.status(200).json({ success: true, message: "Integration disconnected successfully." });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single chat history record
// @route   DELETE /api/dashboard/chat/:chatId
export const deleteChatById = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { chatId } = req.params;

    const chat = await PromptHistory.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat history record not found." });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized operation." });
    }

    await PromptHistory.deleteOne({ _id: chatId });
    res.status(200).json({ success: true, message: "Chat history deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── TWITTER OAUTH 2.0 HELPER METHODS ──────────────────────────────────

// Helper function to auto-refresh Twitter tokens if expired (less than 5 min left)
const refreshTwitterTokenIfNeeded = async (userIntegration, credentials) => {
  if (!credentials.expiresAt || credentials.expiresAt > Date.now() + 300000) {
    return credentials;
  }

  console.log(`🔄 Twitter OAuth token expired or near expiry. Attempting auto-refresh...`);
  const client_id = process.env.TWITTER_CLIENT_ID;
  const client_secret = process.env.TWITTER_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    console.warn("⚠️ Warning: Missing Twitter Client credentials in server env. Cannot refresh token.");
    return credentials;
  }

  try {
    const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`🚨 Twitter token refresh failed: ${response.status} - ${errText}`);
      return credentials;
    }

    const tokenData = await response.json();
    
    // Update local variables
    credentials.accessToken = tokenData.access_token;
    credentials.refreshToken = tokenData.refresh_token || credentials.refreshToken;
    credentials.expiresAt = Date.now() + (tokenData.expires_in * 1000);

    // Save newly updated credentials back to MongoDB
    const cryptoPackage = encrypt(credentials);
    userIntegration.encryptedData = cryptoPackage.encryptedData;
    userIntegration.iv = cryptoPackage.iv;
    userIntegration.authTag = cryptoPackage.authTag;
    await userIntegration.save();

    console.log("✅ Twitter token successfully auto-refreshed.");
    return credentials;
  } catch (err) {
    console.error("🚨 Unexpected error during Twitter token auto-refresh:", err);
    return credentials;
  }
};

// @desc    Initiate Twitter OAuth 2.0 redirection flow (get authorization URL)
// @route   GET /api/dashboard/integrations/twitter/oauth-url
export const getTwitterOauthUrl = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const client_id = process.env.TWITTER_CLIENT_ID;
    const redirect_uri = process.env.TWITTER_REDIRECT_URI;

    if (!client_id || !redirect_uri) {
      return res.status(500).json({ error: "Twitter OAuth settings are not configured on the server." });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

    // Persist temporary authentication state in DB
    await TempOauthState.create({
      state,
      codeVerifier,
      userId
    });

    const scope = 'tweet.read tweet.write users.read offline.access';
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;

    res.status(200).json({ success: true, url: authUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Twitter OAuth 2.0 Callback handler URL
// @route   GET /api/dashboard/integrations/twitter/callback
export const getTwitterOauthCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error) {
      console.warn("⚠️ Twitter OAuth access denied by user:", error);
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=missing_params`);
    }

    // Lookup corresponding PKCE session verifier
    const tempState = await TempOauthState.findOne({ state });
    if (!tempState) {
      console.error("🚨 Twitter state match not found or expired.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=session_expired`);
    }

    const client_id = process.env.TWITTER_CLIENT_ID;
    const client_secret = process.env.TWITTER_CLIENT_SECRET;
    const redirect_uri = process.env.TWITTER_REDIRECT_URI;

    const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    
    // Exchange temporary code for access and refresh tokens
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri,
        code_verifier: tempState.codeVerifier
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("🚨 Twitter token exchange error:", errText);
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=token_exchange_failed`);
    }

    const tokenData = await response.json();

    // Query active Twitter profile parameters to grab user screen name
    const userRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    let username = "TwitterUser";
    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData?.data?.username) {
        username = userData.data.username;
      }
    }

    // Resolve MasterApp for Twitter / X
    const masterApp = await MasterApp.findOne({ iconKey: 'twitter' });
    if (!masterApp) {
      console.error("🚨 Twitter master app configuration not found in DB.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=app_not_found`);
    }

    // Encrypt the connection data payload
    const credentialsPayload = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      profileName: username
    };

    const cryptoPackage = encrypt(credentialsPayload);

    // Save integration
    await Integration.findOneAndUpdate(
      { userId: tempState.userId, appId: masterApp._id },
      {
        authStatus: 'authorized',
        profileName: username,
        encryptedData: cryptoPackage.encryptedData,
        iv: cryptoPackage.iv,
        authTag: cryptoPackage.authTag
      },
      { upsert: true }
    );

    // Clean up temporary state record
    await TempOauthState.deleteOne({ _id: tempState._id });

    console.log(`✅ Integration successfully saved for Twitter account @${username}`);
    return res.redirect(`${frontendUrl}/workspace?oauthStatus=success&platform=twitter`);
  } catch (error) {
    console.error("🚨 Error in Twitter OAuth callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=internal_server_error`);
  }
};

// @desc    Create a scheduled post
// @route   POST /api/dashboard/scheduled
export const createScheduledPost = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { prompt, platform, scheduleType, scheduledTime, dailyTime, timeZone, attachments } = req.body;

    if (!prompt || !platform) {
      return res.status(400).json({ error: "Missing required fields (prompt, platform)." });
    }

    if (scheduleType === 'once' && !scheduledTime) {
      return res.status(400).json({ error: "scheduledTime is required for one-time scheduled posts." });
    }

    if (scheduleType === 'daily' && !dailyTime) {
      return res.status(400).json({ error: "dailyTime (HH:MM) is required for daily scheduled posts." });
    }

    const scheduledPost = new ScheduledPost({
      userId,
      prompt,
      platform: platform.toLowerCase(),
      scheduleType: scheduleType || 'once',
      scheduledTime: scheduleType === 'once' ? new Date(scheduledTime) : undefined,
      dailyTime: scheduleType === 'daily' ? dailyTime : undefined,
      timeZone: timeZone || 'UTC',
      attachments: attachments || [],
      status: 'scheduled'
    });

    await scheduledPost.save();

    res.status(201).json({
      success: true,
      message: "Post scheduled successfully.",
      scheduledPost
    });
  } catch (error) {
    console.error("Error creating scheduled post:", error);
    next(error);
  }
};

// @desc    Get user's scheduled posts
// @route   GET /api/dashboard/scheduled
export const getScheduledPosts = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const scheduledPosts = await ScheduledPost.find({ 
      userId,
      status: { $in: ['scheduled', 'processing'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: scheduledPosts.length,
      scheduledPosts
    });
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    next(error);
  }
};

// @desc    Delete/Cancel a scheduled post
// @route   DELETE /api/dashboard/scheduled/:id
export const deleteScheduledPost = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    const scheduledPost = await ScheduledPost.findById(id);
    if (!scheduledPost) {
      return res.status(404).json({ error: "Scheduled post not found." });
    }

    if (scheduledPost.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized operation." });
    }

    await ScheduledPost.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Scheduled post cancelled successfully."
    });
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    next(error);
  }
};

// Helper to extract date/time components in a specific timezone
const getPartsInTimezone = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const partValues = {};
  for (const part of parts) {
    partValues[part.type] = part.value;
  }
  return {
    year: Number(partValues.year),
    month: Number(partValues.month),
    day: Number(partValues.day),
    hour: Number(partValues.hour),
    minute: Number(partValues.minute)
  };
};

// Helper to determine if a daily post is due
const isDailyPostDue = (post, now = new Date()) => {
  const { dailyTime, timeZone, lastRun } = post;
  try {
    const currentLocal = getPartsInTimezone(now, timeZone);
    const [targetHours, targetMinutes] = dailyTime.split(':').map(Number);

    // Check if current local time is past the target publish time for today
    const isPastTargetTime = 
      currentLocal.hour > targetHours || 
      (currentLocal.hour === targetHours && currentLocal.minute >= targetMinutes);

    if (!isPastTargetTime) {
      return false;
    }

    // Check if it already ran today in the user's timezone
    if (lastRun) {
      const lastRunLocal = getPartsInTimezone(lastRun, timeZone);
      const isSameDay = 
        currentLocal.year === lastRunLocal.year &&
        currentLocal.month === lastRunLocal.month &&
        currentLocal.day === lastRunLocal.day;

      if (isSameDay) {
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Timezone comparison error:", err);
    return false;
  }
};

// @desc    Poll pending scheduled posts due to run
// @route   GET /api/dashboard/scheduled/pending
export const getPendingScheduledPosts = async (req, res, next) => {
  try {
    // Verify secret token to authenticate the source (n8n scheduler)
    const webhookSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    if (!webhookSecret || !expectedSecret || webhookSecret !== expectedSecret) {
      console.warn("🚨 Unauthorized attempt to poll scheduled posts!");
      return res.status(401).json({ error: "Unauthorized source." });
    }

    const now = new Date();

    // 1. Fetch all once-type posts that are scheduled and in the past/due
    const oncePosts = await ScheduledPost.find({
      scheduleType: 'once',
      status: 'scheduled',
      scheduledTime: { $lte: now }
    });

    // 2. Fetch all daily-type posts that are scheduled
    const dailyPosts = await ScheduledPost.find({
      scheduleType: 'daily',
      status: 'scheduled'
    });

    // Filter daily posts that are due to run now
    const dueDailyPosts = dailyPosts.filter(post => isDailyPostDue(post, now));

    const allDuePosts = [...oncePosts, ...dueDailyPosts];
    const results = [];

    for (const post of allDuePosts) {
      // Find the user's integration credentials for this platform
      const masterApp = await MasterApp.findOne({ iconKey: post.platform, isActive: true });
      if (!masterApp) {
        console.warn(`MasterApp not found or inactive for platform ${post.platform}`);
        continue;
      }

      const userIntegration = await Integration.findOne({
        userId: post.userId,
        appId: masterApp._id,
        authStatus: 'authorized'
      });

      if (!userIntegration) {
        console.warn(`User ${post.userId} has no integration for platform ${post.platform}`);
        post.status = 'failed';
        await post.save();
        continue;
      }

      // Decrypt credentials
      let decryptedCredentials;
      try {
        decryptedCredentials = decrypt(
          userIntegration.encryptedData,
          userIntegration.iv,
          userIntegration.authTag,
          true
        );
        if (post.platform === 'twitter') {
          // Twitter token refresh if needed
          decryptedCredentials = await refreshTwitterTokenIfNeeded(userIntegration, decryptedCredentials);
        }
      } catch (err) {
        console.error(`Failed to decrypt credentials for user ${post.userId} / post ${post._id}`);
        post.status = 'failed';
        await post.save();
        continue;
      }

      // Create a PromptHistory record to track this execution
      const historyRecord = new PromptHistory({
        userId: post.userId,
        title: post.prompt,
        inputPrompt: post.prompt,
        generatedContent: "",
        status: 'processing',
        platform: post.platform,
        attachments: post.attachments || []
      });
      await historyRecord.save();

      // Update ScheduledPost status to processing
      post.status = 'processing';
      post.historyRecordId = historyRecord._id;
      await post.save();

      results.push({
        scheduleId: post._id,
        recordId: historyRecord._id,
        prompt: post.prompt,
        platform: post.platform,
        userId: post.userId,
        attachments: post.attachments || [],
        credentials: decryptedCredentials
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      posts: results
    });
  } catch (error) {
    console.error("Error polling scheduled posts:", error);
    next(error);
  }
};

// @desc    Backend cron/interval checking daemon execution loop
//          This polls pending database schedules and pushes them to your existing n8n webhooks
export const checkAndExecuteSchedules = async () => {
  try {
    const now = new Date();

    // 1. Fetch once-type posts due
    const oncePosts = await ScheduledPost.find({
      scheduleType: 'once',
      status: 'scheduled',
      scheduledTime: { $lte: now }
    });

    // 2. Fetch daily-type posts
    const dailyPosts = await ScheduledPost.find({
      scheduleType: 'daily',
      status: 'scheduled'
    });

    const dueDailyPosts = dailyPosts.filter(post => isDailyPostDue(post, now));
    const allDuePosts = [...oncePosts, ...dueDailyPosts];

    if (allDuePosts.length === 0) return;

    console.log(`⏰ Found ${allDuePosts.length} scheduled posts due for execution.`);

    for (const post of allDuePosts) {
      // Find the user's integration credentials
      const masterApp = await MasterApp.findOne({ iconKey: post.platform, isActive: true });
      if (!masterApp) {
        console.warn(`MasterApp not found for platform ${post.platform}`);
        continue;
      }

      const userIntegration = await Integration.findOne({
        userId: post.userId,
        appId: masterApp._id,
        authStatus: 'authorized'
      });

      if (!userIntegration) {
        console.warn(`User integration missing for platform ${post.platform}`);
        post.status = 'failed';
        await post.save();
        continue;
      }

      // Decrypt credentials
      let decryptedCredentials;
      try {
        decryptedCredentials = decrypt(
          userIntegration.encryptedData,
          userIntegration.iv,
          userIntegration.authTag,
          true
        );
        if (post.platform === 'twitter') {
          decryptedCredentials = await refreshTwitterTokenIfNeeded(userIntegration, decryptedCredentials);
        }
      } catch (err) {
        console.error(`Decryption failed for scheduled post ${post._id}`);
        post.status = 'failed';
        await post.save();
        continue;
      }

      // Create PromptHistory record
      const historyRecord = new PromptHistory({
        userId: post.userId,
        title: post.prompt,
        inputPrompt: post.prompt,
        generatedContent: "",
        status: 'processing',
        platform: post.platform,
        attachments: post.attachments || []
      });
      await historyRecord.save();

      // Update ScheduledPost state
      post.status = 'processing';
      post.historyRecordId = historyRecord._id;
      await post.save();

      // Resolve n8n webhook URL
      const workflowWebhookMap = {
        linkedin: process.env.N8N_LINKEDIN_WEBHOOK_URL,
        twitter: process.env.N8N_TWITTER_WEBHOOK_URL,
        instagram: process.env.N8N_INSTAGRAM_WEBHOOK_URL
      };

      const targetWebhookUrl = workflowWebhookMap[post.platform];
      if (!targetWebhookUrl) {
        console.error(`No webhook URL configured for platform ${post.platform}`);
        historyRecord.status = 'failed';
        await historyRecord.save();
        post.status = 'failed';
        await post.save();
        continue;
      }

      console.log(`🚀 Dispatching scheduled post ${post._id} to n8n webhook: ${targetWebhookUrl}`);

      // Fire async request to user's existing n8n webhook workflow
      fetch(targetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: post.prompt, 
          userId: post.userId, 
          strategy: post.scheduleType,
          recordId: historyRecord._id, 
          attachments: post.attachments || [], 
          credentials: decryptedCredentials 
        })
      }).catch(err => {
        console.error(`🚨 Error pushing scheduled post to n8n:`, err.message);
      });
    }
  } catch (error) {
    console.error("🚨 Error in checkAndExecuteSchedules daemon loop:", error);
  }
};

// @desc    Get LinkedIn OAuth 2.0 authorization URL
// @route   GET /api/dashboard/integrations/linkedin/oauth-url
export const getLinkedinOauthUrl = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const client_id = process.env.LINKEDIN_CLIENT_ID;
    const redirect_uri = process.env.LINKEDIN_REDIRECT_URI;

    if (!client_id || !redirect_uri) {
      return res.status(500).json({ error: "LinkedIn OAuth settings are not configured on the server." });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Persist temporary authentication state in DB
    await TempOauthState.create({
      state,
      codeVerifier,
      userId
    });

    const scope = 'w_member_social openid profile email';
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    res.status(200).json({ success: true, url: authUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    LinkedIn OAuth 2.0 Callback handler URL
// @route   GET /api/dashboard/integrations/linkedin/callback
export const getLinkedinOauthCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (error) {
      console.warn("⚠️ LinkedIn OAuth access denied by user:", error);
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=missing_params`);
    }

    // Lookup corresponding PKCE session verifier
    const tempState = await TempOauthState.findOne({ state });
    if (!tempState) {
      console.error("🚨 LinkedIn state match not found or expired.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=session_expired`);
    }

    const client_id = process.env.LINKEDIN_CLIENT_ID;
    const client_secret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirect_uri = process.env.LINKEDIN_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
      console.error("🚨 LinkedIn OAuth keys are missing in environment.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=server_configuration_missing`);
    }

    // Exchange temporary code for access token
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id,
        client_secret
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("🚨 LinkedIn token exchange error:", errText);
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=token_exchange_failed`);
    }

    const tokenData = await response.json();

    // Query active LinkedIn profile parameters using OpenID Connect UserInfo
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    let profileName = "LinkedInUser";
    let profileId = "";

    if (userRes.ok) {
      const userData = await userRes.json();
      if (userData?.name) {
        profileName = userData.name;
      }
      if (userData?.sub) {
        profileId = userData.sub; // This is the unique profile ID
      }
    } else {
      const errText = await userRes.text();
      console.warn("⚠️ Failed to fetch LinkedIn user info:", errText);
    }

    if (!profileId) {
      console.error("🚨 Could not retrieve LinkedIn profile ID.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=profile_retrieval_failed`);
    }

    // Resolve MasterApp for LinkedIn
    const masterApp = await MasterApp.findOne({ iconKey: 'linkedin' });
    if (!masterApp) {
      console.error("🚨 LinkedIn master app configuration not found in DB.");
      return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=app_not_found`);
    }

    // Encrypt the connection data payload
    const credentialsPayload = {
      accessToken: tokenData.access_token,
      profileName: profileName,
      profileId: profileId
    };

    const cryptoPackage = encrypt(credentialsPayload);

    // Save integration
    await Integration.findOneAndUpdate(
      { userId: tempState.userId, appId: masterApp._id },
      {
        authStatus: 'authorized',
        profileName: profileName,
        encryptedData: cryptoPackage.encryptedData,
        iv: cryptoPackage.iv,
        authTag: cryptoPackage.authTag
      },
      { upsert: true }
    );

    // Clean up temporary state record
    await TempOauthState.deleteOne({ _id: tempState._id });

    console.log(`✅ Integration successfully saved for LinkedIn account ${profileName} (${profileId})`);
    return res.redirect(`${frontendUrl}/workspace?oauthStatus=success&platform=linkedin`);
  } catch (error) {
    console.error("🚨 Error in LinkedIn OAuth callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/workspace?oauthStatus=error&error=internal_server_error`);
  }
};
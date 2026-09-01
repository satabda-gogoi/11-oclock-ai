import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Performs semantic analysis on user prompt using Gemini via LangChain:
 * 1. Detects the intended target social platform (linkedin, twitter, instagram, general).
 * 2. Classifies the core intent (POST_CREATION, INSTANT_UPLOAD, SCHEDULE, GENERAL_CHAT, ANALYTICS, CONTENT_REWRITE).
 * 
 * @param {Object} params
 * @param {string} params.promptText - The prompt message from user
 * @param {string|null} params.explicitPlatform - Platform selected in UI (if any)
 * @param {boolean} params.isInstantAction - Whether instant upload button was clicked
 * @returns {Promise<{ platform: string, intent: string, topic: string, isDirectUploadRequested: boolean }>}
 */
export const analyzeAndRoutePrompt = async ({ promptText = "", explicitPlatform = null, isInstantAction = false }) => {
  const text = promptText ? promptText.trim() : "";

  // If user explicitly clicked the instant upload button
  if (isInstantAction) {
    const platform = explicitPlatform ? explicitPlatform.toLowerCase() : "linkedin";
    return {
      platform: platform === "general" ? "linkedin" : platform,
      intent: "INSTANT_UPLOAD",
      topic: text ? text.slice(0, 50) : "Instant Upload",
      isDirectUploadRequested: true
    };
  }

  // Fast path for empty text with attachments
  if (!text) {
    return {
      platform: explicitPlatform ? explicitPlatform.toLowerCase() : "linkedin",
      intent: "INSTANT_UPLOAD",
      topic: "Direct Media Dispatch",
      isDirectUploadRequested: true
    };
  }

  // Fallback if Gemini key is missing
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. Defaulting to general heuristic fallback.");
    let detectedPlatform = explicitPlatform ? explicitPlatform.toLowerCase() : "general";
    const lower = text.toLowerCase();
    if (!explicitPlatform) {
      if (lower.includes("linkedin") || lower.includes("in post")) detectedPlatform = "linkedin";
      else if (lower.includes("twitter") || lower.includes("tweet") || lower.includes(" x post") || lower.includes("on x")) detectedPlatform = "twitter";
      else if (lower.includes("instagram") || lower.includes("insta ") || lower.includes("reel")) detectedPlatform = "instagram";
    }

    const isUpload = lower.includes("upload") || lower.includes("publish now") || lower.includes("post now") || lower.includes("post this");
    return {
      platform: detectedPlatform,
      intent: isUpload ? "INSTANT_UPLOAD" : (detectedPlatform === "general" ? "GENERAL_CHAT" : "POST_CREATION"),
      topic: text.slice(0, 60),
      isDirectUploadRequested: isUpload
    };
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
    });

    const systemPrompt = `You are an AI router for a social media management platform.
Analyze the user prompt and extract:
1. "platform": One of ["linkedin", "twitter", "instagram", "general"].
   - If the user explicitly asks for LinkedIn (or mentions LinkedIn, connections, professional network), output "linkedin".
   - If the user asks for Twitter/X (or mentions tweet, thread, x.com, 280 chars), output "twitter".
   - If the user asks for Instagram (or mentions ig, reels, captions), output "instagram".
   - If NO specific platform is mentioned or if it is a general writing/brainstorming question, output "general".
2. "intent": One of ["POST_CREATION", "INSTANT_UPLOAD", "SCHEDULE", "GENERAL_CHAT", "ANALYTICS", "CONTENT_REWRITE"].
   - INSTANT_UPLOAD: User explicitly says to upload, publish now, post immediately, or share directly to a social account.
   - SCHEDULE: User asks to schedule for a specific time or daily.
   - CONTENT_REWRITE: User provides an existing text/code and asks to polish/rewrite/optimize.
   - ANALYTICS: User asks for stats, views, or metrics.
   - GENERAL_CHAT: General advice, brainstorming, or non-platform specific ideas.
   - POST_CREATION: User asks to write a new post/draft.
3. "topic": A concise 3-6 word title summarizing the user prompt.

Return ONLY a valid JSON object with keys "platform", "intent", and "topic". No markdown, no code block wrapper, no explanation.`;

    const userMessage = explicitPlatform 
      ? `Explicit platform chosen in UI: ${explicitPlatform}\nUser prompt: ${text}` 
      : `User prompt: ${text}`;

    const response = await model.invoke([
      ["system", systemPrompt],
      ["user", userMessage]
    ]);

    let raw = response.content.trim();
    if (raw.startsWith("```json")) {
      raw = raw.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (raw.startsWith("```")) {
      raw = raw.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(raw);
    const resolvedPlatform = explicitPlatform 
      ? explicitPlatform.toLowerCase() 
      : (parsed.platform ? parsed.platform.toLowerCase() : "general");

    const validIntents = ["POST_CREATION", "INSTANT_UPLOAD", "SCHEDULE", "GENERAL_CHAT", "ANALYTICS", "CONTENT_REWRITE"];
    const resolvedIntent = validIntents.includes(parsed.intent) ? parsed.intent : "POST_CREATION";

    return {
      platform: resolvedPlatform,
      intent: resolvedIntent,
      topic: parsed.topic || text.slice(0, 50),
      isDirectUploadRequested: resolvedIntent === "INSTANT_UPLOAD"
    };

  } catch (error) {
    console.error("🚨 Error during semantic routing analysis:", error);
    return {
      platform: explicitPlatform ? explicitPlatform.toLowerCase() : "general",
      intent: explicitPlatform ? "POST_CREATION" : "GENERAL_CHAT",
      topic: text.slice(0, 50),
      isDirectUploadRequested: false
    };
  }
};

/**
 * Generates direct high-performing social media content via Gemini without requiring n8n webhooks.
 * Used for general requests, offline drafts, or paused platforms (like Twitter/X).
 * 
 * @param {Object} params
 * @param {string} params.promptText - The prompt
 * @param {string} params.platform - 'general' | 'linkedin' | 'twitter' | 'instagram'
 * @param {boolean} params.isTwitterPaused - Whether to include the Twitter development notice
 * @returns {Promise<string>}
 */
export const generateDirectContent = async ({ promptText, platform = "general", isTwitterPaused = false }) => {
  if (!process.env.GEMINI_API_KEY) {
    return `Here is a drafted social post based on your prompt:\n\n${promptText}\n\n💡 Tip: Connect your accounts in the sidebar for 1-click publishing!`;
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.7,
    });

    let systemInstruction = `You are a world-class AI social media copywriter and growth expert.
Write an engaging, high-performing post based on the user's prompt.
- Use clear spacing, strong hooks, concise paragraphs, and relevant hashtags where appropriate.
- Keep formatting clean and readable on mobile and desktop feeds.`;

    if (platform === "linkedin") {
      systemInstruction += `\n- Tailor for LinkedIn: Strong opening hook, insightful takeaways, professional yet authentic tone, strategic line-breaks, and 3-5 relevant hashtags.`;
    } else if (platform === "twitter") {
      systemInstruction += `\n- Tailor for Twitter(X): Concise punchy tweets or a numbered 2-3 tweet thread. Keep each tweet under 280 characters with punchy formatting.`;
    }

    const response = await model.invoke([
      ["system", systemInstruction],
      ["user", promptText]
    ]);

    let content = response.content.trim();

    if (isTwitterPaused || platform === "twitter") {
      const notice = `ℹ️ **Note: Twitter (X) automated 1-click posting is temporarily in development.**\n*Your tweet/thread has been crafted below so you can easily copy and post it manually:*\n\n---\n\n`;
      content = notice + content;
    }

    return content;

  } catch (error) {
    console.error("🚨 Error during direct Gemini content generation:", error);
    return `Here is a drafted post for your request:\n\n${promptText}\n\n#socialmedia #growth`;
  }
};

/**
 * Backward-compatible single intent classifier
 */
export const classifyUserIntent = async (promptText) => {
  const result = await analyzeAndRoutePrompt({ promptText });
  return result.intent;
};

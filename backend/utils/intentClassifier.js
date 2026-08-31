import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Classifies a user prompt to determine if they want standard creation,
 * instant upload/publishing, analytics lookup, or a content rewrite.
 * 
 * @param {string} promptText - The user prompt to classify
 * @returns {Promise<string>} The intent key: 'POST_CREATION', 'INSTANT_UPLOAD', 'ANALYTICS', or 'CONTENT_REWRITE'
 */
export const classifyUserIntent = async (promptText) => {
  if (!promptText || promptText.trim() === "") {
    return "INSTANT_UPLOAD";
  }

  // Fallback if Gemini key is missing
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. Defaulting intent to POST_CREATION.");
    return "POST_CREATION";
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0,
    });

    const systemPrompt = `You are a helper that classifies user intents. Categorize the user prompt into exactly one of these strings:
- POST_CREATION: User wants to write/generate a new draft post, thread, hook, or outline. (e.g. "Write a post about react")
- INSTANT_UPLOAD: User explicitly wants to upload, post, or publish instantly/immediately without revisions. (e.g. "Post this now to LinkedIn", "Upload this text", "Publish immediately")
- ANALYTICS: User asks for stats, views, metrics, or performance updates. (e.g. "How did my last post do?")
- CONTENT_REWRITE: User pastes text/code and asks to improve, rewrite, polish, or optimize it. (e.g. "Rewrite this draft")

Respond with ONLY one of the exact words: POST_CREATION, INSTANT_UPLOAD, ANALYTICS, or CONTENT_REWRITE. Do not include markdown, explanation, or punctuation.`;

    const response = await model.invoke([
      ["system", systemPrompt],
      ["user", promptText]
    ]);

    const intent = response.content.trim().toUpperCase();
    
    // Validate output
    const validIntents = ["POST_CREATION", "INSTANT_UPLOAD", "ANALYTICS", "CONTENT_REWRITE"];
    if (validIntents.includes(intent)) {
      return intent;
    }
    
    // Check substring match as a fallback
    for (const valid of validIntents) {
      if (intent.includes(valid)) return valid;
    }

    return "POST_CREATION";
  } catch (error) {
    console.error("🚨 Error during intent classification:", error);
    return "POST_CREATION";
  }
};

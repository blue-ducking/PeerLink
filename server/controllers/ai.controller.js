const db = require('../config/database');

/**
 * AI Assistant extension point controller.
 * Responsibilities:
 * - Extension point for Teammate 5
 * - Inspects if an AI provider API key is present
 * - Transparently reports unconfigured state without faking AI responses
 * - Connects natural language queries to underlying SQL database truth
 */
async function queryAssistant(req, res, next) {
  try {
    const { prompt } = req.body;
    const hasApiKey = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please describe what you need help with.'
      });
    }

    if (!hasApiKey) {
      // Intentional transparent extension point (as specified in Section 22)
      return res.status(200).json({
        success: true,
        configured: false,
        message: 'The AI Assistant integration is currently in prototype mode. External LLM API key (e.g., GEMINI_API_KEY) is not yet configured in .env. Teammate 5 will implement the live LLM prompt pipeline.',
        data: {
          prompt: prompt.trim(),
          sourceOfTruth: 'PeerLink MySQL Service Database',
          extensionOwner: 'Member 5 (AI Lead)',
          suggestedKeywords: prompt.trim().split(/\s+/).filter(w => w.length > 3)
        }
      });
    }

    // When configured by Teammate 5:
    return res.status(200).json({
      success: true,
      configured: true,
      message: 'AI Provider is active.',
      data: { prompt: prompt.trim(), matches: [] }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  queryAssistant
};

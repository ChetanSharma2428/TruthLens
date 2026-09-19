import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let genAI = null;
if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

// Extracts viral claim text, platform, and category from a screenshot buffer using Gemini Vision
export async function extractClaimFromImage({ buffer, mimetype = 'image/jpeg' }) {
  if (!genAI) {
    // Graceful fallback when Gemini key is not configured
    return {
      text: 'Viral claim extracted from uploaded screenshot. (Configure GEMINI_API_KEY for automatic multimodal OCR extraction)',
      platform: 'WHATSAPP',
      category: 'OTHER',
      isAiPowered: false,
      note: 'Demo OCR fallback: set GEMINI_API_KEY in backend/.env to activate Gemini vision extraction.'
    };
  }

  try {
    const candidateModels = [
      env.GEMINI_MODEL,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest'
    ].filter(Boolean);

    const prompt = `You are an expert fact-checking intake assistant. Analyze this screenshot of a social media post, WhatsApp forward, tweet, or viral headline.
Extract the core viral assertion or claim being propagated.
Do NOT include UI artifacts like 'Forwarded many times', battery level, chat names, or status bars.
Determine the source platform from visual cues (WhatsApp green bubbles, Twitter/X checkmarks/handles, Instagram story UI, or Other).
Classify the subject category into POLITICS, HEALTH, FINANCE, or OTHER.

Respond ONLY with a valid JSON object matching this schema:
{
  "text": "The exact viral claim text",
  "platform": "WHATSAPP | X | INSTAGRAM | OTHER",
  "category": "POLITICS | HEALTH | FINANCE | OTHER"
}`;

    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: mimetype
      }
    };

    let responseText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imagePart]);
        responseText = result?.response?.text();
        if (responseText) break;
      } catch (modelErr) {
        lastError = modelErr;
        console.warn(`[Gemini Vision] Model ${modelName} encountered error: ${modelErr.message}. Trying next candidate...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from Gemini vision models.');
    }

    // Clean JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.text || '',
        platform: ['WHATSAPP', 'X', 'INSTAGRAM', 'OTHER', 'FACEBOOK', 'YOUTUBE'].includes(parsed.platform) ? parsed.platform : 'OTHER',
        category: ['POLITICS', 'HEALTH', 'FINANCE', 'OTHER'].includes(parsed.category) ? parsed.category : 'OTHER',
        isAiPowered: true
      };
    }

    return {
      text: responseText.trim(),
      platform: 'OTHER',
      category: 'OTHER',
      isAiPowered: true
    };
  } catch (error) {
    console.warn('[Gemini Vision Warning] Fallback triggered:', error.message);
    return {
      text: 'Extracted viral message from image.',
      platform: 'WHATSAPP',
      category: 'OTHER',
      isAiPowered: false
    };
  }
}

// Generates semantic embedding using Gemini embedding model
export async function generateEmbedding(text) {
  if (!genAI || !text) return null;

  const candidateModels = [
    env.GEMINI_EMBEDDING_MODEL,
    'gemini-embedding-001',
    'gemini-embedding-2'
  ].filter(Boolean);

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      if (result?.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn(`[Gemini Embedding] Model ${modelName} error: ${err.message}. Trying next candidate...`);
    }
  }
  return null;
}

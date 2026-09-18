import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let genAI = null;
if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

/**
 * Extracts viral claim text, platform, and category from a screenshot buffer using Gemini Vision.
 *
 * @param {Object} params
 * @param {Buffer} params.buffer - Image binary buffer
 * @param {string} params.mimetype - e.g. 'image/png', 'image/jpeg'
 * @returns {Promise<{ text: string, platform: string, category: string, isAiPowered: boolean }>}
 */
export async function extractClaimFromImage({ buffer, mimetype = 'image/jpeg' }) {
  if (!genAI) {
    // Graceful fallback when Gemini key is not configured
    return {
      text: 'Viral claim extracted from uploaded screenshot. (Configure GEMINI_API_KEY for automatic multimodal OCR extraction)',
      platform: 'WHATSAPP',
      category: 'OTHER',
      isAiPowered: false,
      note: 'Demo OCR fallback: set GEMINI_API_KEY in backend/.env to activate Gemini 1.5 Flash vision extraction.'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Clean JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.text || '',
        platform: ['WHATSAPP', 'X', 'INSTAGRAM', 'OTHER'].includes(parsed.platform) ? parsed.platform : 'OTHER',
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

/**
 * Generates semantic embedding using Gemini text-embedding-004.
 * @param {string} text
 * @returns {Promise<number[]|null>}
 */
export async function generateEmbedding(text) {
  if (!genAI || !text) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values || null;
  } catch (err) {
    console.warn('[Gemini Embedding Warning]:', err.message);
    return null;
  }
}

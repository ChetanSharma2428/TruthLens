import { Claim } from '../models/Claim.js';
import { generateEmbedding } from './geminiService.js';

/**
 * Tokenizes text into normalized word set.
 * @param {string} text
 * @returns {Set<string>}
 */
function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/**
 * Computes Jaccard Similarity coefficient between two texts.
 * @param {string} textA
 * @param {string} textB
 * @returns {number} Value between 0.0 and 1.0
 */
export function computeTextSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Checks if a submitted text is a duplicate or near-duplicate of an existing claim in MongoDB.
 *
 * @param {string} text
 * @returns {Promise<{ isDuplicate: boolean, similarity: number, matchedClaim: Object|null }>}
 */
export async function checkDuplicateClaim(text) {
  if (!text || text.trim().length < 5) {
    return { isDuplicate: false, similarity: 0, matchedClaim: null };
  }

  const cleanText = text.trim();
  const words = [...tokenize(cleanText)];

  // 1. Fetch potential candidates from MongoDB using keyword regex
  let candidates = [];
  if (words.length > 0) {
    const topWords = words.slice(0, 5);
    const regexQueries = topWords.map((w) => ({ text: { $regex: w, $options: 'i' } }));
    candidates = await Claim.find({ $or: regexQueries }).limit(20);
  }

  // Fallback: If no candidate matched, grab the 20 most recent claims
  if (candidates.length === 0) {
    candidates = await Claim.find().sort({ submittedAt: -1 }).limit(20);
  }

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const candidate of candidates) {
    const sim = computeTextSimilarity(cleanText, candidate.text);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      bestMatch = candidate;
    }
  }

  // Threshold: 0.45 or higher is considered a near duplicate
  const isDuplicate = highestSimilarity >= 0.45;

  return {
    isDuplicate,
    similarity: Math.round(highestSimilarity * 100),
    matchedClaim: isDuplicate && bestMatch
      ? {
          id: bestMatch.id,
          text: bestMatch.text,
          status: bestMatch.status,
          category: bestMatch.category,
          platform: bestMatch.platform,
          submittedAt: bestMatch.submittedAt
        }
      : null
  };
}

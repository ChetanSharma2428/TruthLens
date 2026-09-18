/**
 * TruthLens Deterministic Risk Engine
 *
 * Evaluates submitted claim text and source attribution against
 * deterministic heuristic rules. Risk signals indicate viral urgency patterns,
 * NOT factual truth.
 */

export const RISK_FLAGS = {
  SENSATIONAL: 'SENSATIONAL',
  SHOUTING: 'SHOUTING',
  UNSOURCED: 'UNSOURCED'
};

export const RISK_LEVELS = {
  HIGH: 'HIGH',
  NORMAL: 'NORMAL'
};

const SENSATIONAL_PATTERNS = [
  /\bbreaking\b/i,
  /\bshocking\b/i,
  /share\s+before\s+deleted/i
];

/**
 * Checks if claim text contains sensational urgency trigger terms.
 * @param {string} text
 * @returns {boolean}
 */
export function checkSensational(text) {
  if (!text || typeof text !== 'string') return false;
  return SENSATIONAL_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Checks if more than 50% of the alphabetic characters are uppercase (shouting).
 * Ignores numbers, punctuation, emojis, and whitespace.
 * @param {string} text
 * @returns {boolean}
 */
export function checkShouting(text) {
  if (!text || typeof text !== 'string') return false;
  
  // Extract alphabetic characters
  const alphaChars = text.match(/[a-zA-Z]/g);
  if (!alphaChars || alphaChars.length === 0) return false;

  const upperChars = text.match(/[A-Z]/g) || [];
  const upperRatio = upperChars.length / alphaChars.length;

  return upperRatio > 0.5;
}

/**
 * Checks if the claim is unsourced (missing or empty source URL).
 * @param {string|null|undefined} sourceUrl
 * @returns {boolean}
 */
export function checkUnsourced(sourceUrl) {
  if (!sourceUrl) return true;
  if (typeof sourceUrl !== 'string') return true;
  return sourceUrl.trim().length === 0;
}

/**
 * Evaluates all risk signals and computes overall risk level.
 * Rule: 2 or more flags => HIGH risk level.
 *
 * @param {Object} input
 * @param {string} input.text - The claim text
 * @param {string|null} [input.sourceUrl] - The optional source URL
 * @returns {{ flags: string[], riskLevel: string }}
 */
export function analyzeRisk({ text = '', sourceUrl = null } = {}) {
  const flags = [];

  if (checkSensational(text)) {
    flags.push(RISK_FLAGS.SENSATIONAL);
  }

  if (checkShouting(text)) {
    flags.push(RISK_FLAGS.SHOUTING);
  }

  if (checkUnsourced(sourceUrl)) {
    flags.push(RISK_FLAGS.UNSOURCED);
  }

  const riskLevel = flags.length >= 2 ? RISK_LEVELS.HIGH : RISK_LEVELS.NORMAL;

  return {
    flags,
    riskLevel
  };
}

import crypto from 'crypto';
import { cacheGet, cacheSet } from '../config/redis.js';

// TruthLens Deterministic Risk Engine: Evaluates claim text against deterministic heuristic rules

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
  { label: 'breaking', regex: /\bbreaking\b/i },
  { label: 'shocking', regex: /\bshocking\b/i },
  { label: 'share before deleted', regex: /share\s+before\s+deleted/i }
];

// Checks if claim text contains sensational urgency trigger terms
export function checkSensational(text) {
  if (!text || typeof text !== 'string') return false;
  return SENSATIONAL_PATTERNS.some((p) => p.regex.test(text));
}

// Checks sensational keywords with detailed matched keyword list
export function checkSensationalWithDetails(text) {
  if (!text || typeof text !== 'string') {
    return { isSensational: false, matchedKeywords: [] };
  }

  const matchedKeywords = [];
  for (const item of SENSATIONAL_PATTERNS) {
    if (item.regex.test(text)) {
      matchedKeywords.push(item.label);
    }
  }

  return {
    isSensational: matchedKeywords.length > 0,
    matchedKeywords
  };
}

// Checks if more than 50% of alphabetic characters are uppercase (shouting)
export function checkShouting(text) {
  if (!text || typeof text !== 'string') return false;
  
  const alphaChars = text.match(/[a-zA-Z]/g);
  if (!alphaChars || alphaChars.length === 0) return false;

  const upperChars = text.match(/[A-Z]/g) || [];
  const upperRatio = upperChars.length / alphaChars.length;

  return upperRatio > 0.5;
}

// Checks shouting with detailed character and ratio breakdown
export function checkShoutingWithDetails(text) {
  if (!text || typeof text !== 'string') {
    return {
      isShouting: false,
      upperRatio: 0,
      uppercasePercent: 0,
      upperCount: 0,
      totalAlpha: 0
    };
  }

  const alphaChars = text.match(/[a-zA-Z]/g) || [];
  if (alphaChars.length === 0) {
    return {
      isShouting: false,
      upperRatio: 0,
      uppercasePercent: 0,
      upperCount: 0,
      totalAlpha: 0
    };
  }

  const upperChars = text.match(/[A-Z]/g) || [];
  const upperRatio = upperChars.length / alphaChars.length;
  const uppercasePercent = Math.round(upperRatio * 100);

  return {
    isShouting: upperRatio > 0.5,
    upperRatio: Number(upperRatio.toFixed(3)),
    uppercasePercent,
    upperCount: upperChars.length,
    totalAlpha: alphaChars.length
  };
}

// Checks if the claim is unsourced (missing or empty source URL)
export function checkUnsourced(sourceUrl) {
  if (!sourceUrl) return true;
  if (typeof sourceUrl !== 'string') return true;
  return sourceUrl.trim().length === 0;
}

// Checks source attribution with details
export function checkUnsourcedWithDetails(sourceUrl) {
  const isUnsourced = checkUnsourced(sourceUrl);
  return {
    isUnsourced,
    hasSource: !isUnsourced
  };
}

// Evaluates all risk signals and computes overall risk level (2+ flags = HIGH)
export function analyzeRisk({ text = '', sourceUrl = null } = {}) {
  const flags = [];

  const sensationalDetails = checkSensationalWithDetails(text);
  if (sensationalDetails.isSensational) {
    flags.push(RISK_FLAGS.SENSATIONAL);
  }

  const shoutingDetails = checkShoutingWithDetails(text);
  if (shoutingDetails.isShouting) {
    flags.push(RISK_FLAGS.SHOUTING);
  }

  const unsourcedDetails = checkUnsourcedWithDetails(sourceUrl);
  if (unsourcedDetails.isUnsourced) {
    flags.push(RISK_FLAGS.UNSOURCED);
  }

  const riskLevel = flags.length >= 2 ? RISK_LEVELS.HIGH : RISK_LEVELS.NORMAL;

  return {
    flags,
    riskLevel,
    metrics: {
      uppercaseRatio: shoutingDetails.upperRatio,
      uppercasePercent: shoutingDetails.uppercasePercent,
      detectedKeywords: sensationalDetails.matchedKeywords,
      hasSource: unsourcedDetails.hasSource,
      riskScore: flags.length
    }
  };
}

// Computes deterministic hash for caching risk analysis results
export function getRiskCacheKey(text = '', sourceUrl = '') {
  const normalized = `${(text || '').trim()}||${(sourceUrl || '').trim()}`;
  return `risk:${crypto.createHash('sha256').update(normalized).digest('hex')}`;
}

// Evaluates risk with Redis caching layer or memory fallback
export async function analyzeRiskWithCache({ text = '', sourceUrl = null }, ttlSeconds = 3600) {
  const cacheKey = getRiskCacheKey(text, sourceUrl);
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return {
      ...cached,
      fromCache: true
    };
  }

  const result = analyzeRisk({ text, sourceUrl });
  await cacheSet(cacheKey, result, ttlSeconds);

  return {
    ...result,
    fromCache: false
  };
}

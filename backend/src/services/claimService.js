import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { analyzeRisk } from './riskAnalyzer.js';
import { AppError } from '../utils/AppError.js';
import { cacheGet, cacheSet } from '../config/redis.js';

/**
 * Creates a new claim with authoritative server-calculated risk analysis.
 * Initial status is strictly UNVERIFIED.
 *
 * @param {Object} claimData
 * @param {string} claimData.text
 * @param {string} claimData.platform
 * @param {string} claimData.category
 * @param {string|null} claimData.sourceUrl
 * @returns {Promise<Object>} The created claim document
 */
export async function createClaim({ text, platform, category, sourceUrl, imageUrl = null }) {
  // Execute deterministic risk analysis with detailed metrics
  const { flags, riskLevel, metrics } = analyzeRisk({ text, sourceUrl });

  const claim = await Claim.create({
    text,
    platform,
    category,
    sourceUrl,
    imageUrl,
    flags,
    riskLevel,
    riskMetrics: metrics,
    status: 'UNVERIFIED',
    reviewerNote: null,
    reviewerSessionId: null,
    submittedAt: new Date(),
    reviewedAt: null
  });

  return claim;
}

/**
 * Fetches public claims feed with filtering, sorting, and pagination.
 * DP1: Default sort is Newest First (submittedAt DESC).
 * DP2: Unverified claims are returned transparently.
 *
 * @param {Object} params
 * @returns {Promise<Object>} Claims array and pagination metadata
 */
export async function getClaimsFeed({
  category = 'ALL',
  status = 'ALL',
  sort = 'newest',
  visibility = 'ALL',
  search = '',
  page = 1,
  limit = 20
} = {}) {
  const normCategory = category ? category.toUpperCase() : 'ALL';
  const normStatus = status ? status.toUpperCase() : 'ALL';
  const normVisibility = visibility ? visibility.toUpperCase() : 'ALL';
  const cleanSearch = (search || '').trim();

  // Try Redis cache first (TTL: 30 seconds for live feeds)
  const cacheKey = `feed:${normCategory}:${normStatus}:${sort}:${normVisibility}:${cleanSearch}:${page}:${limit}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true
    };
  }

  const query = {};

  // Category filter
  if (normCategory !== 'ALL') {
    query.category = normCategory;
  }

  // Status filter & DP2 Visibility
  if (normStatus !== 'ALL') {
    query.status = normStatus;
  } else if (normVisibility === 'VERIFIED_ONLY') {
    query.status = { $ne: 'UNVERIFIED' };
  }

  // Keyword search across claim text and reviewer notes
  if (cleanSearch.length > 0) {
    query.$or = [
      { text: { $regex: cleanSearch, $options: 'i' } },
      { reviewerNote: { $regex: cleanSearch, $options: 'i' } }
    ];
  }

  // DP1 Sort order
  let sortOption = { submittedAt: -1 }; // Default newest first
  if (sort === 'oldest') {
    sortOption = { submittedAt: 1 };
  } else if (sort === 'highest_risk') {
    sortOption = { riskLevel: 1, submittedAt: -1 }; // 'HIGH' precedes 'NORMAL' alphabetically
  } else if (sort === 'status') {
    sortOption = { status: 1, reviewedAt: -1, submittedAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [claims, total] = await Promise.all([
    Claim.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Claim.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  const result = {
    claims,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasMore: pageNum < totalPages
    },
    decisionPoints: {
      dp1_feedOrder: sort,
      dp2_visibility: normVisibility
    }
  };

  // Cache feed results for 30 seconds
  await cacheSet(cacheKey, result, 30);

  return {
    ...result,
    fromCache: false
  };
}

/**
 * Retrieves a single claim by its ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getClaimById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid claim ID format: '${id}'`, 400, 'INVALID_ID');
  }

  const claim = await Claim.findById(id);
  if (!claim) {
    throw new AppError('Claim not found.', 404, 'CLAIM_NOT_FOUND');
  }

  return claim;
}

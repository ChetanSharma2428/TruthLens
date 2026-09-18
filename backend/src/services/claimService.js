import mongoose from 'mongoose';
import { Claim } from '../models/Claim.js';
import { analyzeRisk } from './riskAnalyzer.js';
import { AppError } from '../utils/AppError.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../config/redis.js';

// Creates a new claim with risk analysis (initial status: UNVERIFIED)
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

  // Invalidate feed and platform stats caches
  await Promise.all([
    cacheDelPattern('feed:*'),
    cacheDel('truthlens:platform_stats')
  ]).catch(() => {});

  return claim;
}

// Fetches public claims feed with filtering, sorting (DP1), visibility (DP2), and pagination
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

  const [rawClaims, total] = await Promise.all([
    Claim.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Claim.countDocuments(query)
  ]);

  const claims = rawClaims.map((c) => ({
    ...c,
    id: c._id.toString()
  }));

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

// Retrieves a single claim by its ID with related claims and audit trail
export async function getClaimById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid claim ID format: '${id}'`, 400, 'INVALID_ID');
  }

  const cacheKey = `claim:detail:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true
    };
  }

  const claim = await Claim.findById(id).lean();
  if (!claim) {
    throw new AppError('Claim not found.', 404, 'CLAIM_NOT_FOUND');
  }
  claim.id = claim._id.toString();

  // Fetch related claims in the same subject category with lean projection
  const rawRelated = await Claim.find({
    _id: { $ne: claim._id },
    category: claim.category
  })
    .sort({ submittedAt: -1 })
    .limit(3)
    .select('text category platform status riskLevel flags submittedAt')
    .lean();

  const relatedClaims = rawRelated.map((r) => ({
    ...r,
    id: r._id.toString()
  }));

  // Build immutable audit trail timeline (DP3)
  const auditTimeline = [
    {
      step: 1,
      event: 'CLAIM_SUBMITTED',
      timestamp: claim.submittedAt,
      label: 'Community Claim Submitted',
      description: `Reported circulating on ${claim.platform} under category ${claim.category}. Core text permanently immutable (DP3).`
    },
    {
      step: 2,
      event: 'RISK_TRIAGED',
      timestamp: claim.submittedAt,
      label: 'Deterministic Heuristic Scan',
      description: (claim.flags || []).length === 0
        ? 'Zero automated virality flags triggered. Evaluated as Normal Risk.'
        : `Triggered ${(claim.flags || []).join(', ')} (${claim.riskLevel} Risk triage state).`
    }
  ];

  if (claim.status !== 'UNVERIFIED' && claim.reviewedAt) {
    auditTimeline.push({
      step: 3,
      event: 'VERDICT_ASSIGNED',
      timestamp: claim.reviewedAt,
      label: 'Human Editorial Verdict',
      description: `Fact-checker verified claim as ${claim.status.replace('_', ' ')}. ${claim.evidenceUrl ? 'Official evidence citation attached.' : ''}`
    });
  }

  const claimData = {
    ...claim,
    relatedClaims,
    auditTimeline
  };

  // Cache claim detail record for 60 seconds
  await cacheSet(cacheKey, claimData, 60);

  return {
    ...claimData,
    fromCache: false
  };
}

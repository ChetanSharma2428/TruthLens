import mongoose from 'mongoose';
import { connectDB } from './db.js';
import { Claim } from '../models/Claim.js';
import { analyzeRisk } from '../services/riskAnalyzer.js';

const initialClaims = [
  {
    text: 'BREAKING!!! CENTRAL BANK WILL FREEZE ALL DOMESTIC TRANSFERS TOMORROW MORNING! SHARE BEFORE DELETED!',
    platform: 'WHATSAPP',
    category: 'FINANCE',
    sourceUrl: null,
    status: 'UNVERIFIED'
  },
  {
    text: 'SHOCKING REPORT: CANCER CURE SUPPRESSED BY PHARMA DISCOVERED IN COMMON GARDEN HERB!',
    platform: 'INSTAGRAM',
    category: 'HEALTH',
    sourceUrl: null,
    status: 'UNVERIFIED'
  },
  {
    text: 'Ministry of Education announces revised semester examination timetable for technical universities.',
    platform: 'OTHER',
    category: 'POLITICS',
    sourceUrl: 'https://education.gov.in/circulars/2026/09',
    status: 'UNVERIFIED'
  },
  {
    text: 'BREAKING: NASA CONFIRMS THREE DAYS OF COMPLETE TOTAL DARKNESS STARTING THIS FRIDAY!',
    platform: 'X',
    category: 'OTHER',
    sourceUrl: null,
    status: 'FALSE',
    reviewerNote: 'NASA officials and planetary scientists confirmed no such solar or orbital event exists. This is a recurring viral hoax circulating since 2012.',
    reviewedAt: new Date(Date.now() - 4 * 3600 * 1000)
  },
  {
    text: 'World Health Organization updates official dietary guidelines for sodium reduction.',
    platform: 'X',
    category: 'HEALTH',
    sourceUrl: 'https://who.int/news/item/2026/sodium-guidelines',
    status: 'VERIFIED_TRUE',
    reviewerNote: 'Substantiated by primary documentation published directly in the WHO health guidelines repository.',
    reviewedAt: new Date(Date.now() - 12 * 3600 * 1000)
  },
  {
    text: 'SHOCKING NEW RULE: ALL CITIZEN BANK ACCOUNTS TO FACE MANDATORY 40% WITHDRAWAL LEVY!',
    platform: 'WHATSAPP',
    category: 'FINANCE',
    sourceUrl: null,
    status: 'MISLEADING',
    reviewerNote: 'The Ministry issued a circular concerning high-frequency offshore speculative funds, not citizen retail bank deposits. The claim strips essential context to generate alarm.',
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000)
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding editorial claims...');

    await Claim.deleteMany({});

    for (let i = 0; i < initialClaims.length; i++) {
      const item = initialClaims[i];
      const { flags, riskLevel, metrics } = analyzeRisk({ text: item.text, sourceUrl: item.sourceUrl });

      await Claim.create({
        ...item,
        flags,
        riskLevel,
        riskMetrics: metrics,
        submittedAt: new Date(Date.now() - (initialClaims.length - i) * 3600 * 1000)
      });
    }

    console.log(`[Seed] Successfully seeded ${initialClaims.length} realistic editorial claims.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
}

seed();

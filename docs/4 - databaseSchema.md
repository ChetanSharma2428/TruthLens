# TruthLens — Database Schema & Data Models

## 1. Primary Collection: `claims`

TruthLens uses a single authoritative collection: `claims`. Public citizens submit claims without authentication; human reviewers authenticate via server-side session cookies.

---

## 2. Complete Mongoose Schema (`Claim.js`)

```javascript
import mongoose from 'mongoose';

export const PLATFORMS = ['WHATSAPP', 'X', 'INSTAGRAM', 'OTHER'];
export const CATEGORIES = ['POLITICS', 'HEALTH', 'FINANCE', 'OTHER'];
export const STATUSES = ['UNVERIFIED', 'VERIFIED_TRUE', 'FALSE', 'MISLEADING'];
export const FLAGS = ['SENSATIONAL', 'SHOUTING', 'UNSOURCED'];
export const RISK_LEVELS = ['HIGH', 'NORMAL'];

const claimSchema = new mongoose.Schema(
  {
    // 1. Core Submitted Content (Permanently Immutable - DP3)
    text: {
      type: String,
      required: [true, 'Claim text is required'],
      trim: true,
      minlength: [5, 'Claim text must be at least 5 characters'],
      maxlength: [1000, 'Claim text cannot exceed 1000 characters']
    },
    platform: {
      type: String,
      required: [true, 'Source platform is required'],
      enum: {
        values: PLATFORMS,
        message: 'Invalid platform. Allowed: WHATSAPP, X, INSTAGRAM, OTHER'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category. Allowed: POLITICS, HEALTH, FINANCE, OTHER'
      }
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: null
    },

    // 2. Multimodal & Semantic Similarity Fields
    imageUrl: {
      type: String,
      trim: true,
      default: null // Cloudinary secure CDN URL of uploaded screenshot
    },
    embedding: {
      type: [Number],
      select: false,
      default: undefined // Vector embedding for Atlas Vector Search duplicate detection
    },

    // 3. Automated Deterministic Triage Signals (Authoritative Server Generated)
    flags: {
      type: [
        {
          type: String,
          enum: FLAGS
        }
      ],
      default: []
    },
    riskLevel: {
      type: String,
      enum: RISK_LEVELS,
      default: 'NORMAL'
    },
    riskMetrics: {
      type: {
        uppercaseRatio: { type: Number, default: 0 },
        uppercasePercent: { type: Number, default: 0 },
        detectedKeywords: { type: [String], default: [] },
        hasSource: { type: Boolean, default: false },
        riskScore: { type: Number, default: 0 }
      },
      default: undefined
    },

    // 4. Human Editorial Verdict (Updated only via Reviewer Workflow)
    status: {
      type: String,
      enum: STATUSES,
      default: 'UNVERIFIED'
    },
    reviewerNote: {
      type: String,
      trim: true,
      default: null
    },
    evidenceUrl: {
      type: String,
      trim: true,
      default: null // Official primary evidence reference citation
    },
    reviewerSessionId: {
      type: String,
      default: null // Audit attribution token
    },

    // 5. Audit Provenance Timestamps
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes supporting feed, filter, and reviewer queue queries
claimSchema.index({ submittedAt: -1 });
claimSchema.index({ status: 1, submittedAt: -1 });
claimSchema.index({ category: 1, status: 1, submittedAt: -1 });

export const Claim = mongoose.model('Claim', claimSchema);
```

---

## 3. Database Indexes

| Index Specification | Purpose | Query Optimization |
|---|---|---|
| `{ submittedAt: -1 }` | DP1 Default Feed Ordering | Accelerates chronological queries (`sort=newest`). |
| `{ status: 1, submittedAt: -1 }` | Reviewer Queue & Status Filter | Accelerates queries filtering for `UNVERIFIED` claims. |
| `{ category: 1, status: 1, submittedAt: -1 }` | Multi-dimensional Feed Filtering | Accelerates combined category and status filtering. |

---

## 4. State Lifecycle & Transitions

```text
               +-----------------------------+
               |     CITIZEN SUBMISSION      |
               |  Flags calculated by engine |
               |     Status: UNVERIFIED      |
               +--------------+--------------+
                              |
                              | Human Fact-Checker Investigation
                              | (One-way authoritative transition)
                              v
             +----------------+----------------+
             |                                 |
             v                                 v
    +-----------------+               +-----------------+
    |  VERIFIED_TRUE  |               |      FALSE      |
    +-----------------+               +-----------------+
             |
             v
    +-----------------+
    |   MISLEADING    |
    +-----------------+
```

* **Transition Rule:** A claim can transition from `UNVERIFIED` to `VERIFIED_TRUE`, `FALSE`, or `MISLEADING` **once**. Repeated reviews or direct edits to verified claims are strictly rejected (`400 INVALID_STATUS_TRANSITION`) to preserve fact-checking audit integrity (DP3).

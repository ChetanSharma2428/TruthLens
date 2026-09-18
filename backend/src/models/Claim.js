import mongoose from 'mongoose';

export const PLATFORMS = ['WHATSAPP', 'X', 'INSTAGRAM', 'OTHER'];
export const CATEGORIES = ['POLITICS', 'HEALTH', 'FINANCE', 'OTHER'];
export const STATUSES = ['UNVERIFIED', 'VERIFIED_TRUE', 'FALSE', 'MISLEADING'];
export const FLAGS = ['SENSATIONAL', 'SHOUTING', 'UNSOURCED'];
export const RISK_LEVELS = ['HIGH', 'NORMAL'];

const claimSchema = new mongoose.Schema(
  {
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
    imageUrl: {
      type: String,
      trim: true,
      default: null
    },
    embedding: {
      type: [Number],
      select: false,
      default: undefined
    },
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
      default: null
    },
    reviewerSessionId: {
      type: String,
      default: null
    },
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

// High-Performance Indexes supporting feed, filter, text search, and reviewer queues
claimSchema.index({ submittedAt: -1 });
claimSchema.index({ status: 1, submittedAt: -1 });
claimSchema.index({ category: 1, status: 1, submittedAt: -1 });
claimSchema.index({ platform: 1, status: 1, submittedAt: -1 });
claimSchema.index({ riskLevel: 1, submittedAt: -1 });
claimSchema.index({ reviewedAt: -1 });
claimSchema.index({ status: 1, reviewedAt: -1 });
claimSchema.index({ text: 'text' });

export const Claim = mongoose.model('Claim', claimSchema);

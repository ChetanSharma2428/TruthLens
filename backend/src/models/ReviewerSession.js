import mongoose from 'mongoose';

const reviewerSessionSchema = new mongoose.Schema(
  {
    sessionTokenHash: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically removes expired sessions
    }
  },
  {
    timestamps: true
  }
);

export const ReviewerSession = mongoose.model('ReviewerSession', reviewerSessionSchema);

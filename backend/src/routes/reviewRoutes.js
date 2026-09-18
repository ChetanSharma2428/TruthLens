import express from 'express';
import {
  handleGetPendingReviews,
  handleSubmitReview,
  handleResearchAssistance,
  handleLockClaim,
  handleUnlockClaim
} from '../controllers/reviewController.js';
import { requireReviewer } from '../middleware/reviewerMiddleware.js';
import { validateSubmitReview } from '../validators/reviewValidator.js';

const router = express.Router();

// All review routes strictly require authenticated reviewer session
router.use(requireReviewer);

router.get('/pending', handleGetPendingReviews);
router.get('/:claimId/research-assistance', handleResearchAssistance);
router.post('/:claimId/lock', handleLockClaim);
router.post('/:claimId/unlock', handleUnlockClaim);
router.post('/:claimId', validateSubmitReview, handleSubmitReview);

export default router;

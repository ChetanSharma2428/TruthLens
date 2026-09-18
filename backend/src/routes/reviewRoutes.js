import express from 'express';
import {
  handleGetPendingReviews,
  handleSubmitReview
} from '../controllers/reviewController.js';
import { requireReviewer } from '../middleware/reviewerMiddleware.js';
import { validateSubmitReview } from '../validators/reviewValidator.js';

const router = express.Router();

// All review routes strictly require authenticated reviewer session
router.use(requireReviewer);

router.get('/pending', handleGetPendingReviews);
router.post('/:claimId', validateSubmitReview, handleSubmitReview);

export default router;

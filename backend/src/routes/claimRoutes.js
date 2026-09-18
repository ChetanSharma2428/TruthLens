import express from 'express';
import {
  handleCreateClaim,
  handleGetClaims,
  handleGetClaimById,
  handleSuggestCategory
} from '../controllers/claimController.js';
import { validateCreateClaim } from '../validators/claimValidator.js';

const router = express.Router();

router.post('/suggest-category', handleSuggestCategory);

router.route('/')
  .post(validateCreateClaim, handleCreateClaim)
  .get(handleGetClaims);

router.route('/:id')
  .get(handleGetClaimById);

export default router;

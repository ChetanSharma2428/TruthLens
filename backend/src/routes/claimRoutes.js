import express from 'express';
import {
  handleCreateClaim,
  handleGetClaims,
  handleGetClaimById
} from '../controllers/claimController.js';
import { validateCreateClaim } from '../validators/claimValidator.js';

const router = express.Router();

router.route('/')
  .post(validateCreateClaim, handleCreateClaim)
  .get(handleGetClaims);

router.route('/:id')
  .get(handleGetClaimById);

export default router;

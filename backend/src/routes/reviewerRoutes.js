import express from 'express';
import {
  handleAccess,
  handleCheckAuth,
  handleLogout
} from '../controllers/reviewerController.js';

const router = express.Router();

router.post('/access', handleAccess);
router.get('/me', handleCheckAuth);
router.post('/logout', handleLogout);

export default router;

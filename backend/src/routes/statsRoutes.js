import express from 'express';
import { handleGetStats } from '../controllers/statsController.js';

const router = express.Router();

// GET /api/stats - Public live platform statistics
router.get('/', handleGetStats);

export default router;

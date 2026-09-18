import express from 'express';
import multer from 'multer';
import {
  handleCreateClaim,
  handleGetClaims,
  handleGetClaimById,
  handleSuggestCategory,
  handleCheckDuplicate,
  handleExtractFromImage
} from '../controllers/claimController.js';
import { validateCreateClaim } from '../validators/claimValidator.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files (PNG, JPEG, WEBP) are allowed for screenshot OCR.', 400, 'INVALID_FILE_TYPE'), false);
    }
  }
});

// Feature 1 Enhancements
router.post('/suggest-category', handleSuggestCategory);
router.post('/check-duplicate', handleCheckDuplicate);
router.post('/extract-from-image', upload.single('screenshot'), handleExtractFromImage);

// Core CRUD Endpoints
router.route('/')
  .post(validateCreateClaim, handleCreateClaim)
  .get(handleGetClaims);

router.route('/:id')
  .get(handleGetClaimById);

export default router;

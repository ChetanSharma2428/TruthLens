import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truthlens',
  REVIEWER_ACCESS_CODE: process.env.REVIEWER_ACCESS_CODE || 'TRUTHLENS-DEMO-2026',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  SESSION_SECRET: process.env.SESSION_SECRET || 'truthlens_demo_session_secret_key_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || null,
  REDIS_URL: process.env.REDIS_URL || null,
  isProduction: process.env.NODE_ENV === 'production'
};

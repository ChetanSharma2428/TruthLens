import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truthlens',
  REVIEWER_ACCESS_CODE: process.env.REVIEWER_ACCESS_CODE || 'TRUTHLENS-DEMO-2026',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  SESSION_SECRET: process.env.SESSION_SECRET || 'truthlens_demo_session_secret_key_2026',
  isProduction: process.env.NODE_ENV === 'production'
};

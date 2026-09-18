/**
 * Simple structured console logger for TruthLens backend
 */
export const logger = {
  info: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${msg}`, ...args);
    }
  },
  warn: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${msg}`, ...args);
    }
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${msg}`, ...args);
  }
};

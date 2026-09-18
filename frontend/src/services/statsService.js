import api from './api';

let cachedStats = null;
let lastStatsFetch = 0;
let pendingPromise = null;
const STATS_TTL = 15000; // 15 seconds client cache

// Fetches live platform statistics from MongoDB with client deduplication and TTL caching
export async function fetchPlatformStats(force = false) {
  const now = Date.now();
  if (!force && cachedStats && (now - lastStatsFetch < STATS_TTL)) {
    return cachedStats;
  }

  // Deduplicate inflight requests
  if (pendingPromise) {
    return pendingPromise;
  }

  pendingPromise = (async () => {
    try {
      const res = await api.get('/stats');
      if (res.data?.data) {
        cachedStats = res.data.data;
        lastStatsFetch = Date.now();
        return cachedStats;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
      if (cachedStats) return cachedStats;
      return null;
    } finally {
      pendingPromise = null;
    }
  })();

  return pendingPromise;
}

import api from './api';

export async function submitReviewerCode(code) {
  const response = await api.post('/reviewer/access', { code });
  return response.data.data;
}

export async function checkReviewerSession() {
  const response = await api.get('/reviewer/me');
  return response.data.data;
}

export async function logoutReviewer() {
  const response = await api.post('/reviewer/logout');
  return response.data.data;
}

export async function fetchPendingReviews(params = {}) {
  const response = await api.get('/reviews/pending', { params });
  return response.data.data;
}

export async function submitClaimReview(claimId, { verdict, note, evidenceUrl }) {
  const response = await api.post(`/reviews/${claimId}`, { verdict, note, evidenceUrl });
  return response.data.data;
}

export async function lockClaim(claimId) {
  const response = await api.post(`/reviews/${claimId}/lock`);
  return response.data.data;
}

export async function unlockClaim(claimId) {
  const response = await api.post(`/reviews/${claimId}/unlock`);
  return response.data.data;
}

export async function fetchResearchAssistance(claimId) {
  const response = await api.get(`/reviews/${claimId}/research-assistance`);
  return response.data.data;
}

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

export async function fetchPendingReviews() {
  const response = await api.get('/reviews/pending');
  return response.data.data;
}

export async function submitClaimReview(claimId, { verdict, note }) {
  const response = await api.post(`/reviews/${claimId}`, { verdict, note });
  return response.data.data;
}

export async function fetchResearchAssistance(claimId) {
  const response = await api.get(`/reviews/${claimId}/research-assistance`);
  return response.data.data;
}

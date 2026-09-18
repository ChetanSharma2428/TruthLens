import api from './api';

export async function fetchClaims({
  category = 'ALL',
  status = 'ALL',
  sort = 'newest',
  page = 1,
  limit = 20
} = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (status && status !== 'ALL') params.append('status', status);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const response = await api.get(`/claims?${params.toString()}`);
  return response.data.data;
}

export async function fetchClaimById(id) {
  const response = await api.get(`/claims/${id}`);
  return response.data.data;
}

export async function submitClaim(claimData) {
  const response = await api.post('/claims', claimData);
  return response.data.data;
}

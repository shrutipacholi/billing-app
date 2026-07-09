const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

export const api = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getBills: (userId) => request(`/bills/${userId}`),

  saveBill: (userId, billData) =>
    request(`/bills/${userId}`, {
      method: 'POST',
      body: JSON.stringify(billData),
    }),

  deleteBill: (userId, billId) =>
    request(`/bills/${userId}/${billId}`, { method: 'DELETE' }),
};

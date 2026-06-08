const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request gagal');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  categories: {
    list: () => request('/categories'),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
  },
  menus: {
    list: (active = true) => request(`/menus?active=${active}`),
    create: (data) => request('/menus', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/menus/${id}`, { method: 'DELETE' })
  },
  transactions: {
    list: () => request('/transactions'),
    create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' })
  },
  reports: {
    daily: (date) => request(`/reports/daily?date=${date}`),
    exportUrl: (start, end) => `${API_BASE}/reports/export?start=${start}&end=${end}`
  }
};

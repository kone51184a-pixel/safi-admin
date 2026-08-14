const BASE_URL = 'https://safi-backend.onrender.com/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export const api = {
  login: (phone, password) => request('/auth/login', { method: 'POST', body: { phone, password } }),

  getVendors: (token) => request('/vendors', { token }),
  createVendor: (token, vendor) => request('/vendors', { method: 'POST', body: vendor, token }),
  updateVendor: (token, id, vendor) => request(`/vendors/${id}`, { method: 'PUT', body: vendor, token }),
  deleteVendor: (token, id) => request(`/vendors/${id}`, { method: 'DELETE', token }),

  getProducts: (token) => request('/products', { token }),
  createProduct: (token, product) => request('/products', { method: 'POST', body: product, token }),
  updateProduct: (token, id, product) => request(`/products/${id}`, { method: 'PUT', body: product, token }),
  archiveProduct: (token, id) => request(`/products/${id}`, { method: 'DELETE', token }),
  adjustStock: (token, id, quantity_change, reason) => request(`/products/${id}/stock`, { method: 'PATCH', body: { quantity_change, reason }, token }),
  getStockMovements: (token) => request('/products/stock/movements', { token }),

  getOrders: (token) => request('/orders', { token }),
  getOrder: (token, id) => request(`/orders/${id}`, { token }),
  updateOrderStatus: (token, id, patch) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: patch, token }),

  getClients: (token) => request('/users', { token }),
  toggleClientActive: (token, id) => request(`/users/${id}/toggle-active`, { method: 'PATCH', token }),
  getRoles: (token) => request('/users/roles', { token }),
  updateRole: (token, id, permissions) => request(`/users/roles/${id}`, { method: 'PATCH', body: permissions, token }),

  getDeliverers: (token) => request('/deliverers', { token }),
  createDeliverer: (token, deliverer) => request('/deliverers', { method: 'POST', body: deliverer, token }),
  updateDeliverer: (token, id, deliverer) => request(`/deliverers/${id}`, { method: 'PATCH', body: deliverer, token }),
  deleteDeliverer: (token, id) => request(`/deliverers/${id}`, { method: 'DELETE', token }),

  getCategories: (token) => request('/categories', { token }),

  getSettings: (token) => request('/settings', { token }),
  updateSetting: (token, key, value) => request(`/settings/${key}`, { method: 'PATCH', body: { value }, token }),

  getProducers: (token) => request('/producers', { token }),
  createProducer: (token, producer) => request('/producers', { method: 'POST', body: producer, token }),
  updateProducer: (token, id, producer) => request(`/producers/${id}`, { method: 'PUT', body: producer, token }),
  deleteProducer: (token, id) => request(`/producers/${id}`, { method: 'DELETE', token }),

  getReviews: (token) => request('/reviews', { token }),
};

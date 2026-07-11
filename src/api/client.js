const BASE_URL = 'http://localhost:5000/api';

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

  getProducts: (token) => request('/products', { token }),
  createProduct: (token, product) => request('/products', { method: 'POST', body: product, token }),
  updateProduct: (token, id, product) => request(`/products/${id}`, { method: 'PUT', body: product, token }),
  adjustStock: (token, id, quantity_change, reason) => request(`/products/${id}/stock`, { method: 'PATCH', body: { quantity_change, reason }, token }),
  getStockMovements: (token) => request('/products/stock/movements', { token }),

  getOrders: (token) => request('/orders', { token }),
  getOrder: (token, id) => request(`/orders/${id}`, { token }),
  updateOrderStatus: (token, id, status, deliverer_id) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: { status, deliverer_id }, token }),

  getClients: (token) => request('/users', { token }),
  toggleClientActive: (token, id) => request(`/users/${id}/toggle-active`, { method: 'PATCH', token }),
  getRoles: (token) => request('/users/roles', { token }),
};

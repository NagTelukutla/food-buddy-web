import client from './client';

export const orderApi = {
  create: (data) => client.post('/api/orders', data),
  list: (params) => client.get('/api/orders', { params }),
  get: (id) => client.get(`/api/orders/${id}`),
  updateStatus: (id, status) => client.put(`/api/orders/${id}/status`, { status }),
  track: (orderId) => client.get(`/api/orders/track/${orderId}`),
};

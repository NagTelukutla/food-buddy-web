import client from './client';

export const menuApi = {
  list: (params) => client.get('/api/menu', { params }),
  get: (id) => client.get(`/api/menu/${id}`),
  create: (data) => client.post('/api/menu', data),
  update: (id, data) => client.put(`/api/menu/${id}`, data),
  delete: (id) => client.delete(`/api/menu/${id}`),
};

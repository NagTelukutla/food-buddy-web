import client from './client';

export const paymentApi = {
  getConfig: () => client.get('/api/payments/config'),
  checkout: (orderPayload) => client.post('/api/payments/checkout', { order: orderPayload }),
  verify: (data) => client.post('/api/payments/verify', data),
  markFailed: (data) => client.post('/api/payments/failed', data),
  list: (limit = 50) => client.get('/api/payments', { params: { limit } }),
};

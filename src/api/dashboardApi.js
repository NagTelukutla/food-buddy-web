import client from './client';

export const dashboardApi = {
  stats: () => client.get('/api/dashboard/stats'),
  revenue: (days = 7) => client.get('/api/dashboard/revenue', { params: { days } }),
  ordersByStatus: () => client.get('/api/dashboard/orders'),
  topItems: (limit = 10) => client.get('/api/dashboard/top-items', { params: { limit } }),
  customers: () => client.get('/api/dashboard/customers'),
};

import client from './client';

export const restaurantApi = {
  list: () => client.get('/api/restaurants'),
  get: (id) => client.get(`/api/restaurants/${id}`),
  onboard: (data) => client.post('/api/restaurants/onboard', data),
  branches: (id) => client.get(`/api/restaurants/${id}/branches`),
  createBranch: (restaurantId, data) => client.post(`/api/restaurants/${restaurantId}/branches`, data),
  update: (id, data) => client.put(`/api/restaurants/${id}`, data),
  getAdmins: (id) => client.get(`/api/restaurants/${id}/admins`),
  mapAdmins: (id, data) => client.put(`/api/restaurants/${id}/admins`, data),
};

export const usersApi = {
  list: () => client.get('/api/users'),
  create: (data) => client.post('/api/users', data),
  update: (id, data) => client.put(`/api/users/${id}`, data),
};

export const branchApi = {
  get: (id) => client.get(`/api/branches/${id}`),
  update: (id, data) => client.put(`/api/branches/${id}`, data),
};

export const customerApi = {
  register: (data) => client.post('/api/auth/register/customer', data),
  profile: () => client.get('/api/customers/me'),
  updateProfile: (data) => client.put('/api/customers/me', data),
  orders: () => client.get('/api/orders/my'),
  loyalty: () => client.get('/api/customers/me/loyalty'),
};

export const deliveryApi = {
  partners: (restaurantId) =>
    client.get('/api/delivery/partners', {
      params: restaurantId ? { restaurant_id: restaurantId } : undefined,
    }),
  createPartner: (data) => client.post('/api/delivery/partners', data),
  assign: (orderPk, data) => client.put(`/api/orders/${orderPk}/assign-delivery`, data),
  assignments: (params) => client.get('/api/delivery/assignments', { params }),
  report: () => client.get('/api/delivery/report'),
  accept: (orderId, coords = {}) =>
    client.post('/api/delivery/assignments/accept', { order_id: orderId, ...coords }),
  updateStatus: (orderId, data) =>
    client.post('/api/delivery/assignments/update-status', { order_id: orderId, ...data }),
  updateLocation: (data) => client.post('/api/delivery/location', data),
  updatePartnerLocation: (data) => client.post('/api/delivery/partner-location', data),
  liveTrack: (orderId) => client.get(`/api/delivery/live-track/${encodeURIComponent(orderId)}`),
};

export const campaignApi = {
  list: (restaurantId) => client.get('/api/campaigns', { params: { restaurant_id: restaurantId } }),
  active: (restaurantId) => client.get('/api/campaigns/active', { params: { restaurant_id: restaurantId } }),
  create: (data) => client.post('/api/campaigns', data),
  update: (id, data) => client.put(`/api/campaigns/${id}`, data),
};

export const reviewApi = {
  create: (data) => client.post('/api/reviews', data),
  list: (restaurantId) => client.get(`/api/reviews/restaurant/${restaurantId}`),
  respond: (id, data) => client.put(`/api/reviews/${id}/respond`, data),
};

export const platformApi = {
  stats: () => client.get('/api/admin/platform-stats'),
  settings: () => client.get('/api/admin/platform-settings'),
};

import client from './client';

export const authApi = {
  login: (username, password) =>
    client.post('/api/auth/login', { username, password }),
  register: (data) => client.post('/api/auth/register', data),
  refresh: (refreshToken) =>
    client.post('/api/auth/refresh', { refresh_token: refreshToken }),
  me: (accessToken) =>
    accessToken
      ? client.get('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      : client.get('/api/auth/me'),
};

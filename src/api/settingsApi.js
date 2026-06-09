import client from './client';

export const settingsApi = {
  get: () => client.get('/api/settings'),
};

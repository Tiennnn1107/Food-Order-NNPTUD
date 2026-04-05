import api from './axios';

const vouchersAPI = {
  getAll: () => api.get('/vouchers'),
  getById: (id) => api.get(`/vouchers/${id}`),
  check: (code) => api.post('/vouchers/check', { code }),
  create: (data) => api.post('/vouchers', data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  toggle: (id) => api.put(`/vouchers/${id}/toggle`),
  delete: (id) => api.delete(`/vouchers/${id}`),
};

export default vouchersAPI;
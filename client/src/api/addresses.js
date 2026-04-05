import api from './axios';

const addressesAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  setDefault: (id) => api.put(`/addresses/${id}/set-default`),
  delete: (id) => api.delete(`/addresses/${id}`),
};

export default addressesAPI;
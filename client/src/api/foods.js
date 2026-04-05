import api from './axios';

const foodsAPI = {
  getAll: (params) => api.get('/foods', { params }),
  getById: (id) => api.get(`/foods/${id}`),
  create: (data) => api.post('/foods', data),
  update: (id, data) => api.put(`/foods/${id}`, data),
  delete: (id) => api.delete(`/foods/${id}`),
  uploadImage: (id, formData) => api.post(`/foods/${id}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default foodsAPI;
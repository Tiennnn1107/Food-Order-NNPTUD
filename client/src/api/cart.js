import api from './axios';

const cartAPI = {
  get: () => api.get('/cart'),
  add: (foodId, quantity, note) => api.post('/cart/add', { foodId, quantity, note }),
  reduce: (foodId) => api.post('/cart/reduce', { foodId }),
  remove: (foodId) => api.post('/cart/remove', { foodId }),
  clear: () => api.post('/cart/clear'),
};

export default cartAPI;
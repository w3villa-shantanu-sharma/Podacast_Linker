import api from './base';

export const post_create-order = (data = {}) => api.post(`/create-order`, data);
export const post_verify = (data = {}) => api.post(`/verify`, data);

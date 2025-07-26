import api from './base';

export const get_mine = (data = {}) => api.get(`/mine`, );
export const post_create = (data = {}) => api.post(`/create`, data);
export const get_username = (params = {}, data = {}) => api.get(`/${params.username}`, );
export const post_track_username = (params = {}, data = {}) => api.post(`/track/${params.username}`, data);

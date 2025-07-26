import api from './base';

export const get_google = (data = {}) => api.get(`/google`, );
export const get_google_callback = (data = {}) => api.get(`/google/callback`, );
export const get_facebook = (data = {}) => api.get(`/facebook`, );
export const get_facebook_callback = (data = {}) => api.get(`/facebook/callback`, );

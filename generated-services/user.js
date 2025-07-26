import api from './base';

export const get_root = (data = {}) => api.get(`/`, );
export const get_id = (params = {}, data = {}) => api.get(`/${params.id}`, );
export const post_root = (data = {}) => api.post(`/`, data);
export const put_id = (params = {}, data = {}) => api.put(`/${params.id}`, data);
export const post_register = (data = {}) => api.post(`/register`, data);
export const get_verify-email_token = (params = {}, data = {}) => api.get(`/verify-email/${params.token}`, );
export const post_resend-verification = (data = {}) => api.post(`/resend-verification`, data);
export const post_login = (data = {}) => api.post(`/login`, data);
export const post_send-otp = (data = {}) => api.post(`/send-otp`, data);
export const post_verify-otp = (data = {}) => api.post(`/verify-otp`, data);
export const post_complete-profile = (data = {}) => api.post(`/complete-profile`, data);
export const post_resume-flow = (data = {}) => api.post(`/resume-flow`, data);

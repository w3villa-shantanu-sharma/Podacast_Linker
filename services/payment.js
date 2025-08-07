// services/payment.js
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api'; 

export const createOrder = async (amount) => {
  return axios.post(`${BASE_URL}/payment/create-order`, { amount });
};

export const verifyPayment = async (details) => {
  return axios.post(`${BASE_URL}/payment/verify`, details);
};

import axios from 'axios';
import { SERVER_ADDRESS } from '../config/config';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const checkVideoExists = async () => {
  const response = await axios.get(`http://${SERVER_ADDRESS}/api/videos/check-video-exists`);
  return response.data.exists;
};

export const fetchData = async () => {
  const response = await axios.get(`http://${SERVER_ADDRESS}/api/videos/fetch`);
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await axios.post(`http://${SERVER_ADDRESS}/api/auth/login`, { username, password });
  try {
    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Authorization error:", error);
    return false;
  }
}

export const registrationUser = async (username, password) => {
  const response = await axios.post(`http://${SERVER_ADDRESS}/api/auth/registration`, { username, password });

  const { token } = response.data;
  localStorage.setItem('token', token);
  return response.data;
}

export const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await axios.post(
      `http://${SERVER_ADDRESS}/api/auth/check-validation-token`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};

// Creates connection to backend API using Axios, and sets up an interceptor to include the JWT token in the Authorization header for all requests.

import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add a request interceptor to include the JWT token in the Authorization header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
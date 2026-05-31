// Creates connection to backend API using Axios, and sets up an interceptor to include the JWT token in the Authorization header for all requests.
import axios from 'axios';

const client = axios.create({ // The base URL for the API is taken from an environment variable, allowing for flexibility in different deployment environments.
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Add a request interceptor to include the JWT token in the Authorization header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) { // If a token is found in local storage, it is added to the Authorization header of the request in the format "Bearer <token
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// Export the configured Axios client as the default export of this module, allowing it to be imported and used in other parts of the application to make API requests.
export default client;
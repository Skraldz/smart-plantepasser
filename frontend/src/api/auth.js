// This module provides functions for user authentication, 
// including login and registration, by making HTTP requests to the corresponding API endpoints using the configured Axios client.
import client from './client';

// Function to log in a user by sending their email and password to the login API endpoint,
export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password,
  });

  return response.data;
}

// Function to register a new user by sending their email, password, and device secret to the registration API endpoint,
export async function register(
  email,
  password,
  deviceSecret
) {
  const response = await client.post(
    '/auth/register',
    {
      email,
      password,
    },
    {
      headers: {
        'X-Device-Secret': deviceSecret,
      },
    }
  );

  return response.data;
}
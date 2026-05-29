import client from './client';

export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password,
  });

  return response.data;
}

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
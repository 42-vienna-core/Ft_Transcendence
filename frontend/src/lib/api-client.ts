'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

interface CustomApiOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export async function apiFetch(endpoint: string, options: CustomApiOptions = {}) {
  const baseUrl = process.env.INTERNAL_API_URL
  const url = `${baseUrl}/${endpoint}`;

  const session = await getServerSession(authOptions);

  console.log(url);

  const headers = new Headers(options.headers);
  
  headers.set('Authorization',`Bearer ${session?.accessToken}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

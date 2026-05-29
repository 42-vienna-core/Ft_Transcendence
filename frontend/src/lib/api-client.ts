'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// When you want to fetch actual data (like a list of users or game statistics), 
// your code uses your custom apiFetch() wrapper. That wrapper grabs the 
// accessToken out of the NextAuth session and attaches it to the request 
// header so NestJS can validate it.

export async function apiFetch(path: string, init?: RequestInit) {
  const session = await getServerSession(authOptions);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${process.env.INTERNAL_API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message);
  }
  return res.json();
}
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

interface CustomApiOptions extends RequestInit {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    isRetry?: boolean; 
}

export async function apiFetch(endpoint: string, options: CustomApiOptions = {}): Promise<any> {
    console.log("========================apiFetch============================");
    const baseUrl = process.env.INTERNAL_API_URL;
    const url = `${baseUrl}/${endpoint}`;

    console.log(url);

    const session = await getServerSession(authOptions);
    console.log("SESSION: ",session);

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session?.accessToken}`);

    if (options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {...options, headers, cache: 'no-store' });

    let data: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text().catch(() => null);
    }

    if (!res.ok) {
        const errorMessage = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
    }

    return data;
}

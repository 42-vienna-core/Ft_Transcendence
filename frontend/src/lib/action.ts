'use server'

import { loginSchema, registerSchema } from '@/lib/schema'
// import { signin } from 'next-auth/react';

const url = process.env.INTERNAL_API_URL;

export async function fetchRegister(formData: FormData) {
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    const validateFilds = registerSchema.safeParse({username, email, password, confirmPassword});

    if (!validateFilds.success) {
        let message = "";
        validateFilds.error.issues.forEach(issue => {
            message = issue.message;
        })
        return {message: message, success: false};
    }

    const { confirmPassword: _c, ...registerData } = validateFilds.data;

    console.log(url);

    const response = await fetch(`${url}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(registerData)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.log(err);
        return {message: err?.message ?? 'Registration failed', success: false}
    }

    return {success: true};
}

export async function fatchLogin(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const validateFilds = loginSchema.safeParse({email, password});

    if (!validateFilds.success) {
        let message = "";
        validateFilds.error.issues.forEach(issue => {
            message = issue.message;
        })
        return {message: message, success: false};
    }

    return {success: true};
}

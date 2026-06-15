'use server'
import { changePasswordSchema, loginSchema, registerSchema } from '@/lib/schema'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

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

export async function fetchLogout() {

    try {

         await new Promise((resolve) => setTimeout(resolve, 4000));

        const session = await getServerSession(authOptions);
        if (!session?.error) return {success: true}

        await fetch(`${url}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json' 
            }
        });

        return {success: true}
    } catch (error) {
        console.log("Log out error: ", error);
    }

}

export async function fetchChangePassword (formData: FormData) {
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    console.log(oldPassword,newPassword,confirmPassword);

    const validateFilds = changePasswordSchema.safeParse({oldPassword, newPassword, confirmPassword});

    if (!validateFilds.success) {
        let message = "";
        validateFilds.error.issues.forEach(issue => {
            message = issue.message;
        })
        return {message: message, success: false};
    }

    return {success: true};
}

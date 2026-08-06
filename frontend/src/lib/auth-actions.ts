'use server'
import { changePasswordSchema, loginSchema, registerSchema } from '@/lib/schema'
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const url = process.env.INTERNAL_API_URL;

export async function fetchRegister(formData: FormData) {
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');

    const validateFilds = registerSchema.safeParse({username, email, password, passwordConfirm});

    if (!validateFilds.success) {
        return {message: "Invalid email or password. Please try again.", success: false};
    }

    const { passwordConfirm: _c, ...registerData } = validateFilds.data;

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
        return {message: "Invalid email or password. Please try again.", success: false};
    }

    return {success: true};
}

export async function fetchLogout() {

    try {

        const session = await getServerSession(authOptions);
        if (!session) return {success: false};

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

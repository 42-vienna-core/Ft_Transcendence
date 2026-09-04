"use client";

import { useRouter } from "next/navigation";
import { useActionState, startTransition } from "react";
import { AtSign, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { fatchLogin } from "@/lib/auth-actions";
import SubmitButton from "@/ui/submit-btn";
import { PasswordField } from "../password-field";
import { useTranslations, useLocale } from "next-intl";

const initialState = {
    message: "",
    success: false,
};

export default function LoginForm() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Login");

    const [state, formAction] = useActionState(
        async (_prevState: any, formData: FormData) => {
            const res = await fatchLogin(formData);
            if (!res.success) {
                return { success: false, message: res.message || "Invalid credentials" };
            }

            const loginResult = await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirect: false,
            });

            if (loginResult?.error) {
                return { success: false, message: "Login failed. Check your password." };
            }

            startTransition(() => {
                router.push(`/${locale}`);
                router.refresh();
            });

            return { success: true, message: "" };
        }, initialState);

    return (
        <form action={formAction} className="space-y-4">
            {/* Email */}
            <div className="relative">
                <input  className="peer w-full rounded-xl border border-border-default bg-bg-subtle/50 px-4 pt-5 pb-2 pr-11 text-base text-text-primary autofill:text-text-primary outline-none transition-colors duration-200 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent-soft"
                        required id="email" type="email" name="email" placeholder=" " autoComplete="on"
                />
                <label htmlFor="email"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
                >
                    {t("email")}
                </label>
                <AtSign className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors duration-200 peer-focus:text-accent" />
            </div>

            {/* Login Password */}
            <PasswordField
                id="login-password"
                name="password"
                label={t("password")}
            />

            {state?.message && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger-text">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{state.message}</p>
                </div>
            )}

            <div className="flex flex-col gap-4 pt-1">
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="flex items-center justify-center gap-2 rounded-2xl cursor-grab text-lg font-bold transition-all duration-600 p-3 bg-white text-gray-700  border border-gray-300 hover:bg-gray-100">
                    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    {t("google")}
                </a>
                <SubmitButton label={t("button")} loadingLabel={t("loading")} />
                <p className="text-center text-sm text-text-secondary">
                    {t("no_account")}{" "}
                    <button
                        type="button"
                        onClick={() => router.push(`/${locale}/register`)}
                        className="cursor-pointer font-semibold text-accent transition-colors duration-200 hover:text-accent-hover hover:underline"
                    >
                        {t("register_link")}
                    </button>
                </p>
                <button
                    type="button"
                    onClick={() => router.push(`/${locale}/reset-password`)}
                    className="mx-auto cursor-pointer text-sm text-text-tertiary transition-colors duration-200 hover:text-accent hover:underline"
                >
                    {t("forgot_password")}
                </button>
            </div>
        </form>
    );
}

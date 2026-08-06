"use client";

import { useRouter } from "next/navigation";
import { useActionState, startTransition, useState } from "react";
import { fetchRegister } from "@/lib/auth-actions";
import { signIn } from "next-auth/react";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, AtSign } from "lucide-react";
import SubmitButton from "@/ui/submit-btn";
import { PasswordField } from "../password-field";
import { useTranslations } from "next-intl";

const initialState = {
    message: "",
    success: false,
};

export default function RegisterForm() {
    const router = useRouter();
    const t = useTranslations("Register");
    

    const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {

        console.log(formData);
        const res = await fetchRegister(formData);
        if (!res.success) {
            return { success: false, message: res.message || "Registration failed" };
        }

        const registerResult = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });

        if (registerResult?.error) {
            return { success: false, message: "Account created, but automatic login failed." };
        }

        startTransition(() => {
            router.push("/");
            router.refresh();
        });

        return { success: true, message: "" };
  }, initialState);

    return (
        <form action={formAction} className="space-y-4">
            {/* Username */}
            <div className="relative w-full group">
                <input
                    required
                    id="username"
                    type="text"
                    name="username"
                    placeholder=""
                    className="peer w-full rounded-xl border border-border-default bg-bg-subtle/50 px-4 pt-5 pb-2 pr-11 text-base text-text-primary autofill:text-text-primary outline-none transition-colors duration-200 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent-soft"
                />
                <label
                    htmlFor="username"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
                >
                    {t("name")}
                </label>
                <User className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors duration-200 peer-focus:text-accent" />
            </div>

            {/* Email */}
            <div className="relative">
                <input
                    required
                    id="email"
                    type="email"
                    name="email"
                    placeholder=" "
                    className="peer w-full rounded-xl border border-border-default bg-bg-subtle/50 px-4 pt-5 pb-2 pr-11 text-base text-text-primary autofill:text-text-primary outline-none transition-colors duration-200 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent-soft"
                />
                <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
                >
                    {t("email")}
                </label>
                <AtSign className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors duration-200 peer-focus:text-accent" />
            </div>

            {/* Password */}
            <PasswordField 
                id="password" 
                name="password"
                label={t("password")}    
            />
                
            {/* Confirm Password */}
            <PasswordField 
                id="passwordConfirm" 
                name="passwordConfirm"
                label={t("confirm_password")}
            />
         
            {state?.message && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger-text">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{state.message}</p>
                </div>
            )}

            <div className="pt-2 space-y-4">
                <SubmitButton label={t("button")} loadingLabel={t("loading")}/>
            
                <div className="text-center text-sm text-neutral-500">
                    {t("have_account")}{" "}
                    <button
                        className="mx-auto cursor-pointer text-sm text-text-tertiary transition-colors duration-200 hover:text-accent hover:underline"
                        type="button"
                        onClick={() => router.push("/login")}
                    >
                        {t("login_link")}
                    </button>
                </div>
            </div>
        </form>
    );
}

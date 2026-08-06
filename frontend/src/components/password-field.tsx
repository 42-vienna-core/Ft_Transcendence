"use client";

import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

interface PasswordFieldProps {
    id: string;
    name: string;
    label: string;
}

export function PasswordField({ id, name, label}: PasswordFieldProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
        <input
                required
                id={id}
                type={isVisible ? "text" : "password"}
                name={name}
                placeholder=" "
                className="peer w-full rounded-xl border border-border-default bg-bg-subtle/50 px-4 pt-5 pb-2 pr-11 text-base text-text-primary outline-none transition-colors duration-200 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent-soft"
            />
            <label
                htmlFor={id}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-tertiary transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs"
            >
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsVisible((v) => !v)}
                aria-label={isVisible ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors duration-200 hover:text-accent"
            >
                {isVisible ? <Eye className="h-5 w-5" /> : <EyeClosed className="h-5 w-5" />}
            </button>
        </div>
    );
}

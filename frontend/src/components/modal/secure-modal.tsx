"use client";

import { fetchChangePassword } from "@/lib/actions/auth-actions";
import { apiFetch } from "@/lib/api-client";
import { State } from "@/lib/definitions";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialState: State = {
    message: "",
    success: false,
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [state, setState] = useState<State>(initialState);

    if (!isOpen) return null;

    const resetState = () => setState(prev => ({ ...prev, error: false, message: "" }));

    async function handleChangePassword(formData: FormData) {
        setState(prev => ({ ...prev, message: "" }));

        const resValidedData = await fetchChangePassword(formData);
        if (!resValidedData.success) {
            setState(prev => ({ ...prev, message: resValidedData.message }));
            console.log("Error: ", resValidedData.message);
            return;
        }

        const oldPass = formData.get("oldPassword");
        const newPass = formData.get("newPassword");
        try {
            await apiFetch("auth/change-password", {
                method: "POST",
                body: JSON.stringify({ old: oldPass, new: newPass }),
            });

            await signIn("credentials", {
                email: "qwerty@gmail.com",
                password: newPass,
            });
        } catch (error) {
            if (error instanceof Error) {
                setState(prev => ({ ...prev, message: error.message }));
                console.log(error.message);
            } else {
                console.log(error);
            }
            return;
        }

        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-overlay)] p-4 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 shadow-xl"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
            >
                <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-3 mb-4">
                    <h3
                        className="font-medium"
                        style={{ fontSize: "var(--text-lg)", color: "var(--color-text-primary)" }}
                    >
                        Change Password
                    </h3>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-[var(--radius-sm)] p-1 transition-colors"
                        style={{ color: "var(--color-text-secondary)" }}
                        onMouseOver={e => (e.currentTarget.style.background = "var(--color-bg-muted)")}
                        onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form action={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                        <label
                            className="block font-medium"
                            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
                        >
                            Old password
                        </label>
                        <input
                            name="oldPassword"
                            type="password"
                            onChange={resetState}
                            required
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[var(--color-text-primary)]"
                            style={{ fontSize: "var(--text-md)", color: "var(--color-text-primary)" }}
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            className="block font-medium"
                            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
                        >
                            New password
                        </label>
                        <input
                            name="newPassword"
                            type="password"
                            onChange={resetState}
                            required
                            placeholder="At least 8 characters"
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[var(--color-text-primary)]"
                            style={{ fontSize: "var(--text-md)", color: "var(--color-text-primary)" }}
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            className="block font-medium"
                            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
                        >
                            Re-enter your password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="The password must match"
                            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[var(--color-text-primary)]"
                            style={{ fontSize: "var(--text-md)", color: "var(--color-text-primary)" }}
                        />
                    </div>

                    <div className="h-4">
                        {state.message && (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-danger)" }}>
                                {state.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[var(--color-border-default)] pt-4 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-[var(--radius-md)] px-4 py-2 font-medium border border-[var(--color-border-default)] transition-colors"
                            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
                            onMouseOver={e => (e.currentTarget.style.background = "var(--color-bg-muted)")}
                            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="cursor-pointer rounded-[var(--radius-md)] px-4 py-2 font-medium border border-transparent transition-colors"
                            style={{
                                fontSize: "var(--text-sm)",
                                background: "var(--color-accent)",
                                color: "var(--color-text-inverse)",
                            }}
                            onMouseOver={e => (e.currentTarget.style.background = "var(--color-accent-hover)")}
                            onMouseOut={e => (e.currentTarget.style.background = "var(--color-accent)")}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

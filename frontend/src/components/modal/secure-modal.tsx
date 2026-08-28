"use client";

import { fetchChangePassword } from "@/lib/auth-actions";
import { apiFetch } from "@/lib/api-client";
import { State } from "@/lib/definitions";
import { useProfile } from "@/providers/ProfileContext";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, X } from "lucide-react";
import { PasswordField } from "../password-field";
import SubmitButton from "@/ui/submit-btn";
import ModalLayout from "./modal-layout";

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
    const { email } = useProfile();

    if (!isOpen) return null;

    async function handleChangePassword(formData: FormData) {
        setState(prev => ({ ...prev, message: "" }));

        const resValidedData = await fetchChangePassword(formData);
        if (!resValidedData.success) {
            setState(prev => ({ ...prev, message: resValidedData.message }));
            return;
        }

        const oldPass = formData.get("oldPassword");
        const newPass = formData.get("newPassword");
        try {
            await apiFetch("auth/change-password", {
                method: "POST",
                body: JSON.stringify({ old: oldPass, new: newPass }),
            });

            const signInResult = await signIn("credentials", {
                email,
                password: newPass,
                redirect: false,
            });

            if (signInResult?.error) {
                setState(prev => ({ ...prev, message: "Password changed, but re-login failed. Please sign in again." }));
                return;
            }
        } catch (error) {
            if (error instanceof Error) {
                setState(prev => ({ ...prev, message: error.message }));
            } else {
                setState(prev => ({ ...prev, message: "An unknown error occurred" }));
            }
            return;
        }

        toast.success("Your password has been changed.");
        onClose();
    }

    return (
        <ModalLayout>
            <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
                <h3 className="text-lg font-medium text-text-primary">
                    Change password
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-1 cursor-pointer rounded-md p-1.5 text-text-tertiary transition-colors duration-150 hover:bg-bg-muted hover:text-text-primary"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <form action={handleChangePassword} className="space-y-4">
                <PasswordField
                    id="oldPassword"
                    name="oldPassword"
                    label="Old password"
                />

                <PasswordField
                    id="newPassword"
                    name="newPassword"
                    label="New password"
                />

                <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Re-enter your password"
                />

                {state.message && (
                    <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger-text">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{state.message}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
                    <SubmitButton label="Save" loadingLabel="Saving..." />
                    <button
                        type="button"
                        onClick={onClose}
                        className="mx-auto cursor-pointer text-sm text-text-tertiary transition-colors duration-200 hover:text-accent hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </ModalLayout>
    );
}

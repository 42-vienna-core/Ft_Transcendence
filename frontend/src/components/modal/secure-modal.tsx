"use client";

import { fetchChangePassword } from "@/lib/auth-actions";
import { apiFetch } from "@/lib/api-client";
import { State } from "@/lib/definitions";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ModalLayout from "./modal-layout";
import ResetCode from "../reset/resetCode";
import { useTranslations } from "next-intl";


interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialState: State = {
    message: "",
    success: false,
}
interface changeType {
    email: string;
    password: string;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [state, setState] = useState<State>(initialState);
    const [code, setCode] =  useState<changeType | null>(null);
    const LN = useTranslations("Profile.settings.change");
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
            const res = await apiFetch("auth/change-password", {
                method: "POST",
                body: JSON.stringify({ old: oldPass, new: newPass }),
            });
            setCode({...res});
        } catch (error) {
            if (error instanceof Error) {
                setState(prev => ({ ...prev, message: LN("wakeP") }));
                console.log(error.message);
            } else {
                console.log(error);
            }
            return ;
        }
    }

  
    return (
            <ModalLayout>
                {code != null ? ( 
                            <div>
                                  <div className="flex items-center justify-between border-b ... pb-3 mb-4">
                                    <h3>{LN("resetMessage")}</h3>
                                    <button onClick={ () => {
                                        setCode(null);
                                        onClose()
                                    }} aria-label="Close">✕</button>
                                </div>
                                <ResetCode email={code.email} password={code.password}/>
                            </div>
                        ) :
                    (
                        <>
                            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-3 mb-4">
                                <h3
                                    className="font-medium"
                                    style={{ fontSize: "var(--text-lg)", color: "var(--color-text-primary)" }}
                                >
                                    {LN("changeP")}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="cursor-pointer rounded-[var(--radius-sm)] p-1 transition-colors"
                                    style={{ color: "var(--color-text-secondary)" }}
                                    onMouseOver={e => (e.currentTarget.style.background = "var(--color-bg-muted)")}
                                    onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                                    aria-label={LN("close")}
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
                                       {LN("OldP")}
                                    </label>
                                    <input
                                        autoComplete="off"
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
                                         {LN("NewP")}
                                    </label>
                                    <input
                                        autoComplete="off"
                                        name="newPassword"
                                        type="password"
                                        onChange={resetState}
                                        required
                                        placeholder={LN("placeholderAt")}
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[var(--color-text-primary)]"
                                        style={{ fontSize: "var(--text-md)", color: "var(--color-text-primary)" }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label
                                        className="block font-medium"
                                        style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}
                                    >
                                         {LN("re-enter")}
                                    </label>
                                    <input
                                        autoComplete="off"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        placeholder={LN("placeholderThe")}
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
                                        {LN("cancel")}
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
                                       {LN("save")}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) 
                }
            </ModalLayout>
        )
}

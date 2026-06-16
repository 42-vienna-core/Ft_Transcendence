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

export default function ChangePasswordModal({isOpen, onClose}:ChangePasswordModalProps) {
    const [state,  setState] = useState<State>(initialState);

    if (!isOpen) return null;

    const resetState = () => setState(prev => ({...prev,error: false, message: ""}));

    async function handleChangePassword(formData: FormData) {
        setState(prev => ({...prev, message: ""}));

        const resValidedData = await fetchChangePassword(formData);
        if (!resValidedData.success) {
            setState(prev => ({...prev, message: resValidedData.message}));
            console.log("Error: ", resValidedData.message);
            return;
        }

        const oldPass =  formData.get("oldPassword");
        const newPass =  formData.get("newPassword");
        try {
            await apiFetch("auth/change-password", {
                method: 'POST',
                body: JSON.stringify({
                    old: oldPass,
                    new: newPass
                })
            });

            await signIn('credentials', {
                email: "qwerty@gmail.com",
                password: newPass,
            })
        } catch (error) {
            if (error instanceof Error){
                setState(prev => ({...prev, message: error.message}));
                console.log(error.message);
            } else {
                console.log(error);
            }
            return;
        }

        onClose();
     }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-xl border border-[var(--color-border-main)] bg-[var(--bg-bright)] p-6 shadow-xl text-[var(--color-text-primary)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border-main)] pb-3 mb-4">
                    <h3 className="text-lg font-bold !text-[var(--color-text-secondary)]">Change Password</h3>
                    <button 
                        onClick={onClose}
                        className="cursor-pointer rounded-md p-1 hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-text-secondary)]"
                    >
                    <p className="text-blue-500">X</p>
                    </button>
                </div>

                <form action={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                            Old password
                        </label>
                        <div className="relative">
                            <input
                                name="oldPassword"
                                // type={showPassword ? 'text' : 'password'}
                                onChange={resetState}
                                required
                                className="w-full rounded-lg border border-[var(--color-border-main)] bg-transparent px-3 py-2.5 pr-10 text-[var(--color-text-size-base)] outline-none focus:border-[var(--color-text-primary)] transition-colors"
                            />
                            <button
                                type="button"
                                // onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)]"
                            >
                                {/* {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} */}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                name="newPassword"
                                // type={showPassword ? 'text' : 'password'}
                                onChange={resetState}
                                required
                                className="w-full rounded-lg border border-[var(--color-border-main)] bg-transparent px-3 py-2.5 pr-10 text-[var(--color-text-size-base)] outline-none focus:border-[var(--color-text-primary)] transition-colors"
                                placeholder="At least 8 characters"
                            />
                            <button
                                type="button"
                                // onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)]"
                            >
                                {/* {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} */}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                            Re-enter your password
                        </label>
                        <input
                            name="confirmPassword"
                            //   type={showPassword ? 'text' : 'password'}
                            //   value={confirmPassword}
                            //   onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[var(--color-border-main)] bg-transparent px-3 py-2.5 text-[var(--color-text-size-base)] outline-none focus:border-[var(--color-text-primary)] transition-colors"
                            placeholder="The password must match"
                        />
                    </div>
                    <div className="w-full h-3">
                        <p className="text-red-500">{state.message}</p>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-[var(--color-border-main)] pt-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium border border-[var(--color-border-main)] hover:bg-[var(--color-bg-hover)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="cursor-pointer rounded-lg bg-[var(--bg-bright)] px-4 py-2 text-sm font-medium text-[var(--color-bg-secondary)] border border-[var(--color-border-main)]"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
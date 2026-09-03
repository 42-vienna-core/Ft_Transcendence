import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";


import { useState } from "react";


export default function ResetCode({ email }: { email: string }) {

    const resetCode = useTranslations("Reset.resetCode");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const router = useRouter();
    const locale = useLocale();

    return (
        <div className="w-full flex items-center justify-center">
            <div className="w-full">

                <form className="space-y-4" onSubmit={async (e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError(false);
                    try {
                        const res = await fetch(`/api/admin?path=/user/resetCode/`, {
                            method: "POST", body: JSON.stringify({ email, code }),
                        });
                        if (res.ok)
                        {
                            toast.success("Your password has been changed.");
                            router.push(`/${locale}/login`);
                        }
                        else setError(true);
                    } finally {
                        setLoading(false);
                    }
                }}

                >
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-secondary"> {resetCode("Reset Code")} </label>
                        <input className="w-full rounded-xl border border-border-default bg-bg-subtle/50 px-4 py-3 text-center text-xl font-semibold tracking-[0.5em] text-text-primary outline-none transition-colors duration-200 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent-soft"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.currentTarget.value)}
                            placeholder={resetCode("placeholder")}
                            maxLength={6}
                            autoComplete="off"
                    />
                </div>

                    <button type="submit" disabled={loading || code.length < 6}
                        className="w-full cursor-pointer rounded-xl bg-accent px-4 py-3 text-center text-base font-semibold text-text-inverse shadow-md shadow-accent-soft transition-all duration-200 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-soft active:translate-y-0 active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60" >
                        {loading ? resetCode("verifying") : resetCode("verify")}
                    </button>

                </form>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger-text">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>{resetCode("errorForm")}</p>
                    </div>
                )}

            </div>
        </div>
    );
}
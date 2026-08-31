"use client"

import { useState, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { useTranslations } from "next-intl";


export default function LegalModal() {
    const { data: session, update } = useSession();
    const LN = useTranslations("agreement")
    const route = useRouter();
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canAccept = agreePrivacy && agreeTerms;
    const [error, setError] = useState("");

    const handleSessionExpired = async () => {
        setError("Your session has expired. Please log in again.");
        await signOut({ redirect: false });
        route.push("/login");
    };

    const handleAccept = async () => {
        if (!canAccept || submitting) return;
        setSubmitting(true);
        setError("");
        try {
            const result = await apiFetch("user/me/terms", { method: "PATCH" });
            await update({ termsAcceptedAt: result.termsAcceptedAt });
        } catch {
            await handleSessionExpired();
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError("");
        try {
            await apiFetch("user/me", { method: "DELETE" });
            await signOut({ redirect: false });
            route.push("/login");
        } catch {
            await handleSessionExpired();
        } finally {
            setSubmitting(false);
        }
    }

    if (!session?.user || session.user.termsAcceptedAt) return null;

    

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-bg-overlay backdrop-blur-sm p-4" role="dialog" aria-modal="true">
            <div className="relative flex w-full max-w-2xl max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-surface text-text-primary shadow-modal">
                <div className="flex flex-col gap-1 border-b border-border-default px-6 pt-6 pb-4 sm:px-8">
                    <h2 className="display text-xl tracking-tight text-text-primary">{LN("beforePlaying")}</h2>
                    <p className="text-sm text-text-secondary">{LN("readPlaying")}</p>
                </div>

                <div className="flex flex-col gap-8 overflow-y-auto px-6 py-6 sm:px-8 no-scrollbar">
                    <div className="border-t border-border-default pt-6 first:border-t-0 first:pt-0">
                        <PrivacyPolicy embedded />
                    </div>
                    <div className="border-t border-border-default pt-6 first:border-t-0 first:pt-0">
                        <TermsOfService embedded />
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border-default px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-2.5">
                        <label className="flex cursor-grab items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-grab accent-accent" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                            <span>{LN("readPolicy")}</span>
                        </label>
                        <label className="flex cursor-grab items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-grab accent-accent" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                            <span>{LN("readTerms")}</span>
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm text-danger-text" role="alert">{error}</p>
                    )}

                    <button type="button" className="w-full cursor-grab rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-text-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" disabled={!canAccept || submitting} onClick={handleAccept}>
                        {submitting ? LN("saving") : LN("accept")}
                    </button>
                    <button type="button" className="w-full cursor-grab rounded-lg border border-border-default bg-transparent px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-40" disabled={submitting} onClick={handleReject}>
                       {LN("reject")}
                    </button>
                </div>
            </div>
        </div>
    );
}

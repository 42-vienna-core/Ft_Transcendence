import React from "react";
     
export default function ModalLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-overlay)] p-4 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 shadow-xl"
                style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
            >
                {children}
            </div>
        </div>
    )
}
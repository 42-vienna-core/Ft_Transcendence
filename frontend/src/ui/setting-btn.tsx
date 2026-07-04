'use client'

import React from "react";

interface SettingBattonProps {
    labelF: string;
    labelS?: string;
    value?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}

export function SettingBatton({labelF, labelS, onClick, disabled, children}: SettingBattonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex w-full items-center justify-between pl-[10px] py-[10px] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)]"
        >
            <span className="text-[13px] text-[var(--color-text-primary)] ">
                {labelF}
            </span>
            <span className="text-[13px] text-[var(--color-text-primary)] ">
                {labelS}
            </span>
            {children}
        </button>
    )
}
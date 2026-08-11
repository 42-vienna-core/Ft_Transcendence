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
            className="flex w-full items-center justify-between bg-bg-surface px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="text-sm text-text-primary">
                {labelF}
            </span>
            <span className="text-sm text-text-secondary">
                {labelS}
            </span>
            {children}
        </button>
    )
}
'use client'

interface SettingBattonProps {
    labelF: string;
    labelS?: string;
    value?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function SettingBatton({labelF, labelS, onClick, disabled}: SettingBattonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex w-full items-center justify-between pl-[10px] py-[10px] hover:bg-gray-100 "
        >
            <span className="text-[13px] text-[var(--color-text-primary)] ">
                {labelF}
            </span>
            <span className="text-[13px] text-[var(--color-text-primary)] ">
                {labelS}
            </span>
        </button>
    )
}
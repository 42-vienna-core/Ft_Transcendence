'use client'

import { useFormStatus } from "react-dom";

interface Props{
    label: string;
    loadingLabel: string;
}

function SubmitButton({label, loadingLabel}: Props) {
    const { pending } = useFormStatus();

    return (
    <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-xl bg-accent px-4 py-3 text-center text-base font-semibold text-text-inverse shadow-md shadow-accent-soft transition-all duration-200 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-soft active:translate-y-0 active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md">
      {pending ? loadingLabel : label}
    </button>
    )
}

export default SubmitButton;
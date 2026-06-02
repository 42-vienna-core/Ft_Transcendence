'use client'
import { useFormStatus } from "react-dom";

interface Props{
    label: string;
    loadingLabel: string;
}

function SubmitButton({label, loadingLabel}: Props) {
    const {pending} = useFormStatus();

    return (
    <button 
        className="w-full !p-2 border border-blue-300 rounded-2xl cursor-pointer text-center text-lg font-bold bg-transparent transition-all duration-[600ms]" 
        type="submit" 
        disabled={pending}>
      {pending ? loadingLabel : label}
    </button>
    )
}

export default SubmitButton;
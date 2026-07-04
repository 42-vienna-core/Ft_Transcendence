import { useState } from "react";
import ModalLayout from "./modal-layout";
import { useProfile } from "@/providers/ProfileContext";

interface ModalProps {
	isOpen: boolean;
	type: 'DELETE_ACCOUNT' | 'REMOVE_FRIEND'
    title: string;
    warning: string;
    firstBtn?: string;
    secondBtn: string;
    children: React.ReactNode;
    handleConfirmation: (confirm: boolean) => void;
}

export default function DialogModal({
	isOpen,
	type,
    children, 
    title, 
    warning, 
    firstBtn, 
    secondBtn,
    handleConfirmation
}: ModalProps) {
	const [matches, setMatches] = useState<boolean>(false);
	const {username} = useProfile();

    function handleModalAction(confirm: boolean) {
        if (confirm) {
            handleConfirmation(confirm);
        } else {
            handleConfirmation(confirm);
        }
    }
	
	if (isOpen) {
		return (
      		<ModalLayout>
  				<div className="p-5 pb-0">
    				<div className="flex items-start gap-3">
      					<div className="size-10 rounded-[10px] grid place-items-center text-xl bg-[var(--color-warning-soft)] text-[var(--color-warning)]">
      						{children}
	 					</div>
      					<div className="flex-1 min-w-0">
        					<h3 className="text-base  font-medium mb-1.5 text-[var(--color-text-secondary)]">
        	        			{title}
        	    			</h3>
        					<p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
        	    				{warning}
        					</p>
      					</div>
    				</div>

				{type === 'DELETE_ACCOUNT' && (
					<div className="mt-3.5">
    			  		<label className="text-xs text-[var(--color-text-primary)] mb-1.5 block">
    			    		Type <b className="font-mono text-[var(--color-warning)]">{username}</b> to confirm
    			  		</label>
    			  		<input
							type="text"
    			    		className="w-full h-9 rounded-md px-2.5 text-[13px] border border-[var(--color-border-default)] bg-transparent px-3 py-2.5 outline-none transition-colors focus:border-[var(--color-focus-ring)]"
    			    		onChange={(e) => setMatches(e.target.value === username)}
    			 	 	/>
    				</div> 
				)}
  				</div>

  				<div className="flex gap-2 justify-end p-5 pt-4.5">
    				<button 
        				className="text-[13px] font-medium px-4 py-2 rounded-md border border-[var(--color-border-default)]" autoFocus 
        				onClick={()=> handleModalAction(false)}
    				>
        				{firstBtn ?  firstBtn : "Cancel"}
    				</button>
    				<button
    				  	disabled={(type === 'DELETE_ACCOUNT' && !matches)}
        				className="text-[13px] font-medium px-4 py-2 rounded-md bg-[var(--color-danger)] text-[var(--color-text-inverse)] disabled:bg-gray-100 disabled:text-gray-400"
        				onClick={()=> handleModalAction(true)}
    				>
      					{secondBtn}
    				</button>
				</div>
      		</ModalLayout>
    	)
	}
}
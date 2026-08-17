'use client'
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CustomLinkProps{
    url: string;
    label: string;
    notification?: number; 
}

function CustomLink ({label, url, notification}: CustomLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === url;
    const notif = notification ? notification : "";

    return (
        <Link
            href={url}
            className={`relative py-2 text-sm font-medium tracking-wide transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-accent-hover after:transition-transform after:duration-300 hover:text-accent-hover hover:after:origin-left hover:after:scale-x-100 ${
                isActive
                    ? 'text-accent-hover after:origin-left after:scale-x-100'
                    : 'text-text-primary'
            }`}
        >
            {label}{" "}
            {
                notif && 
                    <span className="absolute top-2 -left-6 bg-red-500 text-white text-sm w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {notif}
                    </span>
            }
             
        </Link>
    )
}

export default CustomLink;
 

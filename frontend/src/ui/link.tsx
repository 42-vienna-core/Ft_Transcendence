'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CustomLinkProps{
    url: string;
    label: string;
    notification?: number; 
}

interface NotificationSignProps{
    notif: number | undefined;
    positionCss?: string;
    notification?: number; 
}

export function NotificationSign({notif, positionCss = ""}: NotificationSignProps) {
    if (notif) {
        return (
            <span className={`${positionCss} bg-red-500 text-white text-sm w-4 h-4 rounded-full flex items-center justify-center font-bold`}>
                {notif}
            </span>
        )
    }
}

function CustomLink ({label, url, notification}: CustomLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === url;
    const notif = notification && notification;

    return (
        <Link
            href={url}
            className={`relative whitespace-nowrap py-2 text-xs font-medium tracking-wide transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-accent-hover after:transition-transform after:duration-300 hover:text-accent-hover hover:after:origin-left hover:after:scale-x-100 sm:text-sm ${
                isActive
                    ? 'text-accent-hover after:origin-left after:scale-x-100'
                    : 'text-text-primary'
            }`}
        >
            {label}{" "}
            <NotificationSign 
                notif={notif} 
                positionCss={"absolute top-2 -left-6"}
            />
        </Link>
    )
}

export default CustomLink;
 

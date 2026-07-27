'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CustomLinkProps{
    url: string;
    label: string;
}

function CustomLink ({label, url}: CustomLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === url;

    return (
        <Link
            href={url}
            className={`relative py-2 text-sm font-medium tracking-wide transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-accent-hover after:transition-transform after:duration-300 hover:text-accent-hover hover:after:origin-left hover:after:scale-x-100 ${
                isActive
                    ? 'text-accent-hover after:origin-left after:scale-x-100'
                    : 'text-text-primary'
            }`}
        >
            {label}
        </Link>
    )
}

export default CustomLink;
 

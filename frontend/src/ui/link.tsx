'use client'
import Link from 'next/link';
import clsx from 'clsx';
import style from './nav/nav.module.css'
import { usePathname } from 'next/navigation';

interface CustomLinkProps{
    url: string;
    label: string;
}

function CustomLink ({label, url}: CustomLinkProps) {
    const pathname = usePathname();
    const isActive = pathname == url;
    
    return (
        <Link className={clsx(style.btn, isActive ? style.btnPrimary : style.navLink)} href={url}>
            {label}
        </Link>
    )
}

export default CustomLink;
 

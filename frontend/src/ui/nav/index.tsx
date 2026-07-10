'use client'

import style from './nav.module.css';
import Link from 'next/link';
import clsx from 'clsx';
import CustomLink from '../link';
import { useProfile } from '@/providers/ProfileContext';
import { usePathname } from 'next/navigation';
import { HeaderProfileSkeleton, HeaderAuthLinkSkeleton } from '../skeletons'
import { useTranslations } from 'next-intl';


interface LinkProps{
  status: string;
  username: string; 
  avatar: string | null;
}

interface AuthLinkProps {
    status: string;
    isAuthorized: boolean;
}

function NavLinks ({status, username, avatar}: LinkProps) {
    const t = useTranslations("Header");

    if (status === "authenticated") {
        return (
            <>
                <CustomLink 
                    url={"/arena"}
                    label={t("a")}
                />
                <CustomLink 
                    url={"/friends"}
                    label={t("f")}
                />
                <Link className={`${style.profile} justify-between`} href="/profile">
                    <p>{username}</p>
                    <img 
                        className={style.ava} 
                        src={avatar ? avatar : "/png/default_avatar.png"}
                    />
                </Link>
            </>
        )
    }
}

function NavAuthLinks ({status}: {status: string}) {
    const t = useTranslations("Header");

    if (status === "unauthenticated") {
        return (
            <>
                <CustomLink 
                    url={"/login"}
                    label={t("si")}
                />
                <CustomLink 
                    url={"/register"}
                    label={t("su")}
                />
            </>
        )
    }
}

function ProfileLoadingSkeleton ({status, isAuthorized}: AuthLinkProps) {
    if (isAuthorized && status === "loading") {
        return <HeaderProfileSkeleton/>
    }
}

function AuthLoadingSkeleton ({status, isAuthorized}: AuthLinkProps) {
    const currentPage = usePathname();
    const publickPages = (currentPage === "/login" || currentPage === "/register" || currentPage === "/");
    
    if ( (!isAuthorized && publickPages && status === "loading")) {
        return <HeaderAuthLinkSkeleton/>
    }
}

function Nav({isAuthorized}: {isAuthorized:boolean}) {
    const { status, username, avatar } = useProfile();
    return (
        <nav className={style.nav}>
            <div className={style.logo}>
                <div className={style.logoMark} />
                <Link href="/">Snake.io</Link>
            </div>
            <div className={style.navLinks}>
                <NavLinks 
                    status={status}
                    username={username}
                    avatar={avatar}
                />
                <ProfileLoadingSkeleton 
                    status={status}
                    isAuthorized={isAuthorized}
                />
                <NavAuthLinks status={status}/>
                <AuthLoadingSkeleton 
                    status={status}
                    isAuthorized={isAuthorized}
                />
            </div>
        </nav>
    );
}

export default Nav;

'use client'

import style from './nav.module.css';
import Link from 'next/link';
import clsx from 'clsx';
import CustomLink from '../link';
import { useProfile } from '@/providers/ProfileContext';
import { usePathname } from 'next/navigation';
import { HeaderProfileSkeleton, HeaderAuthLinkSkeleton } from '../skeletons'
import Profile from '@/app/(home)/(dashboard)/profile/page';


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
    if (status === "authenticated") {
        return (
            <>
                <CustomLink 
                    url={"/dashboard"}
                    label={"Dashboard"}
                />
                <CustomLink 
                    url={"/friends"}
                    label={"Friends"}
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
    if (status === "unauthenticated") {
        return (
                <>
                    <CustomLink 
                        url={"/login"}
                        label={"Log in"}
                    />
                    <CustomLink 
                        url={"/register"}
                        label={"Sign in"}
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

'use client'

import { useState } from 'react';
import Link from 'next/link';
import CustomLink from '../link';
import { useProfile } from '@/providers/ProfileContext';
import { useTranslations } from 'next-intl';
import { HeaderProfileSkeleton } from '../skeletons';
import Admin from "../../components/admin/Admin";
import { useNotificationListener } from '@/components/store/notification';


export function NavLinks () {
    const {status, username, avatar } = useProfile();
    const { notificationNumber } = useNotificationListener();
    const t = useTranslations("Header");

    console.log(notificationNumber);

    return (
        <>
            <CustomLink
                url={"/friends"}
                label={t("f")}
                notification={notificationNumber}
            />
            <CustomLink
                url={"/rating"}
                label={"Rating"}
            />
            {
                status === "authenticated" &&
                    <Link
                        href="/profile"
                        title={username}
                        className="flex max-w-[180px] items-center gap-2 rounded-full border border-border-default py-1 pl-1 pr-4 transition-colors duration-150 hover:border-accent hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                    >
                        <img
                            className="h-7 w-7 shrink-0 rounded-full object-cover"
                            src={avatar ? avatar : "/png/default_avatar.png"}
                            alt=""
                        />
                        <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                            {username}
                        </span>
                    </Link>
            }
            {
                status === "loading" &&
                    <HeaderProfileSkeleton/>
            }
        </>
    )
}

export function NavAuthLinks () {
    const t = useTranslations("Header");

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

export default function Nav({children}:{children: React.ReactNode}) {
    const { role } = useProfile();
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    return (
        <nav className="sticky top-0 z-[100] flex items-center justify-between px-8 py-[18px] shadow-[0_8px_24px_0_var(--color-bg-muted)] backdrop-blur-xl after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:animate-[headerBorderShift_8s_ease-in-out_infinite] after:bg-[length:300%_100%] after:bg-[linear-gradient(90deg,var(--color-snake-you),var(--color-snake-1),var(--color-snake-3),var(--color-snake-2))] after:opacity-65 after:content-['']">
            <div className="relative flex select-none items-center gap-[20px]">
                {
                    role === "ADMIN" ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsAdminOpen((open) => !open)}
                                className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform bg-(--color-accent) text-white"
                            >
                                Admin
                            </button>
                                {isAdminOpen && <Admin onClose={() => setIsAdminOpen(false)} />}
                            </>
                    ):(
                        <div className="relative h-8 w-8 rounded-md bg-accent shadow-[0_0_24px_var(--color-accent)] before:absolute before:left-2 before:top-2 before:h-[5px] before:w-[5px] before:rounded-full before:bg-accent-soft before:content-[''] after:absolute after:right-2 after:top-2 after:h-[5px] after:w-[5px] after:rounded-full after:bg-accent-soft after:content-['']" />
                    )
                }
                <Link href="/" className="display text-2xl tracking-wide text-text-primary">
                    Snake.io 
                </Link>
            </div>
            <div className="flex items-center gap-[25px]">
                {children}
            </div>
        </nav>
    );
}

'use client'

import style from './nav.module.css';
import Link from 'next/link';
import clsx from 'clsx';
import CustomLink from '../link';
import { useProfile } from '@/providers/ProfileContext';


function Nav({isAuthorized}: {isAuthorized: boolean}) {
  const { username, avatar } = useProfile();

  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <div className={style.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={style.navLinks}>
        {isAuthorized ? (
          <>
            <Link className={style.profile} href="/profile">
              <span>{username}</span>
                <img 
                  className={style.ava} 
                  src={avatar ? avatar : "/png/default_avatar.png"}/>
            </Link>
          </>
        ) : (
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
        )}
      </div>
    </nav>
  );
}

export default Nav;

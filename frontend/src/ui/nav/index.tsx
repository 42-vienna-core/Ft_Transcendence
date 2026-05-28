'use server'

import { getServerSession } from 'next-auth';
import style from './nav.module.css';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import LogoutBotton from '@/app/(auth)/logout/page';

async function Nav(){
  const session = await getServerSession(authOptions);

  function handleLogout (){
    
  }

  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <div className={style.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={style.navLinks}>
        {session ? (
            <>
              <Link className={`${style.btn} ${style.btnPrimary}`} href="#">Profile</Link>
              <LogoutBotton/>
            </>
          ): (
            <>
              <Link className={style.navLink} href="/login">Log in</Link>
              <Link className={`${style.btn} ${style.btnPrimary}`} href="/register">Sign up</Link>
            </>
          )}
      </div>
    </nav>
  );
}

export default Nav;

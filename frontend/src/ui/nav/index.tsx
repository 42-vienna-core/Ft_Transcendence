import { getServerSession } from 'next-auth';
import style from './nav.module.css';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import clsx from 'clsx';
import LogoutButton from '../logoutButton'; 
import { headers } from 'next/headers';
import CustomLink from '../link';

async function Nav() {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const referer = headersList.get('referer');
  const currentUrl = headersList.get("x-url") || referer || "unknown";
  
  const isLoginActive = currentUrl.includes('/login');
  const isRegisterActive = currentUrl.includes('/register');

  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <div className={style.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={style.navLinks}>
        {session ? (
          <>
            <Link className={style.profile} href="/profile">
              <span>Igor V.</span>
              <span className={style.ava}>IV</span>
            </Link>
          </>
        ) : (
          <>
            <CustomLink 
              // className={clsx(style.btn, isLoginActive ? style.btnPrimary : style.navLink)} 
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

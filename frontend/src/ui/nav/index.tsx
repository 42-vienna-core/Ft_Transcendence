import { getServerSession } from 'next-auth';
import style from './nav.module.css';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import clsx from 'clsx';
import CustomLink from '../link';

interface userProps{
  userName: string;
  ava: string;
}

export function Ava({userName, ava}: userProps) {
  return (
    <>
      <span>{userName}</span>
      <span className={style.ava}>{ava}</span>
    </>
  )
}

async function Nav() {
  const session = await getServerSession(authOptions);
  console.log(session);
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
              <Ava 
                userName={session.user.username}
                ava={"IV"}
                />
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

import style from '@/ui/nav/nav.module.css';
import Link from 'next/link';

function nav() {
  return (
    <nav className={style.nav}>
      <div className={style.logo}>
        <div className={style.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={style.navLinks}>
        <Link className={style.navLink} href="/auth/login">Log in</Link>
        <Link className={`${style.btn} ${style.btnPrimary}`} href="/auth/signup">Sign up</Link>
      </div>
    </nav>
  );
}

export default nav;

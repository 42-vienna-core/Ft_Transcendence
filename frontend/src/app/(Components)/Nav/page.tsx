"use client"
import style from "../../styles"
import Link from "next/link";
import { useState } from "react";
export default function Navbar() {

  const [value, setValue] = useState(true);

  return (
    <nav className="sticky top-0 z-100 backdrop-blur-xl bg-black border-b border-border-subtle py-4.5 px-8 flex items-center justify-between">
     <div className={style.Nav.logo}>
        <div className={style.Nav.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={style.Nav.navLinks}>
        <Link onClick={() => setValue(!value)} className={!value ? style.btnPrimary : style.btnSecondary} href="/Login">Log in</Link>
        <Link onClick={() => setValue(!value)} className={value ? style.btnPrimary : style.btnSecondary} href="/Registr">Sign up</Link>
      </div>
    </nav>
  );
}
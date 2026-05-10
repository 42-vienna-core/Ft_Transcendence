"use client"
import Styles from "../../styles"
import Link from "next/link";
import { useState } from "react";
export default function Navbar() {

  const [value, setValue] = useState(true);

  return (
    <nav className="sticky  top-0 z-100 backdrop-blur-xl bg-black border-b border-border-subtle py-4.5 px-8 flex items-center justify-between">
     <div className={Styles.Nav.logo}>
        <div className={Styles.Nav.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      <div className={Styles.Nav.navLinks}>
        <Link onClick={() => setValue(!value)} className={!value ? Styles.btnPrimary : Styles.btnSecondary} href="/Login">Log in</Link>
        <Link onClick={() => setValue(!value)} className={value ? Styles.btnPrimary : Styles.btnSecondary} href="/Register">Sign up</Link>
      </div>
    </nav>
  );
}
"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import Avatar from "@/src/components/avatar/Avatar"
import { useAuth } from "@/src/components/provider/UserProvider"
import { Api } from "@/src/lib/api";
import { NavStyles } from "@/src/styles/Nav.styles"
import { UserSearch } from "@/src/types/Types";


export default function Navbar() {

  const { cntUser } = useAuth();
  const [user, setUser] = useState<UserSearch[]>([]);
  const [filtered, setFiltered] = useState<UserSearch[]>([]);
  const [inputValue, setInputValue] = useState("");
  const url = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (!cntUser) return;
  
    (async  () =>  {
        const res = await Api.getRequest( url + "/users/search/" + cntUser.id).then(r => r.json())
        setUser(res);
      })();
  }, [cntUser])

  useEffect(() => {
    if (inputValue === "")
      return setFiltered([]);
    const timer = setTimeout(() => {
      const res = user.filter((item: UserSearch) => item.Username.toLowerCase().includes(inputValue.toLowerCase()));
      setFiltered(res);
    }, 500)
    return () => clearTimeout(timer);
  }, [inputValue])

  return (
    <nav className={NavStyles.nav}>
      <div className={NavStyles.logo}>
        <div className={NavStyles.logoMark} />
        <Link href="/" >Snake.io</Link>
      </div>
     
      {/* Desktop Search Section */}
      {cntUser && (
            <div className={NavStyles.search.div}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-200">

          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          onChange={(e) => setInputValue(e.currentTarget.value)}
          value={inputValue}
          type="text"
          placeholder="Players"
          className={NavStyles.search.input}
        />

        {filtered.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-blue-300 border rounded-lg shadow-lg z-50">
            <div>
              {filtered.map((item: { Username: string }, i: number) => (
                <div key={i} className="px-4 py-2 cursor-pointer flex justify-between max-sm:px-1 max-sm:text-1xl" >
                  <div className="">{item.Username}</div>
                  <div>
                    <button onClick={(e) => { console.log(e.currentTarget);}}
                      type="button" className=" border rounded-lg p-4 py-0 text-sm bg-neon-green  cursor-pointer">Envait</button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
      )

      }
    

      {/* Desktop Nav Links */}
      <div className={NavStyles.navLink}>
        {cntUser?.id ? <Avatar /> :
          <div>
            <Link className={NavStyles.btnPrimary} href="/login"> Sign in </Link>
            <Link className={NavStyles.btnSecondary} href="/register"> Sign up </Link>
          </div>
        }
      </div>
    </nav>
  );
}
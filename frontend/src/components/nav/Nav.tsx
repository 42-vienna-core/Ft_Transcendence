"use client"

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Avatar from "@/src/components/avatar/Avatar"
import { useAuth } from "@/src/components/provider/UserProvider"
import { Api } from "@/src/lib/api";
// import { NavStyles } from "@/src/styles/navbar.styles"
// import  Search  from "./Search"

export default function Navbar() {

  const user = useAuth();
  const usersRef = useRef([]);
  const [filtered, setFiltered] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (usersRef.current.length > 0)
      return;
    async function search() {
      const res = await Api.getRequest("http://localhost:4000/api/users/search");
      const data = await res.json();
      usersRef.current = data;
    };
    search();
  }, [])

  useEffect(() => {
    if (inputValue.length === 0)
      return setFiltered([]);
    const timer = setTimeout(() => {
      const res = usersRef.current.filter((item: { Username: string }) => item.Username.toLowerCase().includes(inputValue.toLowerCase()));
      setFiltered(res);
    }, 500)
    return () => clearTimeout(timer);
  }, [inputValue])

  return (
    <nav className="sticky top-0 z-100 backdrop-blur-xl bg-black border-b border-border-subtle py-4.5 px-8 flex items-center justify-between max-sm:px-4 max-sm:py-3">
      <div className=" font-bungee text-2xl text-text-bright tracking-wider cursor-pointer select-none flex items-center gap-2.5 max-sm:text-xl max-sm:gap-1.5">
        <div className="w-8 h-8 bg-neon-green rounded-md relative shadow-[0_0_24px_var(--neon-green-glow)] before:content-[''] before:absolute before:bg-bg-void before:rounded-full before:w-1.25 before:h-1.25 before:top-2 before:left-2 after:content-[''] after:absolute after:bg-bg-void after:rounded-full after:w-1.25 after:h-1.25 after:top-2 after:right-2 max-sm:w-6 max-sm:h-6 max-sm:before:w-1 max-sm:before:h-1 max-sm:before:top-1.5 max-sm:before:left-1.5 max-sm:after:w-1 max-sm:after:h-1 max-sm:after:top-1.5 max-sm:after:right-1.5" />
        <Link href="/" >Snake.io</Link>
      </div>
     
      {/* Desktop Search Section */}
      
      <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 rounded-full px-2 py-2 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/20 transition-all duration-200  relative">
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
          className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 w-28 focus:w-34 transition-all duration-300 max-sm:w-20 max-sm:focus:w-24 sm:w-28 "
        />

        {filtered.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
            <div>
              {filtered.map((item: { Username: string }, i: number) => (
                <div key={i} className="px-4 py-2 cursor-pointer flex justify-between" >
                  <div>{item.Username}</div>
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
      {/* Desktop Nav Links */}
      <div className="py-2 px-4 text-text-muted no-underline font-medium text-sm tracking-wide rounded-md cursor-pointer transition-all duration-150 ease-in-out bg-transparent border-0 font-inherit hover:text-text-bright hover:bg-bg-card data-[active=true]:text-neon-green max-sm:px-2 max-sm:text-xs">
        {user?.id ? <Avatar /> :
          <div>
            <Link className="btn  mr-1 bg-bg-card text-text-bright border-border-strong hover:bg-bg-elevated hover:border-text-muted" href="/login"> Sign in </Link>
            <Link className="btn  bg-neon-green text-bg-void shadow-[0_0_0_0_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] hover:-translate-y-px hover:shadow-[0_0_32px_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] active:translate-y-0 mr-4" href="/register"> Sign up </Link>
          </div>
        }
      </div>    
    </nav>
  );
}
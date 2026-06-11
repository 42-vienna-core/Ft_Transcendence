"use client"
import Styles from "../../styles"
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
// import Api from "../../api";

export default function Navbar() {

  const usersRef = useRef([]);
  const [filtered, setFiltered] = useState([]);
  const [value, setValue] = useState(true);
  const [inputValue, setInputValue] = useState("");

  // useEffect( () => {
  //   (async () => {
  //       const res = await Api.getRequest("http://localhost:4000/api/users");
  //       usersRef.current = res.map((item: {name: string, id: number}) => {
  //           return { name: item.name, id: item.id } })
  //   })();
  // },[])

  useEffect(() => {
    if (inputValue.length === 0) 
      return setFiltered([]);
    const timer = setTimeout(() => {
        const res = usersRef.current.filter((item: {name: string}) => item.name.toLowerCase().includes(inputValue.toLowerCase()));
        setFiltered(res);
    }, 500)
    return () => clearTimeout(timer);
  },[inputValue])

  return (
    <nav className={Styles.Nav.nav}>
      <div className={Styles.Nav.logo}>
        <div className={Styles.Nav.logoMark} />
        <Link href="/">Snake.io</Link>
      </div>
      
      {/* Search Section */}
      
      <div className={`${Styles.Nav.search.div} relative`}>
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
            className={Styles.Nav.search.input}
        />

        {filtered.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
                <div>
                  {filtered.map((item: { name: string }, i: number) => (
                    <div key={i}  className="px-4 py-2 cursor-pointer flex justify-between" >
                      <div>{item.name}</div>
                      <div>
                          <button onClick={(e) => {
                            console.log(e.currentTarget);
                          }}
                            type="button" className=" border rounded-lg p-4 py-0 text-sm bg-neon-green  cursor-pointer">Envait</button>
                      </div>
                    </div>
                    ))}
                </div>
                
            </div>
        )}
      </div>
   
      <div className={Styles.Nav.navLinks}>
        <Link onClick={() => setValue(!value)} className={!value ? Styles.btnPrimary : Styles.btnSecondary} href="/Login">Sign in</Link>
        <Link onClick={() => setValue(!value)} className={value ? Styles.btnPrimary : Styles.btnSecondary} href="/Register">Sign up</Link>
      </div>
    </nav>
  );
}
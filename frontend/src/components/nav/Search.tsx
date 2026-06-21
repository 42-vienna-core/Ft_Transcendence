import { NavStyles } from '@/src/styles/navbar.styles';
import { useState , useEffect, useRef} from 'react';
import { Api } from "@/src/lib/api"

function Search() {
    const [inputValue, setInputValue] = useState("");
    const [filtered, setFiltered] = useState([]);
    const usersRef = useRef([]);
    
     useEffect(() => {
        if (usersRef.current.length > 0)
          return;
        async function search() {
          const res = await Api.getRequest("http://localhost:4000/api/users/search");
          const data = await res.json();
          usersRef.current = data;
        };
        search();
      }, []);

     useEffect(() => {
        if (inputValue.length === 0)
          return setFiltered([]);
        const timer = setTimeout(() => {
          const res = usersRef.current.filter((item: { Username: string }) => item.Username.toLowerCase().includes(inputValue.toLowerCase()));
          setFiltered(res);
        }, 500)
        return () => clearTimeout(timer);
      }, [inputValue])
  return  (
       <div className={`${NavStyles.search.div} relative max-sm:hidden`}>
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
  )
}

export default Search

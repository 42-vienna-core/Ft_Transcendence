  "use client"
  import {useEffect , useRef, useState} from 'react';
  import {io, Socket } from "socket.io-client"
  import "@/src/styles/deshboard.css";
  import { useAuth } from "@/src/components/provider/UserProvider"

 function Dashboard () {

     const {refreshUser} = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [players, setPlayers] = useState(0);

    useEffect( ()  => {
        refreshUser();
        socketRef.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`,{
            withCredentials: true,
        });

        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected!", socketRef.current?.id);
        });

        socketRef.current.on("room-update", (data) => {
            setPlayers(data.players);
            console.log("players:", data.players);
        })

        socketRef.current.on("gmae-start", () => {
            console.log("Start Game");
        });
        return () => { socketRef.current?.disconnect() }
        
    }, []);

    return (
      
    <div className=" bg text-white border rounded-2xl">

      <section className="mockBoard" aria-label="Snake game field ">

        <div className="flex flex-row md:flex-row md:items-center justify-between gap-2 md:gap-0 h-auto md:h-14 px-4 py-2">

          <div className="flex items-center gap-2 text-sm md:text-base font-medium ">
            live match · Room 
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-1 md:gap-0 text-sm md:text-base">

            <div className="text-white md:w-1/3 text-center md:text-left">
              00:42 time
            </div>

            <div className="md:w-1/3 text-center font-medium">
              Players {players} / 4
            </div>

            <div className="text-white md:w-1/3 text-center md:text-right"> 340 your score </div>

          </div>
      </div>

        <canvas className='playArea '> 
        
        </canvas>

        <div className="boardBottom">
          <div>move 
            <span className="kbd">←</span> 
            <span className="kbd">↑</span> 
            <span className="kbd">↓</span> 
            {/* <span className="kbd">→</span> &nbsp;boost  <span className="kbd">space</span> &nbsp;pause  */}
            <span className="kbd">→</span>{"\u00A0"}boost
          <span className="kbd">space</span>{"\u00A0"}pause
            <span className="kbd">esc</span>
          </div>
          <div>tick 60 fps · ping 24 ms</div>
        </div>
      </section>

      <aside className="mockSide" aria-label="Match sidebar ">
        <div className="youCard">
          <div className="row1">
            <i className="ri tiUser aria-hidden:true"></i> 
            your position
          </div>
          <div className="row2">
            <span className="score">3<span>
              rd
            </span></span>
            <span className="rank">of 12</span>
          </div>
        </div>

        <div id="Players">
          <div className="sideHead">
            <span className="sideTitle">players</span>
            <span className="sideCount">12 live</span>
          </div>
          <div className="playerRow">
            <span className="ros">1</span> {/* bg-blue-500 */}
            <span className="swatch" ></span>
            <span className="name">Mira</span>
            <span className="pts">920</span>
          </div>
          <div className="playerRow">
            <span className="pos">2</span>
            <span className="swatch bg-red-500"></span>
            <span className="name">Kostia</span>
            <span className="pts">615</span>
            </div>
          <div className="playerRow me" >
            <span className="pos">3</span>
            <span className="swatch bg-orange-500"></span>
            <span className="name">you</span>
            <span className="pts">340</span>
          </div>
          <div className="playerRow">
            <span className="pos">4</span>
            <span className="swatch bg-yellow-500"></span>
            <span className="name">Lila</span>
            <span className="pts">298</span>
          </div>
          <div className="playerRow">
            <span className="pos">5</span>
            <span className="swatch bg-pink-500"></span>
            <span className="name">Jonas</span><span className="pts">214</span>
          </div>
          <div className="playerRow">
            <span className="pos ">6</span>
            <span className="swatch bg-green-500"></span>
            <span className="name">noor_27</span><span className="pts">180</span>
          </div>
          <div className="playerRow">
            <span className="pos">7</span>
            <span className="swatch bg-gray-500"></span>
            <span className="name">tomato</span><span className="pts">155</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="ratingCard">
          <div className="label">your rating</div>
          <div className="value">
            <span className="v">1 482</span>
            <span className="delta">+14 today</span>
          </div>
        </div>

        <div className="ratingCard">
          <div className="value">best score</div>
          <div className="value">
            <span className="v">1 207</span>
            <span className="font-size:11px; color: var(--color-text-tertiary);">last week</span>
          </div>
        </div>
      </aside>
    </div>
  
    );
}

export default Dashboard;
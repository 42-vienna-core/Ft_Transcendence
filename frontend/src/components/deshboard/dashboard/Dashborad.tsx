  "use client"
  import {useEffect , useRef} from 'react';
  import {io, Socket } from "socket.io-client"
  import "@/src/styles/deshboard.css";


 function Dashboard () {

    
    const socketRef = useRef<Socket | null>(null);
    useEffect( ()  => {

        socketRef.current = io("http://localhost:2000/");

        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected!", socketRef.current?.id);
        });

        socketRef.current.on("room-update", (data) => {
            console.log("players:", data.players);
        })

        socketRef.current.on("gmae-start", () => {
            console.log("Start Game");
        });
        return () => {
            socketRef.current?.disconnect();
        }
    }, []);

    return (
      
    <div className="mockBody">

      <section className="mockBoard" aria-label="Snake game field">

        <div className="boardTop">
          <span className="boardTag">
            <i className="ti tiCircleFilled  text-xl" aria-hidden="true"> </i> live match · room 47
          </span>
          <div className="boardStats">
            <div className="text-white"><p >00:42</p>time</div>
            <div className="text-white"><p>12</p>players</div>
            <div className="text-white"><p>340</p>your score</div>
          </div>
        </div>

        

        <div className="playArea" aria-hidden="true">
          <div className="gridOverlay"></div>
          <div className="youTag">you</div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="snakeSeg"> </div>
          <div className="foodDot"></div>
          <div className="foodDot"></div>
          <div className="foodDot"></div>
        </div>

        <div className="boardBottom">
          <div>move 
            <span className="kbd">←</span> 
            <span className="kbd">↑</span> 
            <span className="kbd">↓</span> 
            {/* <span className="kbd">→</span> &nbsp;boost 
            <span className="kbd">space</span> &nbsp;pause  */}
            <span className="kbd">→</span>{"\u00A0"}boost
          <span className="kbd">space</span>{"\u00A0"}pause
            <span className="kbd">esc</span>
          </div>
          <div>tick 60 fps · ping 24 ms</div>
        </div>
      </section>

      <aside className="mockSide" aria-label="Match sidebar">
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
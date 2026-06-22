 'use clien';
 import style from "./dashboard.module.css"
 
 function Dashboard () {

    return (
        <>
    <div className={style.mockBody}>
      <section className={style.mockBoard} aria-label="Snake game field">
        <div className={style.boardTop}>
          <span className={style.boardTag}><i className={`${style.ti} ${style.tiCircleFilled} font-size:8px;`}  aria-hidden="true"></i> live match · room 47</span>
          <div className={style.boardStats}>
            <div className="text-white"><p >00:42</p>time</div>
            <div className="text-white"><p>12</p>players</div>
            <div className="text-white"><p>340</p>your score</div>
          </div>
        </div>

        <div className={style.playArea} aria-hidden="true">
          <div className={style.gridOverlay}></div>
          <div className={style.youTag}>you</div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.snakeSeg} `}> </div>
          <div className={`${style.foodDot} `}></div>
          <div className={`${style.foodDot} `}></div>
          <div className={`${style.foodDot} `}></div>
        </div>

        <div className={style.boardBottom}>
          <div>move <span className={style.kbd}>←</span> <span className={style.kbd}>↑</span> <span className={style.kbd}>↓</span> <span className={style.kbd}>→</span> &nbsp; boost <span className={style.kbd}>space</span> &nbsp; pause <span className={style.kbd}>esc</span></div>
          <div>tick 60 fps · ping 24 ms</div>
        </div>
      </section>

      <aside className={style.mockSide} aria-label="Match sidebar">
        <div className={style.youCard}>
          <div className={style.row1}><i className={`${style.ti} ${style.tiUser} font-size:14px;`} aria-hidden="true" ></i> your position</div>
          <div className={style.row2}>
            <span className={`${style.score} font-size:13px;`}>3<span>rd</span></span>
            <span className={style.rank}>of 12</span>
          </div>
        </div>

        <div>
          <div className={style.sideHead}>
            <span className={style.sideTitle}>players</span>
            <span className={style.sideCount}>12 live</span>
          </div>
          <div className={style.playerRow}><span className={`${style.pos} `}>1</span><span className={`${style.swatch} bg-blue-500`}></span><span className={style.name}>Mira</span><span className={style.pts}>920</span></div>
          <div className={style.playerRow}><span className={`${style.pos} `}>2</span><span className={`${style.swatch} bg-red-500`}></span><span className={style.name}>Kostia</span><span className={style.pts}>615</span></div>
          <div className={`${style.playerRow} ${style.me}`}><span className={style.pos}>3</span><span className={`${style.swatch} bg-orange-500`}></span><span className={style.name}>you</span><span className={style.pts}>340</span></div>
          <div className={style.playerRow}><span className={`${style.pos} `}>4</span><span className={`${style.swatch} bg-yellow-500`}></span><span className={style.name}>Lila</span><span className={style.pts}>298</span></div>
          <div className={style.playerRow}><span className={`${style.pos} `}>5</span><span className={`${style.swatch} bg-pink-500`}></span><span className={style.name}>Jonas</span><span className={style.pts}>214</span></div>
          <div className={style.playerRow}><span className={`${style.pos} `}>6</span><span className={`${style.swatch} bg-green-500`}></span><span className={style.name}>noor_27</span><span className={style.pts}>180</span></div>
          <div className={style.playerRow}><span className={`${style.pos} `}>7</span><span className={`${style.swatch} bg-gray-500`}></span><span className={style.name}>tomato</span><span className={style.pts}>155</span></div>
        </div>

        <div className={style.divider}></div>

        <div className={style.ratingCard}>
          <div className={`${style.label} `}>your rating</div>
          <div className={style.value}><span className="v">1 482</span><span className="delta">+14 today</span></div>
        </div>

        <div className={style.ratingCard}>
          <div className={style.value}>best score</div>
          <div className={style.value}><span className={style.v}>1 207</span><span className="font-size:11px; color: var(--color-text-tertiary);">last week</span></div>
        </div>
      </aside>
    </div>
        </>
    );
}

export default Dashboard;
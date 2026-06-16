import style from "./friends.module.css";

export default function Friends() {
  return (
    <>
      <div className={style.body}>
        <div className={style.pageHead}>
          <div>
            <h1>Friends</h1>
            <div className={style.pageMeta}>
              42 total ·{" "}
              <span
                className="text-green-500"
              >
                3 online
              </span>{" "}
              ·{" "}
              <span
                className="text-red-500"
              >
                1 playing
              </span>
            </div>
          </div>
          <button className={style.addBtn}>
            <i className={`${style.ti} ${style.tiUserPlus}`} aria-hidden="true"></i> Add friend
          </button>
        </div>

        <div className={style.filterBar}>
          <div className={style.chips}>
            <span className={`${style.chip} ${style.on}`}>
              All <span className={style.ct}>42</span>
            </span>
            <span className={style.chip}>
              Online <span className={style.ct}>3</span>
            </span>
            <span className={style.chip}>
              Playing <span className={style.ct}>1</span>
            </span>
            <span className={style.chip}>
              Recently <span className={style.ct}>5</span>
            </span>
          </div>
          <div className={style.sort}>
            Sort: status{" "}
            <i
              className={`${style.ti} ${style.tiChevronDown} font-[12px]`}
              aria-hidden="true"
              //   style="font-size: 12px;"
            ></i>
          </div>
        </div>

        <div className={style.grid}>
          <div className={style.col}>
            <div className={`${style.fRow} ${style.starred}`}>
              <span className={`${style.star} ${style.on}`} aria-label="Favorite">
                <i className={`${style.ti} ${style.tiStar}`} aria-hidden="true"></i>
              </span>
              <div
                className={style.av}
                // style="background:#B5D4F4; color:#0C447C;"
              >
                MR
              </div>
              <div className={style.main}>
                <div className={style.who}>
                  <span className={style.nm}>Mira</span>
                  <span className={style.hd}>@mira_g</span>
                </div>
                <div className={style.statusLine}>
                  <span className={`${style.dot} ${style.match}`}></span>
                  <span>In public match · Room 47 · 3rd of 8</span>
                  <span className={style.sep}>·</span>
                  <span className={style.rating}>1920</span>
                  <span className={`${style.delta} ${style.up}`}>▲42 wk</span>
                </div>
              </div>
              <div className={style.actions}>
                <button className={`${style.btn} ${style.primary}`}>
                  <i
                    className={`${style.ti} ${style.tiEye} font-[11px]`}
                    aria-hidden="true"
                    // style="font-size:11px;"
                  ></i>{" "}
                  Watch
                </button>
                <button className={style.btn}>Join</button>
              </div>
            </div>

            <div className={style.fRow}>
              <span className={style.star} aria-label="Add to favorites">
                <i className={`${style.ti} ${style.tiStar}`} aria-hidden="true"></i>
              </span>
              <div
                className={`${style.av} bg-[#C0DD97] text-[#27500A]`}
                // style="background:#C0DD97; color:#27500A;"
              >
                PE
              </div>
              <div className={style.main}>
                <div className={style.who}>
                  <span className={style.nm}>Pengu</span>
                  <span className={style.hd}>@pengu_io</span>
                </div>
                <div className={style.statusLine}>
                  <span className={`${style.dot} ${style.on}`}></span>
                  <span>Online · just finished a match</span>
                  <span className={style.sep}>·</span>
                  <span className={style.rating}>1850</span>
                  <span className={`${style.delta} ${style.up}`}>▲36 wk</span>
                </div>
              </div>
              <div className={style.actions}>
                <button className={`${style.btn} ${style.success}`}>Invite</button>
                <button className={`${style.btn} ${style.subtle}`}>Message</button>
              </div>
            </div>

            <div className={style.fRow}>
              <span className={style.star} aria-label="Add to favorites">
                <i className={`${style.ti} ${style.tiStar}`} aria-hidden="true"></i>
              </span>
              <div
                className={style.av}
                // style="background:#CECBF6; color:#3C3489;"
              >
                MA


   
              </div>
              <div className={style.main}>
                <div className={style.who}>
                  <span className={style.nm}>Marek</span>
                  <span className={style.hd}>@marek_42</span>
                </div>
                <div className={style.statusLine}>
                  <span className={`${style.dot} ${style.private}`}></span>
                  <span>In a private match</span>
                  <span className={style.sep}>·</span>
                  <span className={style.rating}>1620</span>
                  <span className={`${style.delta} ${style.dn}`}>▼12 wk</span>
                </div>
              </div>
              <div className={style.actions}>
                <button className={`${style.btn} ${style.subtle}`}>Message</button>
              </div>
            </div>

            <div className={style.fRow}>
              <span className={`${style.star} ${style.on}`} aria-label="Favorite">
                <i className={`${style.ti} ${style.tiStar}`} aria-hidden="true"></i>
              </span>
              <div
                className={`${style.av} bg-[#FAC775] text-[#633806]`}
                // style="background:#FAC775; color:#633806;"
              >
                KO
              </div>
              <div className="main">
                <div className="who">
                  <span className="nm">Kostia</span>
                  <span className="hd">@kostia_v</span>
                </div>
                <div className="status-line">
                  <span className="dot off"></span>
                  <span>Offline · last seen 2 h ago</span>
                  <span className="sep">·</span>
                  <span className="rating">1760</span>
                  <span className="delta up">▲28 wk</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn subtle">Message</button>
              </div>
            </div>
          </div>

          <aside className={style.col}>
            <div className={style.card}>
              <h3>
                <span>Friends this week</span>
                <span className={style.ct}>top 5</span>
              </h3>
              <div className={style.lbRow}>
                <span className={style.pos}>1</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>Mira</span>
                <span className={style.rt}>1920</span>
                <span className={`${style.delta} ${style.up}`}>▲42</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>2</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>Pengu</span>
                <span className={style.rt}>1850</span>
                <span className={`${style.delta} ${style.up}`}>▲36</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>3</span>
                <span className={`${style.dot} ${style.off}`}></span>
                <span className={style.nm}>Kostia</span>
                <span className={style.rt}>1760</span>
                <span className={`${style.delta} ${style.up}`}>▲28</span>
              </div>
              <div className={`${style.lbRow} ${style.me}`}>
                <span className={style.pos}>4</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>you</span>
                <span className={style.rt}>1482</span>
                <span className={`${style.delta} ${style.up}`}>▲14</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>5</span>
                <span className={`${style.dot} ${style.off}`}></span>
                <span className={style.nm}>Lila</span>
                <span className={style.rt}>1480</span>
                <span className={`${style.delta} ${style.up}`}>▼6</span>
              </div>
            </div>

            <div className={style.card}>
              <h3>
                <span>Pending requests</span>
                <span className={style.ct}>2</span>
              </h3>
              <div className={style.reqRow}>
                <div
                  className={`${style.av} bg-[#F0997B]`}
                  // style="background:#F0997B; color:#4A1B0C;"
                >
                  TO
                </div>
                <div className={style.whoR}>
                  <div className={style.nm}>Tomato</div>
                  <div className={style.meta}>@tomato_g · 3 mutual</div>
                </div>
                <div className={style.reqActions}>
                  <button className={`${style.iconBtn} ${style.accept}`} aria-label="Accept">
                    <i className={`${style.ti} ${style.tiCheck}`} aria-hidden="true"></i>
                  </button>
                  <button className={`${style.iconBtn} ${style.decline}`} aria-label="Decline">
                    <i className={`${style.ti} ${style.tiX}`} aria-hidden="true"></i>
                  </button>
                </div>
              </div>
              <div className={style.reqRow}>
                <div
                  className={`${style.av} bg-[#888780]`}
                  // style="background:#888780; color:#FFFFFF;"
                >
                  NO
                </div>
                <div className={style.whoR}>
                  <div className={style.nm}>Noor</div>
                  <div className={style.meta}>played 4× together</div>
                </div>
                <div className={style.reqActions}>
                  <button className={`${style.iconBtn} ${style.accept}`} aria-label="Accept">
                    <i className={`${style.ti} ${style.tiCheck}`} aria-hidden="true"></i>
                  </button>
                  <button className={`${style.iconBtn} ${style.decline}`} aria-label="Decline">
                    <i className={`${style.ti} ${style.tiX}`} aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className={style.card}>
              <h3>Find friends</h3>
              <div className={style.searchInput}>
                <i className={`${style.ti} ${style.tiSearch}`} aria-hidden="true"></i>
                <input placeholder="username or invite code" />
              </div>
              <div className="font-[11px] text-[var(--color-text-tertiary)] mu-[8px] mx-0 mb-[4px]">
                suggested
              </div>
              <div className={style.sugRow}>
                <div
                  className={`${style.av} bg-[#85B7EB]`}
                  // style="background:#85B7EB; color:#042C53;"
                >
                  TF
                </div>
                <div>
                  <div className="font-[13px]">Tofu</div>
                  <div className={style.metaR}>5 mutual friends</div>
                </div>
                <span className={style.addMini}>+ Add</span>
              </div>
              <div className={style.sugRow}>
                <div
                  className={`${style.av} bg-[#5DCAA5]`}
                  // style="background:#5DCAA5; color:#04342C;"
                >
                  PI
                </div>
                <div>
                  <div className="font-[13px]">Pickle</div>
                  <div className={style.metaR}>played 3× together</div>
                </div>
                <span className={style.addMini}>+ Add</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

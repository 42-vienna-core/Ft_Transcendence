import FindFriends from "@/components/friends/search/search";
import style from "./friends.module.css";
import ListOfRequests from "@/components/friends/requests/requests";
import FriendsList from "@/components/friends/friends";

export default function Friends() {
  return (
    <>
      <div className={style.body}>
        <div className={style.pageHead}>
          <div>
            <h1>Friends</h1>
            <div className={style.pageMeta}>
              42 total · <span className="text-green-500">3 online</span> ·{" "}
              <span className="text-red-500">1 playing</span>
            </div>
          </div>
          <button className={style.addBtn}>
            <i className={`${style.ti} ${style.tiUserPlus}`} aria-hidden="true"></i>{" "}
            Add friend
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
            <i className={`${style.ti} ${style.tiChevronDown}`} aria-hidden="true"></i>
          </div>
        </div>

        <div className={style.grid}>
          <FriendsList/>
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
                <span className={`${style.delta} ${style.dn}`}>▼6</span>
              </div>
            </div>

            <ListOfRequests/>

            <FindFriends/>
          </aside>
        </div>
      </div>
    </>
  );
}

import style from "./friends.module.css";
import { apiFetch } from "@/lib/api-client";
import AllFriends from "@/components/all-friends/all-friends";
import { Suspense } from "react";
import { FriendsContentSkeleton } from "@/ui/skeletons";


export default async function Friends() {
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
          <AllFriends/>
      </div>
    </>
  );
}

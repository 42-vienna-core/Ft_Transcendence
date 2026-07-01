import style from './friends.module.css'

export default function FriendsList () {
    return (
        <div className={style.col}>
            <div className={`${style.fRow} ${style.starred}`}>
              <span className={`${style.star} ${style.on}`} aria-label="Favorite">
                <i className={`${style.ti} ${style.tiStar}`} aria-hidden="true"></i>
              </span>
              <div className={style.av}>MR</div>
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
                  <i className={`${style.ti} ${style.tiEye}`} aria-hidden="true"></i>{" "}
                  Watch
                </button>
                <button className={style.btn}>Join</button>
              </div>
            </div>
        </div>
    )
}
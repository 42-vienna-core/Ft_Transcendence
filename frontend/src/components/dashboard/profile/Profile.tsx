'use client';
import Link from 'next/link';
import style from './profile.module.css';

export default function Profile() {
    return (
    <div className={style.pfBody}>
      {/* <EditForm/> */}

      <div className={style.pfStats}>
        <div className={style.statCard}>
          <div className={style.l}>rating</div>
          <div className={style.v}>1 482</div>
          <div className={style.d}>+14 today</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>global rank</div>
          <div className={style.v}>#3 920</div>
          <div className={style.d}>top 8 %</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>best score</div>
          <div className={style.v}>1 207</div>
          <div className={`${style.d} color: var(--color-text-tertiary);`}>last week</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>matches</div>
          <div className={style.v}>182</div>
          <div className={`${style.d} color: var(--color-text-tertiary);`} >win rate 41 %</div>
        </div>
      </div>

      <div className={style.tabStrip}>
        <span className={style.on}>settings</span>
        <span>match history</span>
        <span>achievements</span>
        <span>billing</span>
      </div>

      <div className={style.pfGrid}>
        <div className={style.panel} aria-label="Settings">
          <h3>preferences</h3>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiLanguage}`} aria-hidden="true"></i> language</div>
            <div className={style.val}>English · UK <i className={`${style.ti} ${style.tiChevronDown}`} aria-hidden="true"></i></div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className="style.ti style.ti-palette" aria-hidden="true"></i> color theme</div>
            <div className={style.val}>
              <div className={`${style.chipGroup} margin-right:8px;`}>
                <span className={style.chip}>light</span>
                <span className={`${style.chip} ${style.on}`}>dark</span>
                <span className={style.chip}>auto</span>
              </div>
              <div className={style.themeSwatches}>
                <div className={`${style.sw} bg-blue-500`}></div>
                <div className={`${style.sw} ${style.sel} bg-red-500`}></div>
                <div className={`${style.sw} bg-yellow-500`}></div>
                <div className={`${style.sw} bg-pink-500`}></div>
              </div>
            </div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiVolume}`} aria-hidden="true"></i> sound &amp; music</div>
            <div className={style.val}>on <span className={style.toggle}></span></div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiDeviceGamepad2}`} aria-hidden="true"></i> controls</div>
            <div className={style.val}>arrows + WASD <i className={`${style.ti} ${style.tiChevronRight}`} aria-hidden="true"></i></div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiBell}`} aria-hidden="true"></i> notifications</div>
            <div className={style.val}>friend requests, match results <i className={`${style.ti} ${style.tiChevronRight}`} aria-hidden="true"></i></div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiEyeOff}`} aria-hidden="true"></i> privacy</div>
            <div className={style.val}>friends-only stats <i className={`${style.ti} ${style.tiChevronRight}`} aria-hidden="true"></i></div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}>
                <i className={`${style.ti} ${style.tiAccessible}`} aria-hidden="true"></i> 
                accessibility
              </div>
            <div className={style.val}>color-blind mode 
              <span className={`${style.toggle} ${style.off}`}></span>
            </div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}><i className={`${style.ti} ${style.tiShieldLock}`} aria-hidden="true"></i> security</div>
            <div className={style.val}>
               <Link href="/reset" className='cursor-pointer'> change password </Link>
              </div>
          </div>
          <div className={style.row}>
            <div className={`${style.lbl} color: var(--color-text-danger);`}>
              <i className={`${style.ti} ${style.tiTrash}`} aria-hidden="true"></i>
              delete account
            </div>
            <div className={style.val}>
              <i className={`${style.ti} ${style.tiChevronRight}`} aria-hidden="true"></i>
            </div>
          </div>
            {/* <LogoutButton/> */}

        </div>

        <div className="flex flex-col gap-4">
          <div className={style.panel} aria-label="Friends">
            <h3 className="flex justify-between m-1"><span>friends</span><span >42 · <span className="text-blue-500">+ add</span></span></h3>
            <div className={style.friendRow}>
              <div className={style.av} >MR</div>
              <div className={style.nm}><div className={style.n}>Mira</div><div className={style.s}><span className={style.dot}></span> in match · room 47</div></div>
              <div className={style.rk}>1 920</div>
            </div>
            <div className={style.friendRow}>
              <div className={`${style.av} background:#FAEEDA; color:#854F0B;`} >KO</div>
              <div className={style.nm}><div className={style.n}>Kostia</div><div className={style.s}><span className={style.dot}></span> online</div></div>
              <div className={style.rk}>1 760</div>
            </div>
            <div className={style.friendRow}>
              <div className={`${style.av} background:#FBEAF0; color:#72243E;`}>LI</div>
              <div className={style.nm}><div className="n">Lila</div><div className={style.s}><span className={`${style.dot} ${style.off}`}></span> 2 h ago</div></div>
              <div className={style.rk}>1 480</div>
            </div>
            <div className={style.friendRow}>
              <div className={`${style.av} background:#EEEDFE; color:#3C3489;`}>JO</div>
              <div className={style.nm}><div className={style.n}>Jonas</div><div className={style.s}><span className={`${style.dot} ${style.off}`}></span> yesterday</div></div>
              <div className={style.rk}>1 210</div>
            </div>
          </div>

          <div className={style.panel} aria-label="Recent achievements">
            <h3>recent achievements</h3>
            <div className={style.row}>
              <div className={style.lbl}><i className={`${style.ti} ${style.tiTrophy} color: var(--color-text-warning);`} aria-hidden="true"></i> first to 1 000</div>
              <div className={style.val}>2 days ago</div>
            </div>
            <div className={style.row}>
              <div className={style.lbl}><i className={`${style.ti} ${style.tiBolt } color: var(--color-text-info);`}  aria-hidden="true"></i> 10-match win streak</div>
              <div className={style.val}>last week</div>
            </div>
            <div className={style.row}>
              <div className={style.lbl}><i className={`${style.ti} ${style.tiUsers } color: var(--color-text-success);`} aria-hidden="true"></i> invited 5 friends</div>
              <div className={style.val}>apr 12</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}



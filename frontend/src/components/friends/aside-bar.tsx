import style from '../../app/[locale]/(home)/(dashboard)/friends/friends.module.css'
import FriendsContent from './friends/friends';
import RequestsContent from './requests/requests';
import FindFriends from './search/search';

interface Request {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
    };
}

interface AsideBarProps {
    requests: Request[];
    removeRequestCard: (id: string) => void
    getListOfFriends: () => void;
}

export default function AsideBar({
    requests, 
    removeRequestCard,
    getListOfFriends,

}:AsideBarProps) {
    return (

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

                <RequestsContent
                    requests={requests}
                    removeRequestCard={removeRequestCard}
                    getListOfFriends={getListOfFriends}
                />

                <FindFriends/>
            </aside>
    );
}
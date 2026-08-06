import FriendsBar from "@/components/friends/friends-bar";
import style from "./friends.module.css";


export default async function Friends() {
    return (
        <div className={style.body}>
            <FriendsBar/>
        </div>
    );
}

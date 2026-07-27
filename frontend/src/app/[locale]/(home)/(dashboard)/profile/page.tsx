import EditProfileForm from "@/components/profile/edit-form";
import style from "./profile.module.css";
import ProfileSettingsContent from "@/components/profile/settings";



export default function Profile() {
    return (
        <div className={style.pfBody}>
            <EditProfileForm />

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
                    <div className={style.dMuted}>last week</div>
                </div>
                <div className={style.statCard}>
                    <div className={style.l}>matches</div>
                    <div className={style.v}>182</div>
                    <div className={style.dMuted}>win rate 41 %</div>
                </div>
            </div>

            <div className={style.tabStrip}>
                <span className={style.on}>settings</span>
                <span>messages</span>
            </div>

            <ProfileSettingsContent/>
        </div>
    );
}
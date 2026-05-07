import style from './features.module.css'

function Features () {
    return (
    <div className={style.features}>
        <div className={style.titleGrid}>
            <div className={style.sectionEyebrow}>// FEATURES</div>
            <h2 className={style.sectionTitle}>Built for serious snake competition</h2>
        </div>
        <div className={style.featuresGrid}>
            <div className={style.featureCard}>
                <div className={style.featureIcon}>⚡</div>
                <h3>Real-Time Multiplayer</h3>
                <p>
                    Sub-100ms latency with server-authoritative game state. No lag, no
                    cheating, no excuses.
                </p>
            </div>
            <div className={style.featureCard}>
                <div className={style.featureIcon}>⚔️</div>
                <h3>4-Player Battles</h3>
                <p>
                    Four snakes enter the arena. Eat food, dodge collisions, eliminate
                    rivals to claim victory.
                </p>
            </div>
            <div className={style.featureCard}>
                <div className={style.featureIcon}>🏆</div>
                <h3>Global Leaderboards</h3>
                <p>
                    Track wins, scores, win rates. Climb the ranks and prove you're
                    the apex serpent.
                </p>
            </div>
        </div>
    </div>
    );
}

export default Features
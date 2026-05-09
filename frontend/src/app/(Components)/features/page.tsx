import style from "../../styles"

function Features () {
    return (
    <div className={style.features.features}>
        <div className={style.features.titleGrid}>
            <div className={style.features.sectionEyebrow}>// FEATURES</div>
            <h2 className={style.features.sectionTitle}>Built for serious snake competition</h2>
        </div>
        <div className={style.features.featuresGrid}>
            <div className={style.features.featureCard}>
                <div className={style.features.featureIcon}>⚡</div>
                <h3 className="mb-3">Real-Time Multiplayer</h3>
                <p>
                    Sub-100ms latency with server-authoritative game state. No lag, no
                    cheating, no excuses.
                </p>
            </div>
            <div className={style.features.featureCard}>
                <div className={style.features.featureIcon}>⚔️</div>
                <h3>4-Player Battles</h3>
                <p>
                    Four snakes enter the arena. Eat food, dodge collisions, eliminate
                    rivals to claim victory.
                </p>
            </div>
            <div className={style.features.featureCard}>
                <div className={style.features.featureIcon}>🏆</div>
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
import { useProfile } from "@/providers/ProfileContext";
import { LeaderboardData } from "@/types/gameTypes"
import { Avatar } from "@/ui/ava";
import { useTranslations } from "next-intl";

interface LeaderboardItemProps{
    p: LeaderboardData;
    me: boolean;
}

function LeaderboardItem({p, me}: LeaderboardItemProps) {
    const dateCreated = new Date(p.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'});
    const LN = useTranslations("leaderboard")

    return (
        <li className={`grid grid-cols-[32px_1fr_60px] sm:grid-cols-[44px_1fr_88px_70px_90px] items-center ${me && "bg-text-inverse"} border-b border-border-default px-2.5 sm:px-3.5 py-[11px] text-[13px] last:border-b-0`}>
            <span className="font-medium tabular-nums text-text-secondary">{p.rank}</span>
            <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={p.name} avatar={p.avatar} style={"size-[30px]"}/>
                <div className="min-w-0">
                    <div className="truncate font-medium text-text-primary">{me ? LN("me") : p.name}</div>
                    <div className="text-[11px] text-text-secondary">{LN("level")} {p.level}</div>
                </div>
            </div>
            <span className="text-right tabular-nums text-text-primary">{p.score}</span>
            <span className="hidden text-right tabular-nums text-text-secondary sm:inline">{p.totMatches}</span>
            <span className="hidden text-right text-xs text-text-tertiary sm:inline">{dateCreated}</span>
        </li>
    )
}

export default function LeaderboardList({ rest }: { rest: LeaderboardData[] }) {
    const {id} = useProfile();
    const top_n = 5;
    const top = rest.slice(0, top_n);
    const isInTop = top.some(p => p.id === id);
    const me = rest.find(p => p.id === id);
    const LN = useTranslations("leaderboard")

    const showPinned = me && !isInTop;

    return (
        <ul className="overflow-hidden rounded-xl border border-border-default">
            <div className="grid grid-cols-[32px_1fr_60px] sm:grid-cols-[44px_1fr_88px_70px_90px] items-center bg-bg-subtle px-2.5 sm:px-3.5 py-2 text-[11px] lowercase tracking-[0.03em] text-text-secondary">
                <span>{LN("rank")}</span>
                <span>{LN("player")}</span>
                <span className="text-right">{LN("score")}</span>
                <span className="hidden text-right sm:inline">{LN("matches")}</span>
                <span className="hidden text-right sm:inline">{LN("joined")}</span>
            </div>
            
            {top.map((item) => {
            return (
                <LeaderboardItem
                    key={item.id} 
                    p={item}
                    me={id === item.id}
                />
            )
            })}

            { showPinned && 
                <>
                    <div className="flex items-center justify-center py-1 text-gray-300 text-xs ">
                        .  .  .  .  .  .
                    </div>
                    <div className="sticky bottom-0 bg-blue-50 ">
                        <LeaderboardItem 
                            key={"pinned"}
                            p={me}
                            me={true}
                        />            
                    </div>
                </>
            }
        </ul>
    )
}


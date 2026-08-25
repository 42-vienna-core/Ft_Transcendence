import { useProfile } from "@/providers/ProfileContext";
import { LeaderboardData } from "@/types/gameTypes"
import { Avatar } from "@/ui/ava";

interface LeaderboardItemProps{
    p: LeaderboardData;
    me: boolean;
}

function LeaderboardItem({p, me}: LeaderboardItemProps) {
    const dateCreated = new Date(p.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'});


    return (
        <li className={`grid grid-cols-[44px_1fr_88px_70px_90px] items-center ${me && "bg-text-inverse"} border-b border-border-default px-3.5 py-[11px] text-[13px] last:border-b-0`}>
            <span className="font-medium tabular-nums text-text-secondary">{p.rank}</span>
            <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={p.name} avatar={p.avatar} style={"size-[30px]"}/>
                <div className="min-w-0">
                    <div className="truncate font-medium text-text-primary">{me ? "me" : p.name}</div>
                    <div className="text-[11px] text-text-secondary">level {p.level}</div>
                </div>
            </div>
            <span className="text-right tabular-nums text-text-primary">{p.score}</span>
            <span className="text-right tabular-nums text-text-secondary">{p.totMatches}</span>
            <span className="text-right text-xs text-text-tertiary">{dateCreated}</span>
        </li>
    )
}

export default function LeaderboardList({ rest }: { rest: LeaderboardData[] }) {
    const {id} = useProfile();
    const top_n = 5;
    const top = rest.slice(0, top_n);
    const isInTop = top.some(p => p.id === id);
    const me = rest.find(p => p.id === id);

    const showPined = me && !isInTop;

    return (
        <ul className="overflow-hidden rounded-xl border border-border-default">
            <div className="grid grid-cols-[44px_1fr_88px_70px_90px] items-center bg-bg-subtle px-3.5 py-2 text-[11px] lowercase tracking-[0.03em] text-text-secondary">
                <span>rank</span><span>player</span><span className="text-right">score</span><span className="text-right">matches</span><span className="text-right">joined</span>
            </div>

            {rest.map((item, idx) => {
                return (
                    <LeaderboardItem
                        key={item.id} 
                        p={item}
                        me={id === item.id}
                    />
                )
            })}
        </ul>
    )
}


import { useProfile } from "@/providers/ProfileContext";
import { LeaderboardData } from "@/types/gameTypes";
import { Avatar } from "@/ui/ava";
import { SkeletonBlock } from "@/ui/skeletons";
import { getOrdinal } from "@/ui/utils";
import { Crown } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "use-intl";

interface PodiumCardProps {
    p: LeaderboardData | undefined;
    place: number;
    me: number;
}

function PodiumCard({ p, place, me }: PodiumCardProps) {
    const ordinal = getOrdinal(place);
    const isMe = p ? p.id === me : false;
    const LN = useTranslations("leaderboard");

    return (
        <div className={`order-${place} ${place !== 1 && "mt-[14px]"} ${place === 1 ? "bg-warning-soft" : "bg-bg-subtle"} flex flex-col items-center gap-1.5 rounded-xl border border-border-default  px-3 py-4`}>
            <div>
                {place === 1 && <Crown className="w-[14px] h-[14px] inline mr-1.5" />}
                <span className="text-xs font-medium text-text-secondary">{ordinal}</span>
            </div>
            {
                p ?
                    <>
                        <Avatar name={p.name} avatar={p.avatar} style={"size-[46px]"}/>
                        <div className="max-w-full truncate text-sm font-medium text-text-primary">{isMe ? LN("me") : p.name}</div>
                        <div className="text-lg font-medium tabular-nums text-text-primary">{p.score}</div>
                        <div className="text-[11px] text-text-secondary"> {LN("lvl")} {p.level} · {p.totMatches} {LN("matches")}</div>
                    </>
                    :
                    <>
                        <SkeletonBlock className="h-[46px] w-[46px] mb-1 rounded-full bg-[#c4c4d0]" />
                        <SkeletonBlock className="h-[15px] w-[60px] mb-1 rounded-sm bg-[#c4c4d0]" />
                        <SkeletonBlock className="h-[15px] w-[31px] mb-1 rounded-sm bg-[#c4c4d0]" />
                        <SkeletonBlock className="h-[15px] w-[90px] rounded-sm bg-[#c4c4d0]" />
                    </>
            }
        </div>
    )
}

export default function TopThreePodium({ top3 }: { top3: LeaderboardData[] }) {
    const { id } = useProfile();

    return (
        <div className="mb-[18px] grid grid-cols-3 gap-2.5">
            <PodiumCard p={top3[1]} place={2} me={id} />
            <PodiumCard p={top3[0]} place={1} me={id} />
            <PodiumCard p={top3[2]} place={3} me={id} />
        </div>
    )
}
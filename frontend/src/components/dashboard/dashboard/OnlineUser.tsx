import { useAuth } from "@/src/components/provider/UserProvider"
import { OnlineUsersType } from '@/src/types/Types';
type Props = { obj?: OnlineUsersType }

export default function OnlineUser ({ obj } : Props) {
    if(!obj) return null;
    const {cntUser} = useAuth();

    return (
        <>
            <div className="flex items-center gap-2 min-w-0">
                <span className="h-3 w-3 shrink-0 rounded-full bg-green-500"></span>
                <span className="truncate font-medium">
                    {obj.id === cntUser?.id ? "You" : obj.Username}
                </span>
            </div>

            <div className="text-center">
                Lost <span className="font-medium">{obj.history.gamesLost}</span>
            </div>

            <div className="text-center">
                Won <span className="font-medium">{obj.history.gamesWon}</span>
            </div>

            <div className="text-center">
                Score <span className="font-medium">{obj.history.totalScore}</span>
            </div>

            <div className="flex justify-end md:justify-center">
                <span className="rounded-full bg-white/40 px-2 py-1 text-xs font-medium">
                {obj.role}
                </span>
            </div>
        </>
       
    )
}
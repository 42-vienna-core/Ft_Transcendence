import FriendsContent from './friends-list';
import RequestsContent from './requests';
import FindFriends from './search';

interface Request {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
        isOnline: boolean;
        score: number;
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
        <aside className="flex min-w-0 flex-col gap-2.5">
            <FindFriends/>

            <RequestsContent
                requests={requests}
                removeRequestCard={removeRequestCard}
                getListOfFriends={getListOfFriends}
            />
        </aside>
    );
}

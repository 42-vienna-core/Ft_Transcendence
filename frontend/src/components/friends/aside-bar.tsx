import FindFriends from './search';

export default function AsideBar() {    
    return (
        <aside className="flex min-w-0 flex-col gap-2.5">
            <FindFriends/>
        </aside>
    );
}

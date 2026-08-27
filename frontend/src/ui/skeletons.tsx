export function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse ${className}`} />;
}

export function HeaderProfileSkeleton() {
    return (
        <div
            className="flex max-w-[120px] items-center gap-2 rounded-full border border-border-default py-1 pl-1 pr-1 sm:w-[180px] sm:pr-4"
            aria-hidden={true}
        >
            <SkeletonBlock className="h-7 w-7 shrink-0 rounded-full bg-bg-muted" />
            <SkeletonBlock className="hidden h-3.5 w-16 rounded-sm bg-bg-muted sm:block" />
        </div>
    );
}


export function HeaderLinkSkeleton() {
    return (
        <div
            className="flex items-center justify-between py-[5px] px-[15px] gap-3 h-[38px] w-[150px] border border-cyan-400 rounded-3xl bg-[#4e4b4b]/70"
            aria-hidden={true}
        >
            <SkeletonBlock className="h-[16px] w-[60px] rounded-sm bg-[#c4c4d0]" />
            <SkeletonBlock className="w-[26px] h-[26px] rounded-full bg-[#c4c4d0]" />
        </div>
    );
}

export function UserProfileSkeleton() {
  return (
    <>
        <div className="flex items-center justify-between gap-[16px] aria-hidden={true}">
            <SkeletonBlock className="w-[64px] h-[64px] rounded-full bg-[#c4c4d0]" />
            <div className="">
                
                <SkeletonBlock className="mb-1 h-[16px] w-[98px] rounded-sm bg-[#c4c4d0]" />
                <SkeletonBlock className="mb-1 h-[16px] w-[98px] rounded-sm bg-[#c4c4d0]" />
                <SkeletonBlock className="mb-1 h-[16px] w-[57px] rounded-sm bg-[#c4c4d0]" />
            </div>
        </div>
    </>
  );
}

export function HeaderAuthLinkSkeleton() {
    return (
        <div className="flex items-center justify-between gap-[25px]">
            <SkeletonBlock className="px-0 py-[8px] bg-[#12121a]" />
            <SkeletonBlock className="px-0 py-[8px] bg-[#12121a]" />
        </div>
  );
}

export function FriendsContentSkeleton({friendNumber}: {friendNumber:number}) {
    const friendsPlaceholder = Array(friendNumber).fill(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-[14px] w-full animate-pulse">

            <ul className="flex flex-col gap-2 min-w-0">
                {friendsPlaceholder.map((_, index) => (
                    <li
                        key={index}
                        className="grid grid-cols-[26px_1fr_auto] items-start gap-4 rounded-md border border-border-default bg-bg-surface p-2.5"
                    >
                        <div className="size-8 shrink-0 rounded-full bg-bg-muted" />
                        <div className="min-w-0 pt-px">
                            <div className="h-3.5 w-24 rounded-sm bg-bg-muted" />
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-bg-muted" />
                                <div className="h-3 w-12 rounded-sm bg-bg-muted" />
                                <div className="h-3 w-1 rounded-sm bg-bg-muted" />
                                <div className="h-3 w-16 rounded-sm bg-bg-muted" />
                            </div>
                        </div>
                        <div className="ml-auto flex min-w-[76px] flex-col items-stretch gap-1">
                            <div className="h-[26px] w-full rounded-full bg-bg-muted" />
                        </div>
                    </li>
                ))}
            </ul>

            <aside className="hidden min-w-0 flex-col gap-[10px] lg:flex">
                <div className="rounded-md h-[198px] bg-bg-subtle px-3.5 py-3">
                    <div className="mb-2 h-3.5 w-24 rounded-sm bg-bg-muted" />
                    <div className="h-8 w-full rounded-md border border-border-default bg-bg-surface" />
                    <div className="max-h-[45vh]"/>
                </div>
            </aside>
        </div>
    );
}
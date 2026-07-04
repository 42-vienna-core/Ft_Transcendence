export function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse ${className}`} />;
}

export function HeaderProfileSkeleton() {
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
    const topFriendsPlaceholder = Array(5).fill(null);

    return (
        <div className="grid grid-cols-[1.6fr_1fr] gap-[14px] w-full animate-pulse">
            
            <div className="flex flex-col gap-[10px] min-w-0">
                {friendsPlaceholder.map((_, index) => (
                    <div 
                        key={index}
                        className="grid grid-cols-[32px_1fr_auto] gap-[10px] items-start p-[10px_12px] rounded-[var(--radius-md)] border border-gray-200 bg-[var(--color-bg-surface)]"
                    >
                        <div className="w-[32px] height-[32px] rounded-full bg-gray-300/60 dark:bg-gray-700/60 shrink-0" />
                        <div className="min-w-0 pt-[1px] flex flex-col gap-2">
                            <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="flex items-center gap-[6px] flex-wrap">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 shrink-0" />
                                <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
                                <span className="text-gray-300 dark:text-gray-700">·</span>
                                <div className="h-3 w-8 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                        <div className="w-8 h-7 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                ))}
            </div>

            <aside className="flex flex-col gap-[10px] min-w-0">
                <div className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-[12px_14px]">
                    <h3 className="flex items-center justify-between mb-2">
                        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
                    </h3>
                    
                    {topFriendsPlaceholder.map((_, index) => (
                        <div 
                            key={index} 
                            className={`grid grid-cols-[14px_8px_1fr_auto_auto] gap-[6px] items-center py-[5px] ${
                                index === 3 ? 'bg-[var(--color-info-soft)] mx-[-8px] px-2 rounded-[var(--radius-sm)]' : ''
                            }`}
                        >
                            <div className="h-3 w-3 bg-gray-300 dark:bg-gray-700 rounded justify-self-end" />
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="h-3 w-8 bg-gray-200 dark:bg-gray-800 rounded" />
                            <div className="h-3 w-6 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                <div className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-[12px_14px]">
                    <h3 className="flex items-center justify-between mb-2">
                        <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    </h3>
                    
                    <div className="grid grid-cols-[26px_1fr_auto] gap-[8px] items-center py-[5px]">
                        <div className="w-[26px] h-[26px] rounded-full bg-gray-300 dark:bg-gray-700 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 w-16 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="flex gap-[4px]">
                            <div className="w-[26px] h-[26px] rounded-[var(--radius-md)] bg-gray-200 dark:bg-gray-800" />
                            <div className="w-[26px] h-[26px] rounded-[var(--radius-md)] bg-gray-200 dark:bg-gray-800" />
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--color-bg-subtle)] rounded-[var(--radius-md)] p-[12px_14px]">
                    <h3 className="mb-2">
                        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                    </h3>
                    <div className="h-8 w-full bg-[var(--color-bg-surface)] border border-gray-200 rounded-[var(--radius-md)] mb-2" />
                    <div className="grid grid-cols-[26px_1fr_auto] gap-[8px] items-center py-[5px]">
                        <div className="w-[26px] h-[26px] rounded-full bg-gray-300 dark:bg-gray-700 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                </div>
            </aside>
        </div>
    );
}
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
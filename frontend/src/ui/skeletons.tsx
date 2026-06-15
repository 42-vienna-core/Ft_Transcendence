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
        <div className="flex items-center justify-between gap-[8px]">
            <SkeletonBlock className="w-[100px] h-[50px] px-[16px] py-[8px] rounded-[8px] bg-[#12121a]" />
            <SkeletonBlock className="w-[100px] h-[50px] px-[16px] py-[8px] rounded-[8px] bg-[#12121a]" />
        </div>
  );
}

//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
//   padding: 12px 24px;
//   border-radius: 8px;
//   font-family: inherit;
//   font-size: 0.9375rem;
//   font-weight: 600;
//   letter-spacing: 0.01em;
//   cursor: pointer;
//   border: 1px solid transparent;
//   transition: all 0.15s ease;
//   text-decoration: none;
//   white-space: nowrap;
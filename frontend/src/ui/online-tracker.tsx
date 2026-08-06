export function OnlineStateItem({isOnline}: {isOnline:boolean}) {
    return  (
        <div className="flex items-center">
            <span className="relative flex h-1 w-1 mr-1">
                {
                    isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )
                }
        
                <span 
                    className={`relative inline-flex rounded-full h-1 w-1 transition-colors duration-300 ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                />
            </span>

            <span className={`text-xs font-medium ${ 
                isOnline ? 
                    'text-emerald-500' : 'text-[var(--color-text-muted)]'
                }`}>
                {isOnline ? "online" : "offline"}
            </span>
        </div>
    )
}
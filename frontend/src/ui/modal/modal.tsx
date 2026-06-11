
function Modal () {
    return (
        <>
            {/* scrim */}
<div className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4">
  {/* modal */}
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 w-full max-w-2xl">
    {/* header */}
    <div className="flex items-start justify-between px-5 pt-5">
      <div>
        <h2 className="text-base font-medium">Start a match</h2>
        <p className="text-xs text-gray-500 mt-0.5">Pick how you'd like to play</p>
      </div>
      <button className="size-7 grid place-items-center rounded-md hover:bg-gray-100">
        <i className="ti ti-x" />
      </button>
    </div>

    {/* three option cards */}
    <div className="grid grid-cols-3 gap-2.5 p-5 pt-4">
      {/* one card */}
      <div className="bg-gray-50 rounded-md p-3.5 flex flex-col gap-2 ring-2 ring-blue-100">
        <div className="size-8 rounded-lg bg-blue-100 text-blue-800 grid place-items-center">
          <i className="ti ti-world text-lg" />
        </div>
        <div className="font-medium text-sm">Quick match</div>
        <div className="text-xs text-gray-500 leading-snug">Online matchmaking, balanced by rating.</div>
        {/* chip group */}
        <div className="flex gap-1 p-0.5 bg-white rounded-md border border-gray-200 mt-1">
          <button className="flex-1 text-[11px] py-1 rounded">4</button>
          <button className="flex-1 text-[11px] py-1 rounded bg-gray-100 font-medium">8</button>
          <button className="flex-1 text-[11px] py-1 rounded">12</button>
        </div>
        <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
          <i className="ti ti-clock text-[10px]" /> avg. wait ~8 s
        </div>
        <div className="flex-1" />
        <button className="bg-blue-700 text-white text-xs font-medium py-2 rounded-md flex items-center justify-center gap-1.5">
          Find match <i className="ti ti-arrow-right" />
        </button>
      </div>
      {/* repeat for the other two */}
    </div>

    {/* footer */}
    <div className="flex items-center justify-between px-5 pb-4 pt-3 border-t border-gray-200">
      <div className="text-xs text-gray-500">Last match: vs Mira · 920–810 · <span className="text-blue-700 font-medium">Rematch →</span></div>
      <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
        <kbd className="px-1 py-px rounded bg-gray-100 border border-gray-200">1</kbd>
        <kbd className="px-1 py-px rounded bg-gray-100 border border-gray-200">2</kbd>
        <kbd className="px-1 py-px rounded bg-gray-100 border border-gray-200">3</kbd>
        quick pick
        <kbd className="px-1 py-px rounded bg-gray-100 border border-gray-200">esc</kbd>
      </div>
    </div>
  </div>
</div>
        </>
    )
}

export default Modal;
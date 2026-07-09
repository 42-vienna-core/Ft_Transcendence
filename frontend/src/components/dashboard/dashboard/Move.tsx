export default function Move () {
    return (
    <div className="w-full flex justify-center p-10">
        <div className="  bg-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-wrap gap-4 justify-center items-center">

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-md border border-gray-700">←</span>
                <span className="text-sm">Move Left</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-md border border-gray-700">↑</span>
                <span className="text-sm">Move Top</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-md border border-gray-700">↓</span>
                <span className="text-sm">Move Bottom</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-800 rounded-md border border-gray-700">→</span>
                <span className="text-sm">Move Right</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-600 rounded-md font-semibold">Space</span>
                <span className="text-sm">Boost</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600 rounded-md font-semibold">ESC</span>
                <span className="text-sm">Pause</span>
            </div>

        </div>
    </div>
    )
}
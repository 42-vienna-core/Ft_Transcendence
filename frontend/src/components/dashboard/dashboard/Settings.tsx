import Timer from "./Timer";
import Move from "./Move"
import { RoomStateType } from "@/src/types/Types";

type Props = { roomState?: RoomStateType }

export default function Settings({ roomState } : Props) {
	

return (
	<section className=" aria-label='Snake game field' mb-5">

		<div className="w-full px-4 sm:px-6 pt-6 flex justify-center">
			<div className=" w-full max-w-5xl flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch sm:items-center justify-between bg-gray-900/80 backdrop-blur-md text-white rounded-xl px-4 sm:px-6 py-4 shadow-lg border border-gray-800 " >

				<div className="flex items-center gap-3 justify-between sm:justify-start">
					<div className="flex items-center gap-3">
						<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
						<span className="text-sm tracking-wide">
							Live Match · Room {" : "}<span className="text-red-500">{roomState?.roomStatus}</span>
						</span>
					</div>
				</div>

				<div className=" text-sm font-medium  bg-gray-800 px-3 py-1  rounded-md border border-gray-700 text-center whitespace-nowrap ">
					Players{" "}
					<span className="text-green-400 font-bold">{roomState?.players}</span> / 4
				</div>

				<div className="flex items-center gap-2 justify-between sm:justify-end">
					<span className="text-xs text-gray-300">Time</span>
					<div className="bg-black px-3 py-1 rounded-md border border-gray-700">
					<Timer />
					</div>
				</div>

			</div>
		</div>
		<Move />

	</section>
);
}
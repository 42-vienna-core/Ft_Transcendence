import { useEffect, useState } from "react";

export default function GameBoard() {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          gameStart();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function gameStart() {
    console.log("Game Started");
    // Call your API or socket event here
    // socket.emit("game-start");
  }

  return (
    <div className="bg border required h-screen p-5 flex flex-col items-center justify-center">
      <h1 className="text-white text-2xl mb-4">
        Starting in: {timeLeft}s
      </h1>

      <canvas
        className="border border-amber-500 bg-gray-900"
        width={500}
        height={500}
      />
    </div>
  );
}
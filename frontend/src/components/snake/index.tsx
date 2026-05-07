import style from './snake.module.css';

function SnakeRacer() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 -z-10 h-full w-full opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Create the glow effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* The Serpent Path - you can adjust this 'd' attribute for different shapes */}
      <path
        d="M 100 300 C 100 100, 300 100, 300 300 S 500 500, 500 300 S 700 100, 700 300"
        stroke="#00ff00" // Neon Green
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        filter="url(#glow)"
        className="animate-snake-race" // We define this animation next
      />
    </svg>
  );
};

export default SnakeRacer
'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useGameSocket } from '@/providers/SocketProvider';
import { useProfile } from '@/providers/ProfileContext';
import { Socket } from 'socket.io-client';
import { useRouter } from "next/navigation";
import { useGameMode } from "@/components/store/useUserStore";
import { useGameControls } from "@/hooks/useGameControls";
import { ControlType, Direction } from "@/types/gameTypes";

const CELL = 20;
const STEP = 100 / 1000;   

interface Position {
    x: number;
    y: number;
}

interface Snake {
    id: number;
    body: Position[];
    direction: Direction;
    newDirection: Direction | null;
    newPosition: Position | null;
    willGrow: boolean;
    alive: boolean;
    score: number;
    color: string;
    player: 'human' | 'bot';
}

interface Food {
    position: Position;
    eaten: boolean;
}

export interface Game {
    roomId: string;
    snakes: Snake[];
    food: Food[];
    status: 'waiting' | 'running' | 'finished';
    tick: number;
    gridWidth: number;
    gridHeight: number;
    winnerId: number | null;
    botPresent: boolean;
}

type GameState = 'START' | 'PAUSE' | 'END' | 'WIN' | 'OVER' | null;
type SoundEffectType = 'eat' | 'gameover' | 'win';

interface FitCanvasProps {
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    cssWidth: number;
    cssHeight: number;
}

interface GameProps {
    control: ControlType;
    setGameState: Dispatch<SetStateAction<GameState>>;
    setGameDir: (state: Direction) => void;
}

function fitCanvas({ canvas, ctx, cssWidth, cssHeight }: FitCanvasProps) {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

const lerp = (start: number, end: number, alpha: number): number => {
    return start + (end - start) * alpha;
};

export default function GameCanvas({control, setGameState, setGameDir }: GameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const gameStateRef = useRef<GameState>('START');
    const currentDirection = useRef<Direction>('RIGHT');
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const gameoverSound = useRef<HTMLAudioElement | null>(null);
    const winSound = useRef<HTMLAudioElement | null>(null);
    const eatSound = useRef<HTMLAudioElement | null>(null);


    const [isMuted, setIsMuted] = useState(true);

    const { id } = useProfile();
    const router = useRouter();
    const { gameMode, resetMode} = useGameMode();
    const { isConnected, socket } = useGameSocket();

    const prevRef = useRef<Game | null>(null);
    const currRef = useRef<Game | null>(null);
    const stateTimeRef = useRef<number>(0);

    const alphaRef = useRef<number>(0);
    const stepRef = useRef<boolean>(false);
    const screenRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const soundFlagLs = localStorage.getItem('soundtrack');
        if (soundFlagLs) {
            const parsedSoundFlag = JSON.parse(soundFlagLs)
            setIsMuted(parsedSoundFlag);
        }

        // bgMusicRef.current = new Audio('/sounds/snake-dies-with-game-over.mp3');
        gameoverSound.current = new Audio('/sounds/gameover.mp3'); 
        winSound.current = new Audio('/sounds/win.mp3');
        eatSound.current = new Audio('/sounds/eat.mp3');

        return () => {
            bgMusicRef.current?.pause();
            gameoverSound.current?.pause();
            winSound.current?.pause();
            bgMusicRef.current = null;
            gameoverSound.current = null;
            winSound.current = null;
        }
    },[])

    const playSoundEffect = (type: SoundEffectType) => {
        if (!isMuted) return;

        if (type === 'gameover' && gameoverSound) {
            gameoverSound.current?.play().catch(() => {})
        }

        if (type === 'win' && winSound) {
            winSound.current?.play().catch(() => {})
        }

        if (type === 'eat' && winSound) {
            winSound.current?.play().catch(() => {})
        }

    }

    const isEnded = () =>
        gameStateRef.current === 'OVER' ||
        gameStateRef.current === 'WIN' ||
        gameStateRef.current === 'END';

    const handleDirectionChange = (newDirection: Direction) => {
        const current = currentDirection.current;

        if (isEnded()) return; 

        setGameState((current) => {
            if (current === 'PAUSE') {
                gameStateRef.current = 'START';
                return 'START';
            }
            return current;
        });

        if (newDirection === 'UP' && current === 'DOWN') return;
        if (newDirection === 'DOWN' && current === 'UP') return;
        if (newDirection === 'LEFT' && current === 'RIGHT') return;
        if (newDirection === 'RIGHT' && current === 'LEFT') return;

        currentDirection.current = newDirection;
        setGameDir(newDirection);
    
        if (socket && isConnected) {
            advanceSnake(socket, newDirection);
        }
    };

    useGameControls(control, handleDirectionChange);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !socket || !isConnected) return;

        const context = canvas.getContext('2d');
        ctxRef.current = context;

        const handleGameState = (data: Game) => {
            prevRef.current = currRef.current;  
            currRef.current = data;             
            stateTimeRef.current = performance.now();
            stepRef.current = !stepRef.current;     

            if (data.status === 'finished') {
                const won = String(data.winnerId) === String(id);

                gameStateRef.current = won ? 'WIN' : 'OVER';
                setGameState(won ? 'WIN' : 'OVER');
                if (won) {
                    playSoundEffect('win');
                } else {
                    playSoundEffect('gameover');
                } 
            }
        };

        socket.on("game-state", handleGameState);
        setGameState('START');

        let rafId: number;

        const container = document.getElementById('canvas-container');
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = Math.floor(entry.contentRect.width);
                const height = Math.floor(entry.contentRect.height - 120);
                screenRef.current = { width, height };
                fitCanvas({ canvas, ctx: context, cssWidth: width, cssHeight: height });
            }
        });

        resizeObserver.observe(container);

        const TICK = STEP;
        const frame = (now: number) => {
            const elapsed = (now - stateTimeRef.current) / 1000;
            alphaRef.current = Math.min(elapsed / TICK, 1);

            draw();
            rafId = requestAnimationFrame(frame);
        };
        rafId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            socket.off("game-state", handleGameState);
        };
    }, [socket, isConnected, id, setGameState, setGameDir]);

    function advanceSnake(socket: Socket, dir: Direction) {
        const room = currRef.current?.roomId;
        if (!room) return;
        socket.emit('change-direction', { direction: dir, roomId: room, userId: id });
    }

    function handleRestart() {
        const room = currRef.current?.roomId;
        if (socket && room) {
            socket.emit('restart-game', { roomId: room, userId: id });
        }
        gameStateRef.current = 'END';
        setGameState('END');
        resetMode();
        router.push('/');
        router.refresh();
    }

    function draw() {
        const ctx = ctxRef.current;
        const curr = currRef.current;
        const prev = prevRef.current;
        if (!ctx || !curr) return;

        const snakes = curr.snakes;
        const food = curr.food;
        const alpha = alphaRef.current;
        const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = screenRef.current;

        const WORLD_WIDTH = curr.gridWidth * CELL;
        const WORLD_HEIGHT = curr.gridHeight * CELL;

        const mySnake = snakes.find(s => String(s.id) === String(id));
        if (!mySnake || mySnake.body.length === 0) return;

        const prevMy = prev?.snakes.find(s => String(s.id) === String(id));
        const prevHead = prevMy?.body[0] ?? mySnake.body[0];
        const myHeadX = lerp(prevHead.x, mySnake.body[0].x, alpha) * CELL + CELL / 2;
        const myHeadY = lerp(prevHead.y, mySnake.body[0].y, alpha) * CELL + CELL / 2;

        const cameraX = myHeadX - SCREEN_WIDTH / 2;
        const cameraY = myHeadY - SCREEN_HEIGHT / 2;

        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        ctx.save();
        ctx.translate(-cameraX, -cameraY);

        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 8;
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 15;
        ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#1e2224';
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        const tileStartX = Math.max(0, Math.floor(cameraX / CELL) * CELL);
        const tileEndX = Math.min(WORLD_WIDTH, cameraX + SCREEN_WIDTH + CELL);
        const tileStartY = Math.max(0, Math.floor(cameraY / CELL) * CELL);
        const tileEndY = Math.min(WORLD_HEIGHT, cameraY + SCREEN_HEIGHT + CELL);

        for (let x = tileStartX; x < tileEndX; x += CELL) {
            for (let y = tileStartY; y < tileEndY; y += CELL) {
                ctx.fillStyle = '#23272a';
                ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

                ctx.fillStyle = '#2c3135';
                ctx.fillRect(x + 1, y + 1, 1, 1);
            }
        }

        for (const snake of snakes) {
            const totalSegments = snake.body.length;
            const prevSnake = prev?.snakes.find(s => String(s.id) === String(snake.id));

            const facing = snake.newDirection ?? snake.direction;

            snake.body.forEach((seg, index) => {
                const prevSeg = prevSnake?.body[index] ?? seg; 
                const renderX = lerp(prevSeg.x, seg.x, alpha) * CELL;
                const renderY = lerp(prevSeg.y, seg.y, alpha) * CELL;

                const size = CELL - 1;
                if (index === 0) {
                    ctx.beginPath();
                }

                ctx.fillStyle = snake.color;

                if (index === 0) {
                    const radii = 5;

                    ctx.roundRect(renderX, renderY, CELL - 1, CELL - 1, radii);
                    ctx.fill();

                    ctx.fillStyle = '#FF3333';
                    ctx.beginPath();

                    if (facing === 'RIGHT') {
                        ctx.fillRect(renderX + CELL - 1, renderY + CELL / 2 - 2, 6, 3);
                        ctx.fillRect(renderX + CELL + 4, renderY + CELL / 2 - 4, 2, 2);
                        ctx.fillRect(renderX + CELL + 4, renderY + CELL / 2 + 1, 2, 2);
                    } else if (facing === 'LEFT') {
                        ctx.fillRect(renderX - 6, renderY + CELL / 2 - 2, 6, 3);
                        ctx.fillRect(renderX - 7, renderY + CELL / 2 - 4, 2, 2);
                        ctx.fillRect(renderX - 7, renderY + CELL / 2 + 1, 2, 2);
                    } else if (facing === 'UP') {
                        ctx.fillRect(renderX + CELL / 2 - 2, renderY - 6, 3, 6);
                        ctx.fillRect(renderX + CELL / 2 - 4, renderY - 7, 2, 2);
                        ctx.fillRect(renderX + CELL / 2 + 1, renderY - 7, 2, 2);
                    } else if (facing === 'DOWN') {
                        ctx.fillRect(renderX + CELL / 2 - 2, renderY + CELL - 1, 3, 6);
                        ctx.fillRect(renderX + CELL / 2 - 4, renderY + CELL + 4, 2, 2);
                        ctx.fillRect(renderX + CELL / 2 + 1, renderY + CELL + 4, 2, 2);
                    }

                    ctx.fillStyle = 'white';
                    let eye1 = { x: 0, y: 0 };
                    let eye2 = { x: 0, y: 0 };

                    if (facing === 'RIGHT') {
                        eye1 = { x: renderX + CELL - 8, y: renderY + 4 };
                        eye2 = { x: renderX + CELL - 8, y: renderY + CELL - 9 };
                    } else if (facing === 'LEFT') {
                        eye1 = { x: renderX + 4, y: renderY + 4 };
                        eye2 = { x: renderX + 4, y: renderY + CELL - 9 };
                    } else if (facing === 'UP') {
                        eye1 = { x: renderX + 4, y: renderY + 4 };
                        eye2 = { x: renderX + CELL - 9, y: renderY + 4 };
                    } else if (facing === 'DOWN') {
                        eye1 = { x: renderX + 4, y: renderY + CELL - 8 };
                        eye2 = { x: renderX + CELL - 9, y: renderY + CELL - 8 };
                    }

                    ctx.fillRect(eye1.x, eye1.y, 4, 4);
                    ctx.fillRect(eye2.x, eye2.y, 4, 4);

                    ctx.fillStyle = 'black';
                    ctx.fillRect(eye1.x + 1, eye1.y + 1, 2, 2);
                    ctx.fillRect(eye2.x + 1, eye2.y + 1, 2, 2);
                } else {
                    const isTipOfTail = index === totalSegments - 1;

                    if (isTipOfTail) {
                        ctx.beginPath();

                        const prevSegBody = snake.body[index - 1];

                        let p1 = { x: renderX, y: renderY };
                        let p2 = { x: renderX, y: renderY + CELL - 1 };
                        let tip = stepRef.current
                            ? { x: renderX + CELL, y: renderY + (CELL / 2 + 5) }
                            : { x: renderX + CELL, y: renderY + (CELL / 2 - 5) };

                        if (prevSegBody) {
                            if (seg.x < prevSegBody.x) {
                                p1 = { x: renderX + CELL, y: renderY };
                                p2 = { x: renderX + CELL, y: renderY + CELL - 1 };
                                tip = stepRef.current
                                    ? { x: renderX, y: renderY + (CELL / 2 + 5) }
                                    : { x: renderX, y: renderY + (CELL / 2 - 5) };
                            } else if (seg.y > prevSegBody.y) {
                                p1 = { x: renderX, y: renderY };
                                p2 = { x: renderX + CELL - 1, y: renderY };
                                tip = stepRef.current
                                    ? { x: renderX + (CELL / 2 + 5), y: renderY + CELL }
                                    : { x: renderX + (CELL / 2 - 5), y: renderY + CELL };
                            } else if (seg.y < prevSegBody.y) {
                                p1 = { x: renderX, y: renderY + CELL };
                                p2 = { x: renderX + CELL - 1, y: renderY + CELL };
                                tip = stepRef.current
                                    ? { x: renderX + (CELL / 2 + 5), y: renderY }
                                    : { x: renderX + (CELL / 2 - 5), y: renderY };
                            }
                        }

                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.lineTo(tip.x, tip.y);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.roundRect(renderX, renderY, size, size, 4);
                        ctx.fill();
                    }
                }
            });
        }

        for (const f of food) {
            if (f.eaten) continue; 
            ctx.beginPath();
            ctx.arc(f.position.x * CELL + CELL / 2, f.position.y * CELL + CELL / 2, CELL / 3, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
        }

        ctx.restore();
    }

    const showOver = gameStateRef.current === 'OVER' || gameStateRef.current === 'END';
    const showWin = gameStateRef.current === 'WIN';

    return (
        <div style={{ position: 'relative' }}>
            <canvas ref={canvasRef} className="rounded-xl" />

            {(showOver || showWin) && (
                <div
                    style={{ position: 'absolute', inset: 0 }}
                    className="flex flex-col items-center justify-center bg-black/60 rounded-xl"
                >
                    <h2 className={`text-3xl font-bold mb-4 ${showWin ? 'text-green-400' : 'text-red-500'}`}>
                        {showWin ? 'You Win!' : 'Game Over'}
                    </h2>
                    <button
                        onClick={handleRestart}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
'use client';

import { boolean } from 'zod';
import style from '../arena-content.module.css' 
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const CELL = 20; 
const STEP = 1 / 10; 
const WORLD_SIZE = 1000;
let step: boolean = false;
let alpha: number;
let SCREEN_HEIGHT = 0;
let SCREEN_WIDTH = 0;


type DIR = 'U' | 'D' | 'L' | 'R' | null;
type GameState = 'START' | 'PAUSE' | 'END' | 'WIN' | 'OVER' | null;

interface Segments { x: number; y: number; }
interface Snake { color: string; segments: Segments[]; direction: DIR; }
interface Food { x: number; y: number; }
interface State { snake: Snake[]; food: Food[]; }

const state: State = {
    snake: [{
        color: 'green', 
        segments: [{ x: 35, y: 35 }, { x: 34, y: 35 }, { x: 33, y: 35 }],
        direction: 'R' 
    }],
    food: [{ x: 38, y: 35 }, { x: 20, y: 20 }, { x: 45, y: 40 }]
};

interface FitCanvasProps {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  cssWidth: number;
  cssHeight: number;
}

interface GameProps {
  setGameState: Dispatch<SetStateAction<GameState>>;
  setGameDir: (state: DIR) => void;
}

function fitCanvas({ canvas, ctx, cssWidth, cssHeight }: FitCanvasProps) {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  ctx.scale(dpr, dpr);
}

const lerp = (start: number, end: number, alpha: number): number => {
    return start + (end - start) * alpha;
};

export default function GameCanvas({setGameState, setGameDir} : GameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const gameStateRef = useRef<GameState>('START');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setGameState('START');
        setGameDir(state.snake[0].direction);

        const context = canvas.getContext('2d');
        ctxRef.current = context;

        let rafId: number;
        let lastTime: number = performance.now();
        let acc: number = 0;
        
        const container = document.getElementById('canvas-container');
        if (!container) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', ' '].includes(e.key)) {
                e.preventDefault();

                setGameState((current) => {
                    if (current === 'PAUSE') {
                        lastTime = performance.now();
                        gameStateRef.current = 'PAUSE';
                        return 'START';
                    }
                    return current;
                });

                const currentDir = state.snake[0].direction;

                if (e.key === 'ArrowUp' && currentDir !== 'D') {
                    setGameDir('U');
                    state.snake[0].direction = 'U'
                } else if (e.key === 'ArrowDown' && currentDir !== 'U') {
                    setGameDir('D');
                    state.snake[0].direction = 'D'
                } else if (e.key === 'ArrowLeft' && currentDir !== 'R') {
                    setGameDir('L');
                    state.snake[0].direction = 'L'
                } else if (e.key === 'ArrowRight' && currentDir !== 'L') {
                    setGameDir('R');
                    state.snake[0].direction = 'R'
                } else if(e.key === 'Escape') {
                    setGameDir(null);
                    setGameState('END');
                    gameStateRef.current = 'END';
                }
            }
        };

        const handleWindowBlur = () => {
            setGameState((currentState) => {
                if (currentState === 'START') {
                    gameStateRef.current = 'PAUSE';
                    return 'PAUSE';
                }
                return currentState;
            });
        };

        const handleWindowFocus = () => {
            setGameState((currentState) => {
                if (currentState === 'PAUSE') {
                    lastTime = performance.now();
                    gameStateRef.current = 'START';
                    return 'START';

                }
                return currentState;
            });
        };

        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const containerWidth = entry.contentRect.width;
                const containerHeight = entry.contentRect.height;

                const width = Math.floor(containerWidth);
                const height = Math.floor(containerHeight - 120);


                SCREEN_HEIGHT = height;
                SCREEN_WIDTH =  width;

                console.log("width: ",width);
                console.log("hight: ",height);

                fitCanvas({ canvas, ctx: context, cssWidth: SCREEN_WIDTH, cssHeight: SCREEN_HEIGHT });

            }
        });

        window.addEventListener('keydown', handleKeyDown);

        resizeObserver.observe(container);




        const frame = (now: number) => {
            if (gameStateRef.current === 'START') {
                acc += (now - lastTime) / 1000;

                while (acc >= STEP) {
                    advanceSnake(); 
                    checkCollision(); 
                    acc -= STEP;
                    alpha = acc / STEP;
                    step = !step;
                }
            }

            lastTime = now;

            draw(state);
            rafId = requestAnimationFrame(frame);
        };

        rafId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameStateRef.current === 'START']);

    function advanceSnake() {
        for (const snake of state.snake) {
            const head = snake.segments[0];
            let newHead: Segments = { x: head.x, y: head.y };

            if (snake.direction === 'U') newHead.y -= 1;
            else if (snake.direction === 'D') newHead.y += 1;
            else if (snake.direction === 'L') newHead.x -= 1;
            else if (snake.direction === 'R') newHead.x += 1;

            snake.segments.unshift(newHead);

            let ateFood = false;
            for (let i = 0; i < state.food.length; i++) {
                if (newHead.x === state.food[i].x && newHead.y === state.food[i].y) {
                    ateFood = true;
                    state.food[i] = {
                        x: Math.floor(Math.random() * (WORLD_SIZE / CELL)),
                        y: Math.floor(Math.random() * (WORLD_SIZE / CELL))
                    };
                    break;
                }
            }

            if (!ateFood) {
                snake.segments.pop();
            }
        }
    }

    function checkCollision() {
        const head = state.snake[0].segments[0];
        const maxCells = WORLD_SIZE / CELL; 

        if (head.x < 0 || head.x >= maxCells || head.y < 0 || head.y >= maxCells) {
            setGameState('OVER');
            gameStateRef.current = 'OVER';
        }

        const body = state.snake[0].segments;
        for (let i = 1; i < body.length; i++) {
            if (head.x === body[i].x && head.y === body[i].y) {
                setGameState('OVER');
                gameStateRef.current = 'OVER';
            }
        }
    }

    function handleRestart() {
        state.snake[0].segments = [{ x: 35, y: 35 }, { x: 34, y: 35 }, { x: 33, y: 35 }];
        setGameDir('R');
        state.snake[0].direction = 'R';
        setGameState('START');
        gameStateRef.current = 'START';
    }

    function draw(gameState: State) {
        const ctx = ctxRef.current;
        if (!ctx) return;

        const head = gameState.snake[0].segments[0];
        const myHeadX = head.x * CELL + CELL / 2;
        const myHeadY = head.y * CELL + CELL / 2;

        const cameraX = myHeadX - SCREEN_WIDTH / 2;
        const cameraY = myHeadY - SCREEN_HEIGHT / 2;

        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        ctx.save(); 
        ctx.translate(-cameraX, -cameraY);

        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 8;
        ctx.shadowColor = '#ff3333';
        ctx.shadowBlur = 15;
        ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);
        ctx.shadowBlur = 0; 

        ctx.fillStyle = '#1e2224'; 
        ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

        for (let x = 0; x < WORLD_SIZE; x += CELL) {
            for (let y = 0; y < WORLD_SIZE; y += CELL) {
                ctx.fillStyle = '#23272a';
                ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
            
                ctx.fillStyle = '#2c3135';
                ctx.fillRect(x + 1, y + 1, 1, 1);
            }
        }

        for (const snake of gameState.snake) {
            const totalSegments = snake.segments.length;
        
            for (const [index, seg] of snake.segments.entries()) {
                const renderX = lerp(seg.x, seg.x, alpha) * CELL;
                const renderY = lerp(seg.y, seg.y, alpha) * CELL;
            
            
                const size = CELL - 1;
                if (index === 0) {
                    ctx.beginPath();
                }
            
                ctx.fillStyle = '#12ea94'; 
            
                if (index === 0) {
                
                    let radii = 5; 
                
                    ctx.roundRect(renderX, renderY, CELL - 1, CELL - 1, radii);
                    ctx.fill();
                
                    ctx.fillStyle = '#FF3333'; 
                    ctx.beginPath();
                
                    if (snake.direction === 'R') {
                        ctx.fillRect(renderX + CELL - 1, renderY + CELL / 2 - 2, 6, 3);
                        ctx.fillRect(renderX + CELL + 4, renderY + CELL / 2 - 4, 2, 2);
                        ctx.fillRect(renderX + CELL + 4, renderY + CELL / 2 + 1, 2, 2);
                    } else if (snake.direction === 'L') {
                        ctx.fillRect(renderX - 6, renderY + CELL / 2 - 2, 6, 3);
                        ctx.fillRect(renderX - 7, renderY + CELL / 2 - 4, 2, 2);
                        ctx.fillRect(renderX - 7, renderY + CELL / 2 + 1, 2, 2);
                    } else if (snake.direction === 'U') {
                        ctx.fillRect(renderX + CELL / 2 - 2, renderY - 6, 3, 6);
                        ctx.fillRect(renderX + CELL / 2 - 4, renderY - 7, 2, 2);
                        ctx.fillRect(renderX + CELL / 2 + 1, renderY - 7, 2, 2);
                    } else if (snake.direction === 'D') {
                        ctx.fillRect(renderX + CELL / 2 - 2, renderY + CELL - 1, 3, 6);
                        ctx.fillRect(renderX + CELL / 2 - 4, renderY + CELL + 4, 2, 2);
                        ctx.fillRect(renderX + CELL / 2 + 1, renderY + CELL + 4, 2, 2);
                    }
                
                    ctx.fillStyle = 'white';
                    let eye1 = { x: 0, y: 0 };
                    let eye2 = { x: 0, y: 0 };
                
                    if (snake.direction === 'R') {
                        eye1 = { x: renderX + CELL - 8, y: renderY + 4 };
                        eye2 = { x: renderX + CELL - 8, y: renderY + CELL - 9 };
                    } else if (snake.direction === 'L') {
                        eye1 = { x: renderX + 4, y: renderY + 4 };
                        eye2 = { x: renderX + 4, y: renderY + CELL - 9 };
                    } else if (snake.direction === 'U') {
                        eye1 = { x: renderX + 4, y: renderY + 4 };
                        eye2 = { x: renderX + CELL - 9, y: renderY + 4 };
                    } else if (snake.direction === 'D') {
                        eye1 = { x: renderX + 4, y: renderY + CELL - 8 };
                        eye2 = { x: renderX + CELL - 9, y: renderY + CELL - 8 };
                    }
                
                    ctx.fillRect(eye1.x, eye1.y, 4, 4);
                    ctx.fillRect(eye2.x, eye2.y, 4, 4);
                
                    ctx.fillStyle = 'black'; // Зрачки
                    ctx.fillRect(eye1.x + 1, eye1.y + 1, 2, 2);
                    ctx.fillRect(eye2.x + 1, eye2.y + 1, 2, 2);
                } else {
                    const isTipOfTail = index === totalSegments - 1;
                
                    if (isTipOfTail) {
                        ctx.beginPath();

                        const prevSeg = snake.segments[index - 1];

                        let p1 = { x: renderX, y: renderY };
                        let p2 = { x: renderX, y: renderY + CELL - 1 };
                        let tip =  step ? { x: renderX + CELL, y: renderY + (CELL / 2 + 5) } : 
                            { x: renderX + CELL, y: renderY + (CELL / 2 - 5) };
            
                        if (prevSeg) {
                            if (seg.x < prevSeg.x) {
                                p1 = { x: renderX + CELL, y: renderY };          
                                p2 = { x: renderX + CELL, y: renderY + CELL - 1 }; 
                                if (step)
                                    tip = { x: renderX, y: renderY + (CELL / 2 + 5) };       
                                else 
                                    tip = { x: renderX, y: renderY + (CELL / 2 - 5) }; 
                            } else if (seg.y > prevSeg.y) {
                                p1 = { x: renderX, y: renderY };
                                p2 = { x: renderX + CELL - 1, y: renderY };
                                if (step)
                                    tip = { x: renderX + (CELL / 2 + 5), y: renderY + CELL };        
                                else 
                                    tip = { x: renderX + (CELL / 2 - 5), y: renderY + CELL };
                            } else if (seg.y < prevSeg.y) {
                                p1 = { x: renderX, y: renderY + CELL };
                                p2 = { x: renderX + CELL - 1, y: renderY + CELL };
                                if (step)
                                    tip = { x: renderX + (CELL / 2 + 5), y: renderY };
                                else 
                                    tip = { x: renderX + (CELL / 2 - 5), y: renderY };
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
            }
        }

        for (const f of gameState.food) {
            ctx.beginPath();
            ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 3, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
        }

        ctx.restore(); 
    }

    if (gameStateRef.current === 'OVER' || gameStateRef.current === 'END') {
        return (
            <div >
                <h2 className="text-center text-red-500 text-3xl font-bold mb-4">Game Over</h2>
                <button 
                    onClick={handleRestart}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return ( 
        <canvas ref={canvasRef}  className="rounded-xl"></canvas>
    );
}

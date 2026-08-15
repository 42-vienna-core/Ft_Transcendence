"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Users, X, LoaderCircle } from "lucide-react";
import ModalLayout from "./modal-layout";
import { RoomData } from "@/types/gameTypes";

interface LobbyModalProps {
    isOpen: boolean;
    roomData: RoomData | null;
    onStartmatch: () => void;
    onClose: () => void;
}

const MAX_PLAYERS = 4;
const COUNTDOWN_SECONDS = 20;
const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Player {
    id: number; 
    name: string; 
    avatar: string | null;
    isOwner: boolean;
}

function FilledSlot({ player }: { player: Player }) {
    return (
        <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-subtle p-3">
            <div className={`grid size-9 place-items-center rounded-full text-sm font-medium capitalize ${player.avatar}`}>
                {player.name}
            </div>
            <span className="text-xs font-medium capitalize text-text-primary">{player.name}</span>
            {player.isOwner ? (
                <span className="rounded-full bg-accent-soft px-2 py-px text-[10px] font-medium text-accent-text">
                    host
                </span>
            ) : (
                <span className="text-[10px] text-text-tertiary">&nbsp;</span>
            )}
        </div>
    );
}

function EmptySlot() {
    return (
        <div className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-default">
            <div className="grid size-9 place-items-center rounded-full text-text-disabled">
                <LoaderCircle className="h-4 w-4 animate-spin text-center text-accent" />
            </div>
            <span className="text-[11px] text-text-tertiary">waiting</span>
        </div>
    );
}

export default function LobbyModal({
    isOpen,
    onClose,
    roomData,
    onStartmatch,
}: LobbyModalProps) {
    
    const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
    useEffect(() => {
        if (!isOpen || !roomData) return;

        const current_time: number = Date.now();
   
        const timer  =  Math.floor((roomData.timer - current_time) / 1000)
        console.log(timer);
       
        setSecondsLeft(timer);
        const interval = setInterval(() => {
            setSecondsLeft(prev => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, roomData]);

    useEffect(() => {
        if (isOpen && secondsLeft === 0) {
            onStartmatch();
        }
    }, [isOpen, secondsLeft, onStartmatch]);

    if (!isOpen || !roomData) return null;

    const players = roomData.players ? roomData.players: [];
    const emptySlots = Array.from({ length: Math.max(MAX_PLAYERS - players.length, 0) });
    const progress = secondsLeft / COUNTDOWN_SECONDS;
    const dashoffset = CIRCUMFERENCE * (1 - progress);

    return (
        <ModalLayout>
            {/* header */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="!text-xl font-medium text-text-primary">Waiting for friends</h2>
                    <p className="mt-1 text-sm text-text-secondary">then start when you're ready</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="cursor-pointer rounded-md p-1.5 text-text-tertiary transition-colors duration-150 hover:bg-bg-subtle hover:text-text-primary"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* player slots */}
            <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    <Users className="h-3.5 w-3.5" />
                    players
                </span>
                <span className="text-xs font-medium text-text-secondary">
                    {players.length} / {MAX_PLAYERS} joined
                </span>
            </div>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bg-subtle">
                <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${(players.length / MAX_PLAYERS) * 100}%` }}
                />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
                {players.map(player => (
                    <FilledSlot key={player.id} player={player} />
                ))}
                {emptySlots.map((_, i) => (
                    <EmptySlot key={`empty-${i}`} />
                ))}
            </div>

            {/* timing */}
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-bg-subtle px-4 py-3">
                <div className="relative grid h-10 w-10 shrink-0 place-items-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
                        <circle cx="20" cy="20" r={RADIUS} fill="none" stroke="var(--color-border-default)" strokeWidth="3" />
                        <circle
                            cx="20" cy="20" r={RADIUS} fill="none"
                            stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashoffset}
                            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                        />
                    </svg>
                    <span className="text-sm font-semibold tabular-nums text-text-primary">{secondsLeft}</span>
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary">
                        Starting in {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-text-tertiary">Friends can still join until it starts</div>
                </div>
            </div>

            {/* start / cancel */}
            <div className="mt-5 flex gap-2.5">
                <button
                    type="button"
                    className="flex-1 cursor-pointer rounded-lg bg-accent py-2.5 text-sm font-medium text-text-inverse transition-colors duration-150 hover:bg-accent-hover"
                    onClick={onStartmatch}
                >
                    Start now
                </button>
                <button
                    type="button"
                    className="cursor-pointer rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-bg-subtle hover:text-text-primary"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-text-tertiary">
                <Bot className="h-3.5 w-3.5" />
                If no one joins, you'll play against the computer
            </p>
        </ModalLayout>
    );
}

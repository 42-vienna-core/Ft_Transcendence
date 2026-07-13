 'use client';
 
import ArenaContent from "@/components/arena/arena-content";
import StartMatch from "@/components/arena/start-match";
import { useState } from "react";
 
type GameMode = 'QUICK' | 'FRIEND' | 'CPU';

 function Arena () {
    const [gameMode, setGameMode] = useState<GameMode | null>(null);

    function onStartMatch(matchMode: GameMode) {
        setGameMode(matchMode);
    }

    if (!gameMode) {
        return (
            <StartMatch 
                onStartMatch={onStartMatch}
            />
        );
    } else {
        return (
            <ArenaContent />
        );
    }
    
}

export default Arena;
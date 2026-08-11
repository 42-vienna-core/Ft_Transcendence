import { ControlType, Direction } from "@/types/gameTypes";
import { useEffect, useRef } from "react";

const arrowMapping: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
};

const wasdMapping: Record<string, Direction> = {
    KeyW: 'UP',
    KeyS: 'DOWN',
    KeyA: 'LEFT',
    KeyD: 'RIGHT',
};

export function useGameControls(
    controlType: ControlType,
    onDirectionChange: (newDirection: Direction) => void,
    onEscPress: () => void,
) {
    const callbackRef = useRef(onDirectionChange);
    const escCallbackRef = useRef(onEscPress);

    console.log(controlType);

    useEffect(() => {
        callbackRef.current = onDirectionChange;
        escCallbackRef.current = onEscPress;
    },[onDirectionChange, onEscPress]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                escCallbackRef.current();
                return;
            }

            let detectedDirection: Direction | undefined = undefined;

            if (controlType === 'arrow') {
                detectedDirection = arrowMapping[e.key];
            } else if (controlType === 'WASD') {
                detectedDirection = wasdMapping[e.code]; 
            } else if (controlType === 'arrow + WASD') {
                detectedDirection = arrowMapping[e.key] || wasdMapping[e.code];
            }        
            
            if (detectedDirection) {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
                
                callbackRef.current(detectedDirection);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
    
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [controlType]);
}
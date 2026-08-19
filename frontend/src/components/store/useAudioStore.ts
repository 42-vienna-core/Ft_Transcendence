import { useRef } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';


interface AudioState {
    isPlaying: boolean;
    isMuted: boolean;
    currentTrack: string | null;
  
    playMusic: (src: string, loop?: boolean) => void;
    pauseMusic: () => void;
    toggleMute: (isMute: boolean) => void;
    setVolume: (volume: number) => void;
    playEffect: (src: string) => void;
    stopBgMusic: () => void;
    stopEffectMusic: () => void;
}

let bgMusicPlayer: HTMLAudioElement | null = null;
let effectTune: HTMLAudioElement | null = null;

export const useAudioStore = create<AudioState>()(    
    devtools((set, get) => ({
        isPlaying: false,
        isMuted: false,
        currentTrack: null,

        playMusic: (src, loop = true) => {
            if (typeof Window === 'undefined') return;

            if (get().currentTrack === src && bgMusicPlayer && !bgMusicPlayer.paused) return;

            if (bgMusicPlayer) bgMusicPlayer.pause();

            bgMusicPlayer = new Audio(src);
            bgMusicPlayer.loop = loop;
            bgMusicPlayer.volume = 0.4;
            bgMusicPlayer.muted = !get().isMuted;

            bgMusicPlayer.play()
                .then(() => set({ isPlaying: true, currentTrack: src }))
                .catch(() => {});
        },

        pauseMusic: () => {
            if (bgMusicPlayer) {
                bgMusicPlayer.pause();
                set({ isPlaying: false });
            }
        },

        toggleMute: (isMute) => {
            set(() => {
                if (bgMusicPlayer) bgMusicPlayer.muted = isMute;
                return { isMuted: isMute };
            });
        },

        setVolume: (volume) => {
            if (bgMusicPlayer) bgMusicPlayer.volume = volume;
        },

        playEffect: (src) => {
            if (typeof window === 'undefined' || !src) return;

            if (!effectTune) {
                effectTune = new Audio(src);
            }
        
            effectTune.volume = 0.5;
            effectTune.muted = !get().isMuted;
            effectTune.play().catch(() => {});
        },

        stopBgMusic: () => {
            if (bgMusicPlayer) {
                bgMusicPlayer.pause(); 
                bgMusicPlayer.src = ""; 
                bgMusicPlayer = null;   
    
                set({ isPlaying: false, currentTrack: null });
            }
        },
        stopEffectMusic: () => {
            if (effectTune) {
                effectTune.pause(); 
                effectTune.src = ""; 
                effectTune = null;
            }
        }
    }),
    {
        name: "AudioState",
    }
));
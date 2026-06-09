'use client'

interface ProfileContextType {
    username: string;
    avatar: string;
    updateUsername: (newName: string) => void;
    updateAvatar: (newUrl: string) => void;
}
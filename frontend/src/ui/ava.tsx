'use client'

interface AvatarProps {
    name: string;
    avatar: string | null;
    size: number;
    bgColor?: string | false | null | undefined;
}

export function Avatar({ name, avatar, size = 0, bgColor }: AvatarProps) {
    const av = (name && !avatar) && typeof name === "string" ? name.slice(0, 2) : "";

    if (avatar) {
        return (
            <img className={`size-[${size}px] shrink-0 rounded-full object-cover`} src={avatar ? avatar : ""} alt="avatar" />
        )
    } else {
        return (
            <div className={`flex size-[${size}px] shrink-0 items-center justify-center rounded-full ${bgColor ? `bg-[${bgColor}]` : "bg-info-soft"} text-sm font-medium capitalize text-info-text`}>
                {av}
            </div>
        )
    }
}
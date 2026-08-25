'use client'

interface AvatarProps {
    name: string;
    avatar: string | null;
    style: string;
    bgColor?: string | false | null | undefined;
}

export function Avatar({ name, avatar, style, bgColor = ""}: AvatarProps) {
    const av = (name && !avatar) && typeof name === "string" ? name.slice(0, 2) : "";

    if (avatar) {
        return (
            <img className={`${style} shrink-0 rounded-full object-cover`} src={avatar ? avatar : ""} alt="avatar" />
        )
    } else {
        return (
            <div className={`flex ${style} bg-info-soft ${bgColor} shrink-0 items-center justify-center rounded-full  text-sm font-medium capitalize text-info-text`}>
                {av}
            </div>
        )
    }
}
'use client'

interface userProps{
  username: string;
  ava: string | null;
}

export default function Ava({username, ava}: userProps) {
  return (
    <>
      <span>{username}</span>
      <img 
        className="w-[26px] h-[26px] rounded-full bg-[#0095ff] text-[var(--color-info-text)] flex items-center justify-center text-[12px] font-medium" 
        src={ava ? ava : "/png/default_avatar.png"}/>
    </>
  )
}
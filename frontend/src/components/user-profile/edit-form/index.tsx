'use client'

import { useState } from 'react';
import style from './edit.module.css'
import { apiFetch } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import { useFormStatus } from 'react-dom';
import { useProfile } from '@/providers/ProfileContext';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB Limit

interface submitProps{
  loading: boolean;
  isActive: boolean;
}

function SubmitFormButton({loading, isActive }: submitProps) {
  const { pending } = useFormStatus();

  return (
    <button 
      className={`${style.pfBtn} ${style.primary} ${isActive ? 'block': 'hidden'}`} 
      disabled={pending}
        type="submit" 
      >
      { pending ? "updating..."  : "submit" }  
    </button>
  )
}

export default function EditForm () {
  const {data: session, update} = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isActive, setActive] = useState<boolean>(false);
  
  const {
    username, 
    avatar, 
    updateSessionUsername, 
    updateNameOnChange,
    updateAvatar
  } = useProfile();

  const handleEditSubmit = async (fd: FormData) => {
    setLoading(true);

    const file = fd.get("avatar") as File;

    if (file && file.size > 0) {
      console.log(file);
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError('Invalid format. Please upload a JPEG, PNG, or WebP image.');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size allowed is 2MB.');
        return;
      }
      console.log(error);

      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch('user/me/avatar', {
        method: 'PATCH',
        body: formData
      });
      
      if (res.success) {
        updateAvatar(res.avatar);
      }
    }

    if (session?.user && session?.user.username !== username) {
      const res = await apiFetch('user/me', {
        method: 'PATCH',
        body: JSON.stringify({username: username})
      })  

      if (res.success) {
        updateSessionUsername(username);
      }
    }

    setLoading(false);
    setActive(false);
  }

  return (
    <form action={handleEditSubmit}>
      <div className={style.pfTop}>
        <div className={style.pfAvatar}>
          <img src={avatar ? avatar : "#"} alt="avatar" />
          <label className={`${isActive ? 'block': 'hidden'} absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors flex items-center justify-center border-2 border-white`}>
            <svg
              xmlns="http://w3.org"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                path="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            
            <input 
              type="file" 
              name="avatar" 
              accept="image/jpeg, image/jpg, image/png, image/webp" 
              className="hidden" 
            />
          </label>
        </div>
        <div className={style.pfId}>
          <label htmlFor="username" className={`${isActive ? 'block': 'hidden'}`}>
            <input 
              id="username"
              type="text"
              name="username"
              value={username}
              autoComplete="off"
              onChange={(e) => updateNameOnChange(e.target.value)}
              className="w-full border-none focus:outline-none  text-gray-900 text-lg"
            />
          </label>
          <div className={`${style.name} ${isActive ? 'hidden': 'bock'}`}>{username}</div>
          <div className={style.handle}>joined Apr 2024</div>
          <div className={style.badges}>
            <span className={`${style.badge} ${style.lvl}`}>level 12</span>
          </div>
        </div>
        <div className={style.pfActions}>
          <button 
            type="button"
            className={`${style.pfBtn} ${style.primary} ${isActive ? 'hidden': 'block'}`} 
            onClick={()=> setActive(true)}
          >edit profile</button>
        <SubmitFormButton
          loading={loading}
          isActive={isActive}
        />
        </div>
      </div>
    </form>
  )
}

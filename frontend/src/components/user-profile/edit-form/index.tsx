'use client'

import { useState } from 'react';
import style from './edit.module.css'
import { apiFetch } from '@/lib/api-client';
import { useFormStatus } from 'react-dom';
import { useProfile } from '@/providers/ProfileContext';
import { UserProfileSkeleton } from '../../../ui/skeletons';

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

export default function EditProfileForm () {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isActive, setActive] = useState<boolean>(false);
  
  const {
    username, 
    avatar, 
    nameOnChange,
    status,
    updateSession,
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

    if (username != "" && username !== nameOnChange) {
        try {
          const res = await apiFetch('user/me', {
            method: 'PATCH',
            body: JSON.stringify({username: nameOnChange})
          })  

        if (res.success) {
          updateSessionUsername();
        }
      } catch (error) {
        console.log(" error iN PROFILE: ", error);
      }
      
    }

    setLoading(false);
    setActive(false);
  }

  return (
    <form action={handleEditSubmit}>
      <div className={style.pfTop}>
        {status !== 'loading' ? (
          <>
            <div className="relative flex items-center justify-center w-[64px] h-[64px] rounded-[var(--radius-full)] bg-[var(--color-bg-info)] text-[var(--color-text-info)] text-[22px] font-medium ">
              <img src={avatar ? avatar : "#"} alt="avatar" className="" />
              <label className={`${isActive ? 'block': 'hidden'} w-2 h-2 absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors flex items-center justify-center border-1`}>
                <p className="text-green-400" >+</p>
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
                  value={nameOnChange || ""}
                  autoComplete="off"
                  onChange={(e) => updateNameOnChange(e.target.value)}
                  className="w-full border-none focus:outline-none  text-[var(--color-text-primary)]] text-lg"
                />
              </label>
              <div className={`${style.name} ${isActive ? 'hidden': 'bock'}`}>{username}</div>
              <div className={style.handle}>joined Apr 2024</div>
              <div className={style.badges}>
                <span className={`${style.badge} ${style.lvl}`}>level 12</span>
              </div>
            </div>
          </>    
        ) : (
          <UserProfileSkeleton/>
        )}
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

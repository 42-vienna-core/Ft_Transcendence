'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/error';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';
import { useProfile } from '@/providers/ProfileContext';
import { UserProfileSkeleton } from '../../ui/skeletons';
import { useTranslations } from 'next-intl';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function SubmitFormButton({ isActive }: {isActive: boolean}) {
    const { pending } = useFormStatus();
    const t = useTranslations("Profile")

    return (
        <button
            className={`min-w-[150px] cursor-pointer rounded border border-transparent bg-bg-muted px-3 py-1.5 text-sm text-text-primary transition-colors duration-200 hover:bg-bg-subtle ${isActive ? 'block': 'hidden'}`}
            disabled={pending}
            type="submit"
        >
            { pending ? t("updating")  : t("sub")}
        </button>
    )
}

export default function EditProfileForm () {
    const [tempAvatar, setTempAvatar] = useState<string>("");
    const [isActive, setActive] = useState<boolean>(false);
    const t = useTranslations("Profile");
  
    const {
        username, 
        avatar, 
        nameOnChange,
        status,
        level,
        createdAt,
        hasUpdatedData,
        updateSessionUsername, 
        updateNameOnChange,
        updateAvatar
    } = useProfile();

    const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const temporaryBlobUrl = URL.createObjectURL(files[0]);
        setTempAvatar(temporaryBlobUrl);
    }

    const handleEditSubmit = async (fd: FormData) => {
        const file = fd.get("avatar") as File;

        if (file && file.size > 0) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                toast.error(t("formatInvalid"));
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error(t("longFile"));
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await apiFetch('user/me/avatar', {
                    method: 'PATCH',
                    body: formData
                });

                if (res.success) {
                    updateAvatar(res.avatar);
                }
            } catch (error) {
                toast.error(getErrorMessage(error, "Couldn't update your avatar."));
                setActive(false);
                return;
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
                toast.error(getErrorMessage(error, "Couldn't update your username."));
            }
        }

        setActive(false);
    }

    const showAvatar = isActive ? (tempAvatar ? tempAvatar : avatar ) : avatar;

    return (
        <form action={handleEditSubmit} className='mb-6'>
            <div className="flex min-h-24 flex-wrap items-center gap-4 border-b border-border-default pb-[18px]">
                {
                    hasUpdatedData.current && status === 'authenticated' &&
                        <>
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-info-soft text-[22px] font-medium text-info-text">
                                <img src={showAvatar ? showAvatar : "#"} alt="avatar" className="h-full w-full rounded-full object-cover" />
                                <label className={`${isActive ? 'flex': 'hidden'} absolute bottom-0 right-0 h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-border-default bg-accent text-text-inverse shadow-lg transition-colors duration-200 hover:bg-accent-hover`}>
                                    <span className="text-xs leading-none">+</span>
                                    <input
                                        autoComplete="off"
                                        type="file"
                                        name="avatar"
                                        onChange={handleAvatar}
                                        accept="image/jpeg, image/jpg, image/png, image/webp"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="min-w-0 flex-1">
                                <label htmlFor="username" className={`${isActive ? 'block': 'hidden'}`}>
                                    <input
                                        id="username"
                                        type="text"
                                        name="username"
                                        value={nameOnChange || ""}
                                        autoComplete="off"
                                        onChange={(e) => updateNameOnChange(e.target.value)}
                                        className="w-full border-none text-lg text-text-primary outline-none transition-colors duration-200 focus:text-accent"
                                    />
                                </label>
                                <div className={`truncate text-lg font-medium text-text-primary ${isActive ? 'hidden': 'block'}`}>
                                    {username}
                                </div>
                                <div className="mt-0.5 text-sm text-text-secondary">
                                    {t("joined")} {createdAt}
                                </div>
                                <div className="mt-2 flex gap-1.5">
                                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] text-success-text">
                                        {t("level")} {level}
                                    </span>
                                </div>
                            </div>
                        </>
                }


                {!hasUpdatedData.current && <UserProfileSkeleton/>}
                <div className="ml-auto flex shrink-0 gap-2">
                    <button
                        type="button"
                        className={`w-[150px] break-words cursor-pointer rounded border border-border-default bg-bg-muted px-3 py-1.5 text-sm text-text-primary transition-colors duration-200 hover:bg-bg-subtle ${isActive ? 'hidden': 'block'}`}
                        onClick={()=> setActive(true)}
                    >
                        {t("epBtn")}
                    </button>
                    <SubmitFormButton
                        isActive={isActive}
                    />
                </div>
            </div>
        </form>
    )
}

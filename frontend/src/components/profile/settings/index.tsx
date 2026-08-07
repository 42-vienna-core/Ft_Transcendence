'use client'

import style from "@/app/[locale]/(home)/(dashboard)/profile/profile.module.css"
import DialogModal from "@/components/modal/dialog-modal";
import ChangePasswordModal from "@/components/modal/secure-modal";
import { SettingBatton } from "@/ui/setting-btn";
import { RefObject, useEffect, useId, useState } from "react";
import { fetchLogout } from "@/lib/auth-actions";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api-client";
import { PaintBucket, Trash2 } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface ArrValue { 
    id: string;
    value: string;
}

const langArr: ArrValue[] = [{
    id: "English",
    value: 'en', 
},
{
    id: "Русский",
    value: 'ru', 
},
{
    id: "Deutschland",
    value: 'de', 
},
{
    id: "Italian",
    value: 'it', 
}];

const controlArr: ArrValue[] = [{
    id: "1",
    value: "arrow"
},
{
    id: "2",
    value: "WASD"
},
{
    id: "3",
    value: "arrow + WASD"
}];

const snakeColors: ArrValue[]  = [
  { id: 'neon-green',  value: '#39FF14'},
  { id: 'electric-blue', value: '#00E5FF'},
  { id: 'laser-pink',   value: '#FF007F'},
  { id: 'toxic-yellow', value: '#FFEA00'},
  { id: 'plasma-purple', value: '#9D00FF'},
  { id: 'lava-orange',  value: '#FF5E00',},
  { id: 'pearl-white',  value: '#FFFFFF',}
];

function SettingBtnContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative border-b border-[var(--color-border-default)]">
            {children}
        </div>
    );
}

function ToggleSwitch({ title, label, checked, onToggle }: {title: string; label: string; checked: boolean; onToggle: (checked: boolean) => void }) {
    const switchId = useId();

    return (
        <div className="flex w-full items-center justify-between px-[10px] py-[10px] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-muted)]">
            <span className="text-[13px] text-[var(--color-text-primary)]">
                {title}
            </span>
            
            <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer select-none gap-2 text-sm text-[var(--color-text-primary)]">
                <input 
                    id={switchId} 
                    type="checkbox"
                    onChange={() => onToggle(!checked)}
                    checked={checked}
                    className="sr-only"
                />

                <span>{label}</span>

                <div className={`w-[32px] h-[18px] rounded-full transition-colors duration-300 relative ${
                    checked ? 'bg-[#8bbaf8]' : 'bg-slate-600'}`}>
                    <div className={`absolute top-[1px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        checked ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
            </label>
        </div>
    );
}



function SharedButtonItem({
    value,
    handleOnClick,
    children 
}: { 
    value: string;
    handleOnClick: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <li>
            <button
                onClick={() => handleOnClick(value)}
                className="flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-muted)]"
            >
                {children}
            </button>
        </li>
    );
}

export function ModalList({
    isOpen,
    listArr, 
    modalRef,
    handleOnClick
}: {
    isOpen: boolean;
    listArr: ArrValue[];
    handleOnClick: (value: string) => void;
    modalRef: RefObject<HTMLDivElement | null>;
}) {

    if (!isOpen) return null; 

    return (
        <div ref={modalRef} className="absolute right-0 mt-0 w-40 rounded-md bg-[var(--color-bg-base)] z-10">
            <ul className="py-1 text-[var(--color-text-primary)]">
                {listArr.map(({ id, value }) => {

                    const isColor = value.startsWith('#');
                    const isDigit = /^\d+$/.test(id);

                    return (
                        <SharedButtonItem
                            key={id}
                            value={value}
                            handleOnClick={handleOnClick}
                        >
                            <div className="flex justify-between items-center gap-2 w-full">
                                {!isDigit && 
                                    <span className={`text-[var(--color-text-primary)]`}>
                                        {id}
                                    </span>
                                }

                                {value && !isColor && (
                                    <span className={`${!isColor && !isDigit ? "uppercase" : ""} text-[var(--color-text-primary)]`}>{value}</span>
                                )}

                                {value && isColor && (
                                    <span 
                                        className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                                        style={{ backgroundColor: value }} 
                                    />
                                )}
                            </div>
                        </SharedButtonItem>
                    );
                })}
            </ul>
        </div>
    );
}


export default function ProfileSettingsContent() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [pending, setPending] = useState<boolean>(false);
    const {theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [lang, setLang] = useState("");
    const [control, setControl] = useState("");
    const [snakeColor, setSnakeColor] = useState("");
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [isThemeDark, setIsThemeDark] = useState(false);


    const router = useRouter();
    const pathName = usePathname();
    const t = useTranslations("Profile.settings");

    const [isOpen, setIsOpen] = useState(false);
    const [isOpenControl, setIsOpenControl] = useState(false);
    const [isOpenSnakeColor, setIsOpenSnakeColor] = useState(false);

        useEffect(() => {
        setMounted(true);
        if (theme === 'dark') {
            setIsThemeDark(true);
        } else {
            setIsThemeDark(false);
        }
        
        if (pathName.includes("en")) setLang("en");
        if (pathName.includes("ru")) setLang("ru");
        if (pathName.includes("de")) setLang("de");
        if (pathName.includes("it")) setLang("it");

        const controslLS = localStorage.getItem('controls');
        if (controslLS) {
            setControl(controslLS);
        } else {
            setControl("arrow");
        }

        const snakeColorLS = localStorage.getItem('snakeColor');
        if (snakeColorLS) {
            setSnakeColor(snakeColorLS);
        } else {
            setSnakeColor('#39FF14');
        }

        const soundLS = localStorage.getItem('soundtrack');
        if (soundLS) {
            const data = JSON.parse(soundLS);
            setSoundEnabled(data);
        }
    }, []);

    const toggleLangMenu = () => setIsOpen(!isOpen);
    const toggleControlMenu = () => setIsOpenControl(!isOpenControl);
    const togleSnakeColorMenu = () => setIsOpenSnakeColor(!isOpenSnakeColor);
    
    const modalLangRef = useOutsideClick(isOpen,() => setIsOpen(false));
    const modalControlRef = useOutsideClick(isOpenControl,() => setIsOpenControl(false));
    const modalSnakeColorRef = useOutsideClick(isOpenSnakeColor,() => setIsOpenSnakeColor(false));


    const selectSnakeColor = (color: string) => {
        setSnakeColor(color);
        togleSnakeColorMenu(); 
        localStorage.setItem('snakeColor', color);
    };

    const selectControl = (key: string) => {
        setControl(key);
        toggleControlMenu(); 
        localStorage.setItem('controls', key);
    };

    const selectLanguage = (newLang: string) => {
        setLang(newLang);
        setIsOpen(false); 
        const nl = pathName.slice(4, (pathName.length));
        router.push(`/${newLang}/${nl}`);
    };

    const togleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
        setIsThemeDark(!isThemeDark);
    };

    const toggleSoundSwitch = (checked: boolean) => {
        setSoundEnabled(checked);
        const payload = JSON.stringify(checked);
        localStorage.setItem('soundtrack', payload);
    };

    const handleAccountRemoving = async (confirm: boolean) => {
        setIsConfirmModalOpen(false);

        if (!confirm) return;

        setPending(true);

        try {
            const res = await apiFetch('user/me', {
                method: "DELETE"
            });

            if (!res.success) return

            await signOut({
                callbackUrl: "/login",
                redirect: true,
            });

            localStorage.removeItem('controls');
            localStorage.removeItem('snakeColor');
            localStorage.removeItem('soundtrack');
            localStorage.clear(); 
        } catch (error) {
            setPending(false);
            console.log("The server has rejected the deleting account request : ");
        }
    };

    const handleLogout = async () => {
        setPending(true);

        const res = await fetchLogout();

        if (res?.success) {
            try {
                await signOut({
                    callbackUrl: "/login",
                    redirect: true,
                });
            } catch (error) {
                setPending(false);
                console.log("An error occurred while logOut: ", error);
            }
        } else {
            setPending(false);
            console.log("The server has rejected the logout request : ");
        }
    };

    return (
        <>
            <div className={style.pfGrid}>
                <div className={style.panel} aria-label="Settings">
                <h3>preferences</h3>

                {/* Languages */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={t("lang")}
                        labelS={lang}
                        onClick={toggleLangMenu}
                    >
                    </SettingBatton>
                    <ModalList 
                        isOpen={isOpen}
                        listArr={langArr} 
                        modalRef={modalLangRef}
                        handleOnClick={selectLanguage}
                    />
                </SettingBtnContainer>

                {/* Theme */}
                <SettingBtnContainer>
                    <ToggleSwitch
                        title={t("ct")}
                        label={isThemeDark ? "☀️" : "🌙"}
                        onToggle={togleTheme}
                        checked={isThemeDark}
                    />
                </SettingBtnContainer>

                {/* Snake colors */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={"snake color"}
                        onClick={togleSnakeColorMenu}
                    >
                        <PaintBucket size={18} color={`${snakeColor}`}/>
                    </SettingBatton>
                    <ModalList 
                        isOpen={isOpenSnakeColor}
                        listArr={snakeColors} 
                        modalRef={modalSnakeColorRef}
                        handleOnClick={selectSnakeColor}
                    />
                </SettingBtnContainer>

                {/* Sounds */}
                <SettingBtnContainer>
                    <ToggleSwitch
                        title={"sound & music"}
                        label={soundEnabled ? "on" : "off"}
                        onToggle={toggleSoundSwitch}
                        checked={soundEnabled}
                    />
                </SettingBtnContainer>

                {/* Control */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={"controls"}
                        labelS={control}
                        onClick={() => toggleControlMenu()}
                    />
                    <ModalList 
                        isOpen={isOpenControl}
                        listArr={controlArr} 
                        modalRef={modalControlRef}
                        handleOnClick={selectControl}
                    />
                </SettingBtnContainer>

                {/* Notifications */}
                <div className={style.row}>
                    <div className={style.lbl}>
                        <i
                            className={`${style.ti} ${style.tiBell}`}
                            aria-hidden="true"
                        ></i>{" "}
                        notifications
                    </div>
                    <div className={style.val}>
                        friend requests, match results{" "}
                        <i
                            className={`${style.ti} ${style.tiChevronRight}`}
                            aria-hidden="true"
                        ></i>
                    </div>
                </div>


                <SettingBtnContainer>
                    <SettingBatton
                        labelF={t("secure.label1")}
                        labelS={t("secure.label2")}
                        onClick={() => setIsModalOpen(true)}
                    />
                </SettingBtnContainer>


                {/* Logout */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={t("lo")}
                        onClick={handleLogout}
                        disabled={pending}
                    />
                </SettingBtnContainer>

                {/* Logout of all accounts */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={"log out of all accounts"}
                    />
                </SettingBtnContainer>

                {/* Delete accounts */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={t("da")}
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={pending}
                    />
                </SettingBtnContainer>
            </div>

            <div className="flex flex-col ">
                <div className={style.panel} aria-label="Friends">
                    <p className="mb-13 text-[13px] text-text-secondary"> 
                        Cobras are famous venomous snakes known for their dramatic neck hoods. The king cobra is the longest venomous snake on Earth, growing up to 18 feet, and a single bite can kill an elephant or 20 people. Some cobras can even spit venom at a target's eyes.
                    </p>
                    <img className="object-contain" 
                        alt="Magnific Snake" 
                        style={{
                            filter: `drop-shadow(0px 0px 12px ${snakeColor})`
                        }} src="/png/magnific_snake.png"
                    />
                </div>
            </div>
            </div>

            {/* Modal Windows */}
            <ChangePasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <DialogModal
                isOpen={isConfirmModalOpen}
                type={'DELETE_ACCOUNT'}
                title="Delete your account?"
                warning="This permanently erases your profile, 1 482 rating, match history, and 42 friends. This can't be undone."
                secondBtn="Delete account"
                handleConfirmation={handleAccountRemoving}
            >
                <Trash2 className="w-4 h-4" />
            </DialogModal>
        </>
    )
}
'use client'

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
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";
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


function SettingBtnContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative border-b border-border-default">
            {children}
        </div>
    );
}

function ToggleSwitch({ title, label, checked, onToggle }: {title: string; label: string; checked: boolean; onToggle: (checked: boolean) => void }) {
    const switchId = useId();

    return (
        <div className="flex w-full items-center justify-between px-2.5 py-2.5 bg-bg-surface transition-colors duration-150 hover:bg-bg-muted">
            <span className="text-sm text-text-primary">
                {title}
            </span>

            <label htmlFor={switchId} className="relative inline-flex items-center cursor-pointer select-none gap-2 text-sm text-text-primary">
                <input
                    id={switchId}
                    type="checkbox"
                    onChange={() => onToggle(!checked)}
                    checked={checked}
                    className="sr-only"
                />

                <span>{label}</span>

                <div className={`relative h-[18px] w-8 rounded-full transition-colors duration-300 ${
                    checked ? 'bg-accent' : 'bg-bg-overlay'}`}>
                    <div className={`absolute top-[1px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
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
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-text-primary transition-colors duration-150 hover:bg-bg-muted hover:text-accent-hover"
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
        <div ref={modalRef} className="absolute right-0 z-10 mt-0 w-40 rounded-md bg-bg-base border border-border-default shadow-md">
            <ul className="py-1 text-text-primary">
                {listArr.map(({ id, value }) => {

                    const isColor = value.startsWith('#');
                    const isDigit = /^\d+$/.test(id);

                    return (
                        <SharedButtonItem
                            key={id}
                            value={value}
                            handleOnClick={handleOnClick}
                        >
                            <div className="flex w-full items-center justify-between gap-2">
                                {!isDigit &&
                                    <span className="text-text-primary">
                                        {id}
                                    </span>
                                }

                                {value && !isColor && (
                                    <span className={`${!isColor && !isDigit ? "uppercase" : ""} text-text-primary`}>{value}</span>
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
    const [lang, setLang] = useState("");
    const [control, setControl] = useState("");
    const [snakeColor, setSnakeColor] = useState("");
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [isThemeDark, setIsThemeDark] = useState(false);


    const router = useRouter();
    const pathName = usePathname();
    const LN = useTranslations("Profile.settings");
    const CO = useTranslations("Profile.settings.color")

    const controlArr: ArrValue[] = [
    {
        id: "1",
        value: LN("arrow")
    },
    {
        id: "2",
        value: LN("WASD")
    },
    {
        id: "3",
        value:  LN("arrow + WASD")
    }];


    const [isOpen, setIsOpen] = useState(false);
    const [isOpenControl, setIsOpenControl] = useState(false);
    const [isOpenSnakeColor, setIsOpenSnakeColor] = useState(false);

    useEffect(() => {
        if (!theme || theme === 'system') {
            setTheme("dark");
            setIsThemeDark(true);
        }

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


    const selectSnakeColor = async (color: string) => {
        setSnakeColor(color);
        togleSnakeColorMenu();
        localStorage.setItem('snakeColor', color);

        try {
            await apiFetch('user/me/color', {
                method: 'PATCH',
                body: JSON.stringify({color: color}),
            })
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't save your snake color."));
        }
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

            if (!res.success) {
                setPending(false);
                toast.error("The server rejected the account deletion request.");
                return;
            }

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
            toast.error(getErrorMessage(error, "Couldn't delete your account."));
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
                toast.error(getErrorMessage(error, "Couldn't log you out."));
            }
        } else {
            setPending(false);
            toast.error("The server rejected the logout request.");
        }
    };

    
    const snakeColors: ArrValue[]  = [
        { id: CO("neon-green"),  value: '#39FF14'},
        { id: CO("electric-blue"), value: '#00E5FF'},
        { id: CO("laser-pink"),   value: '#FF007F'},
        { id: CO("toxic-yellow"), value: '#FFEA00'},
        { id: CO("plasma-purple"), value: '#9D00FF'},
        { id: CO("lava-orange"),  value: '#FF5E00',},
        { id: CO("pearl-white"),  value: '#FFFFFF',}
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-md border border-border-default bg-bg-surface px-4 py-3.5" aria-label="Settings">
                <h3 className="mb-3 !text-sm font-medium lowercase tracking-wide text-text-secondary">{LN("settings")}</h3>

                {/* Languages */}
                <SettingBtnContainer>
                    <SettingBatton labelF={LN("lang")} labelS={lang} onClick={toggleLangMenu} >
                    </SettingBatton>
                    <ModalList  isOpen={isOpen} listArr={langArr}  modalRef={modalLangRef} handleOnClick={selectLanguage} />
                </SettingBtnContainer>

                {/* Theme */}
                <SettingBtnContainer>
                    <ToggleSwitch
                        title={LN("ct")}
                        label={isThemeDark ? "☀️" : "🌙"}
                        onToggle={togleTheme}
                        checked={isThemeDark}
                    />
                </SettingBtnContainer>

                {/* Snake colors */}
                <SettingBtnContainer>
                    <SettingBatton labelF={LN("snakeColor")} onClick={togleSnakeColorMenu} >
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
                        title={LN("sound")}
                        label={soundEnabled ? LN('on') : LN('off')}
                        onToggle={toggleSoundSwitch}
                        checked={soundEnabled}
                    />
                </SettingBtnContainer>

                {/* Control */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={LN('controls')}
                        labelS={LN("changeControl")}
                        onClick={() => toggleControlMenu()}
                    />
                    
                    <ModalList 
                        isOpen={isOpenControl}
                        listArr={controlArr} 
                        modalRef={modalControlRef}
                        handleOnClick={selectControl}
                    />
                </SettingBtnContainer>

                <SettingBtnContainer>
                    <SettingBatton
                        labelF={LN("secure.label1")}
                        labelS={LN("secure.label2")}
                        onClick={() => setIsModalOpen(true)}
                    />
                </SettingBtnContainer>

                {/* Logout */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={LN("lo")}
                        onClick={handleLogout}
                        disabled={pending}
                    />
                </SettingBtnContainer>

                {/* Logout of all accounts */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={LN('secure.label3')}
                    />
                </SettingBtnContainer>

                {/* Delete accounts */}
                <SettingBtnContainer>
                    <SettingBatton
                        labelF={LN("da")}
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={pending}
                    />
                </SettingBtnContainer>
            </div>

            <div className="flex flex-col ">
                <div className="rounded-md border border-border-default bg-bg-surface px-4 py-3.5" aria-label="Friends">
                    <p className="mb-13 text-sm text-text-secondary">
                        {LN('text')}
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
                type={"DELETE_ACCOUNT"}
                title={LN("delet.title")}
                warning={LN("delet.warning")}
                secondBtn={LN("delet.secondBtn")}
                
                handleConfirmation={handleAccountRemoving}
            >
                <Trash2 className="w-4 h-4" />
            </DialogModal>
        </>
    )
}
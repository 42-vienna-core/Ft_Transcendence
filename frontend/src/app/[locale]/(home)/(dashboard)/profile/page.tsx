"use client";

import EditProfileForm from "@/components/user-profile/edit-form";
import style from "./profile.module.css";
import { SettingBatton } from "@/ui/setting-btn";
import { forwardRef, useEffect, useState } from "react";
import ChangePasswordModal from "@/components/modal/secure-modal";
import { fetchLogout } from "@/lib/actions/auth-actions";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";

function SettingBtnContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative border-b border-[var(--color-border-default)]">
      {children}
    </div>
  );
}

export default function Profile() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState("");
  const router = useRouter();
  const pathName = usePathname();


  const toggleMenu = () => setIsOpen(!isOpen);

  const selectLanguage = (newLang: string) => {
    setLang(newLang);
    setIsOpen(false); 
    const nl = pathName.slice(4, (pathName.length));
    router.push(`/${newLang}/${nl}`);
  };

  useEffect(() => {
    setMounted(true);
    if (pathName.includes("en")) setLang("en");
    if (pathName.includes("ru")) setLang("ru");
  }, []);

  const togleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
    <div className={style.pfBody}>
      <EditProfileForm />
      <div className={style.pfStats}>
        <div className={style.statCard}>
          <div className={style.l}>rating</div>
          <div className={style.v}>1 482</div>
          <div className={style.d}>+14 today</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>global rank</div>
          <div className={style.v}>#3 920</div>
          <div className={style.d}>top 8 %</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>best score</div>
          <div className={style.v}>1 207</div>
          <div className={style.dMuted}>last week</div>
        </div>
        <div className={style.statCard}>
          <div className={style.l}>matches</div>
          <div className={style.v}>182</div>
          <div className={style.dMuted}>win rate 41 %</div>
        </div>
      </div>

      <div className={style.tabStrip}>
        <span className={style.on}>settings</span>
        <span>match history</span>
        <span>achievements</span>
        <span>billing</span>
      </div>

      <div className={style.pfGrid}>
        <div className={style.panel} aria-label="Settings">
          <h3>preferences</h3>
            <SettingBtnContainer>
              <SettingBatton
                labelF="language"
                labelS={lang}
                onClick={() => toggleMenu()}
              >
              </SettingBatton>
            <>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-md bg-[var(--color-bg-base)]  z-10">
                  <div className="py-1">
                    <button
                      onClick={() => selectLanguage('en')}
                      className="flex aline-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-muted)]"
                    >
                      <span className="text-[var(--color-text-primary)]">English</span>
                      <span className="text-[var(--color-text-primary)]">US</span>
                    </button>
                    <button
                      onClick={() => selectLanguage('ru')}
                      className="flex aline-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-bg-muted)]"
                    >
                      <span className="text-[var(--color-text-primary)]">Русский</span>
                      <span className="text-[var(--color-text-primary)]">RU</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          </SettingBtnContainer>
          <SettingBtnContainer>
            <SettingBatton
              labelF="color theme"
              labelS={(theme === "dark" && mounted) ? "☀️" : "🌙"}
              onClick={() => togleTheme()}
            ></SettingBatton>
          </SettingBtnContainer>
          <div className={style.row}>
            <div className={style.lbl}>
              <i
                className={`${style.ti} ${style.tiVolume}`}
                aria-hidden="true"
              ></i>{" "}
              sound &amp; music
            </div>
            <div className={style.val}>
              on <span className={style.toggle}></span>
            </div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}>
              <i
                className={`${style.ti} ${style.tiDeviceGamepad2}`}
                aria-hidden="true"
              ></i>{" "}
              controls
            </div>
            <div className={style.val}>
              arrows + WASD{" "}
              <i
                className={`${style.ti} ${style.tiChevronRight}`}
                aria-hidden="true"
              ></i>
            </div>
          </div>
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
          <div className={style.row}>
            <div className={style.lbl}>
              <i
                className={`${style.ti} ${style.tiEyeOff}`}
                aria-hidden="true"
              ></i>{" "}
              privacy
            </div>
            <div className={style.val}>
              friends-only stats{" "}
              <i
                className={`${style.ti} ${style.tiChevronRight}`}
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className={style.row}>
            <div className={style.lbl}>
              <i
                className={`${style.ti} ${style.tiAccessible}`}
                aria-hidden="true"
              ></i>{" "}
              accessibility
            </div>
            <div className={style.val}>
              color-blind mode{" "}
              <span className={`${style.toggle} ${style.off}`}></span>
            </div>
          </div>
          <SettingBtnContainer>
            <SettingBatton
              labelF="security"
              labelS="change password, 2FA"
              onClick={() => setIsModalOpen(true)}
            />
          </SettingBtnContainer>
          <div className={style.row}>
            <div className={`${style.lbl} ${style.lblDanger}`}>
              <i
                className={`${style.ti} ${style.tiTrash}`}
                aria-hidden="true"
              ></i>{" "}
              delete account
            </div>
            <div className={style.val}>
              <i
                className={`${style.ti} ${style.tiChevronRight}`}
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <SettingBtnContainer>
            <SettingBatton
              labelF="logout"
              onClick={handleLogout}
              disabled={pending}
            />
          </SettingBtnContainer>
        </div>

        <div className="flex flex-col gap-4">
          <div className={style.panel} aria-label="Friends">
            <h3 className="flex justify-between m-1">
              <span>friends</span>
              <span>
                42 · <span className="text-blue-500">+ add</span>
              </span>
            </h3>
            <div className={style.friendRow}>
              <div className={style.av}>MR</div>
              <div className={style.nm}>
                <div className={style.n}>Mira</div>
                <div className={style.s}>
                  <span className={style.dot}></span> in match · room 47
                </div>
              </div>
              <div className={style.rk}>1 920</div>
            </div>
            <div className={style.friendRow}>
              <div
                className={style.av}
                style={{ background: "var(--color-warning-soft)", color: "var(--color-warning)" }}
              >
                KO
              </div>
              <div className={style.nm}>
                <div className={style.n}>Kostia</div>
                <div className={style.s}>
                  <span className={style.dot}></span> online
                </div>
              </div>
              <div className={style.rk}>1 760</div>
            </div>
            <div className={style.friendRow}>
              <div
                className={style.av}
                style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}
              >
                LI
              </div>
              <div className={style.nm}>
                <div className={style.n}>Lila</div>
                <div className={style.s}>
                  <span className={`${style.dot} ${style.off}`}></span> 2 h ago
                </div>
              </div>
              <div className={style.rk}>1 480</div>
            </div>
            <div className={style.friendRow}>
              <div
                className={style.av}
                style={{ background: "#EEEDFE", color: "#3C3489" }}
              >
                JO
              </div>
              <div className={style.nm}>
                <div className={style.n}>Jonas</div>
                <div className={style.s}>
                  <span className={`${style.dot} ${style.off}`}></span>{" "}
                  yesterday
                </div>
              </div>
              <div className={style.rk}>1 210</div>
            </div>
          </div>

          <div className={style.panel} aria-label="Recent achievements">
            <h3>recent achievements</h3>
            <div className={style.row}>
              <div className={style.lbl}>
                <i
                  className={`${style.ti} ${style.iconWarning}`}
                  aria-hidden="true"
                ></i>{" "}
                first to 1 000
              </div>
              <div className={style.val}>2 days ago</div>
            </div>
            <div className={style.row}>
              <div className={style.lbl}>
                <i
                  className={`${style.ti} ${style.iconInfo}`}
                  aria-hidden="true"
                ></i>{" "}
                10-match win streak
              </div>
              <div className={style.val}>last week</div>
            </div>
            <div className={style.row}>
              <div className={style.lbl}>
                <i
                  className={`${style.ti} ${style.iconSuccess}`}
                  aria-hidden="true"
                ></i>{" "}
                invited 5 friends
              </div>
              <div className={style.val}>apr 12</div>
            </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

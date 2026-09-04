"use client"

import { useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { useProfile } from '@/providers/ProfileContext';
import { useTranslations } from 'next-intl';
import { Save, Trash2, AlertTriangle } from "lucide-react";

export type Role = "ADMIN" | "PLAYER" | "BOT";

const ROLES: Role[] = ["PLAYER", "ADMIN", "BOT"];

interface AdminUser {
	id: number;
	name: string;
	email: string;
	role: Role;
}

interface bodyType {
  name:   string;
  email:  string;
  role:   Role;
  password: string;
}

export default function AdminUserForm({ user, onCancel }: { user: AdminUser; onCancel: () => void }) {

  const adminFormData = useTranslations("Admin.form");
  const { id } = useProfile();

  const [userData, setUserData] = useState<bodyType> ({name: user.name, role: user.role, email: user.email, password: ""});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saving = useAdminStore((s) => s.saving);
  const saveError = useAdminStore((s) => s.saveError);
  const deleting = useAdminStore((s) => s.deleting);
  const deleteError = useAdminStore((s) => s.deleteError);

  const deleteUser = useAdminStore((s) => s.deleteUser);
  const saveUser = useAdminStore((s) => s.saveUser);

  const handleSave = async () => {
    const {password, ...body}  = userData
    let ok;
    if (userData.password.length)
        ok = await saveUser(user.id, userData);
    else
      ok = await saveUser(user.id, body);

    if (ok) setUserData({...userData, password: ""});
  };

  const inputClass = "w-full rounded-lg border border-(--color-border-default) bg-(--color-bg-subtle) px-3 py-2 text-sm text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-tertiary) focus:border-(--color-accent) focus:shadow-[0_0_0_3px_var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50";
  const fieldLabelClass = "flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-(--color-text-secondary) uppercase";

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2 items-center ">
        
        <div className="flex flex-col gap-1.5 ">
          <label className={fieldLabelClass}>{adminFormData("username")}</label>
          <input id="admin_username" className={inputClass} autoComplete="off"
            value={userData.name} onChange={(e) => setUserData({...userData, name : e.currentTarget.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelClass}>{adminFormData("email")}</label>
          <input id="admin_email" className={inputClass} type="email" value={userData.email} autoComplete="off"
            onChange={(e) => setUserData({...userData, email : e.currentTarget.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelClass}>{adminFormData("password")}</label>
          <input id="admin_password" className={inputClass} type="password" value={userData.password} autoComplete="off"
            onChange={(e) => setUserData({...userData, password: e.currentTarget.value.trim()})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldLabelClass}>{adminFormData("role")}</label>
          <select className={inputClass}
            value={userData.role} disabled={id === user.id}
            title={id === user.id ? adminFormData("cannotChangeOwnRole") : undefined}
            onChange={(e) => setUserData({...userData, role: e.currentTarget.value as Role})}
          >
            {ROLES.map((r) => ( <option key={r} value={r}>{r}</option> ))}
          </select>
          {id === user.id && <span className="text-[11px] text-(--color-text-tertiary)">{adminFormData("cannotChangeOwnRole")}</span>}
        </div>
      </div>
      <span className="text-sm text-(--color-text-tertiary) mt-2">{adminFormData("newPassword")}</span>


      {saveError &&
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-(--color-danger)">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{adminFormData(`errors.${saveError}`)}</span>
        </div>
      }

      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-(--color-border-default) pt-5">
        <button
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-(--color-accent) px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-(--color-accent)/30 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSave} disabled={saving}
        >
          <Save size={14} />
          {saving ? adminFormData("saving") : adminFormData("save")}
        </button>
        <button
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border-default) bg-(--color-bg-subtle) px-4 py-2 text-xs font-semibold text-(--color-text-secondary) transition-all hover:-translate-y-0.5 hover:border-(--color-border-strong) hover:text-(--color-text-primary) disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCancel} disabled={saving}
        >
          {adminFormData("cancel")}
        </button>

        {!showDeleteConfirm && (
          <button
            className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-danger) bg-transparent px-4 py-2 text-xs font-semibold text-(--color-danger) transition-all hover:-translate-y-0.5 hover:bg-(--color-danger) hover:text-white"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={14} />
            {adminFormData("delete")}
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mt-3 flex w-full flex-col gap-3 rounded-xl border border-(--color-danger)/30 bg-(--color-danger)/5 p-4">
          <p className="flex items-start gap-2 text-sm text-(--color-text-primary)">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-(--color-danger)" />
            {adminFormData("deleteConfirmText")}
          </p>
          <div className="flex justify-center gap-2">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-danger) bg-transparent px-4 py-2 text-xs font-semibold text-(--color-danger) transition-all hover:-translate-y-0.5 hover:bg-(--color-danger) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={async () => await deleteUser(user.id)} disabled={deleting}
            >
              {deleting ? adminFormData("deleting") : adminFormData("yesDelete")}
            </button>
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-(--color-border-default) bg-(--color-bg-subtle) px-4 py-2 text-xs font-semibold text-(--color-text-secondary) transition-all hover:-translate-y-0.5 hover:border-(--color-border-strong) hover:text-(--color-text-primary) disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
            >
              {adminFormData("no")}
            </button>
          </div>
        </div>
      )}

      {deleteError &&
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-(--color-danger)">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{adminFormData(`errors.${deleteError}`)}</span>
        </div>
      }
    </div>
  );
}

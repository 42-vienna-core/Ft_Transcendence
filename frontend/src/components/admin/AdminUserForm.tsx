"use client"

import { useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { useProfile } from '@/providers/ProfileContext';


export type Role = "ADMIN" | "PLAYER";
const ROLES: Role[] = ["PLAYER", "ADMIN"];

interface AdminUser {
	id: number;
	name: string;
	email: string;
	role: Role;
}

export default function AdminUserForm({ user, onCancel }: { user: AdminUser; onCancel: () => void }) {

  const adminFormData = {
       
    "username": "Username",
    "email": "Email",
    "newPassword": "New password (leave blank to keep unchanged)",
    "role": "Role",
    "cannotChangeOwnRole": "You cannot change your own role",
    "save": "Save",
    "saving": "Saving...",
    "cancel": "Cancel",
    "delete": "Delete",
    "deleteConfirmText": "Delete this user permanently? This cannot be undone.",
    "yesDelete": "Yes, delete",
    "deleting": "Deleting...",
    "no": "No",
    "errors": {
        "forbidden": "Forbidden",
        "saveFailed": "Failed to save changes",
        "deleteFailed": "Failed to delete user"
    }
                
  }
    const { role, id } = useProfile();

  const isSelf = id === user.id;
  

  const [username, setUsername] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [userRole, setRole] = useState<Role>(user.role);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saving = useAdminStore((s) => s.saving);
  const saveError = useAdminStore((s) => s.saveError);
  const saveUser = useAdminStore((s) => s.saveUser);

  const deleting = useAdminStore((s) => s.deleting);
  const deleteError = useAdminStore((s) => s.deleteError);
  const deleteUser = useAdminStore((s) => s.deleteUser);

  const handleSave = async () => {
    const body: { name: string; email: string; password?: string; role?: Role } = {
      name: username,
      email: email,
      role: userRole,
    };
    if (password) body.password = password;

    const ok = await saveUser(user.id, body);
    if (ok) setPassword("");
  };

  const handleDelete = async () => {
    await deleteUser(user.id);
  };

  return (
    <div className="flex flex-col border-t border-(--color-border-default)">
      
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) items-start">
        <div className="flex items-center gap-3 text-sm font-medium w-full flex-1 justify-between sm:w-auto">{adminFormData.username}</div>
        <div className="flex items-center gap-2">
          <input
            className="rounded-md border px-3 py-1.5 text-sm outline-none transition-colors "
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) items-start">
        <div className="flex items-center gap-3 text-sm font-medium w-full flex-1 justify-between sm:w-auto">{adminFormData.email}</div>
        <div className="flex items-center gap-2">
          <input className="rounded-md border px-3 py-1.5 text-sm outline-none transition-colors" type="email" value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) items-start">
        <div className="flex items-center gap-3 text-sm font-medium w-full flex-1 justify-between sm:w-auto">{adminFormData.newPassword}</div>
        <div className="flex items-center gap-2">
          <input className="rounded-md border px-3 py-1.5 text-sm outline-none transition-colors" type="password" value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) items-start">
        <div className="flex items-center gap-3 text-sm font-medium">{adminFormData.role}</div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border px-3 py-1.5 text-sm outline-none transition-colors"
            value={userRole}
            disabled={isSelf}
            title={isSelf ? adminFormData.cannotChangeOwnRole : undefined}
            onChange={(e) => setRole(e.currentTarget.value as Role)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {saveError &&
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-2 transition-colors">
          <span className="text-[0.8rem] text-(--color-danger)">{adminFormData.errors[saveError]}</span>
        </div>
      }

      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default)">
        <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform bg-(--color-accent) text-white" onClick={handleSave} disabled={saving}>
          {saving ? adminFormData.saving : adminFormData.save}
        </button>
        <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform" onClick={onCancel} disabled={saving}>
          {adminFormData.cancel}
        </button>

        {!showDeleteConfirm ? (
          <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform bg-transparent border border-(--color-danger) text-(--color-danger)" onClick={() => setShowDeleteConfirm(true)}>
            {adminFormData.delete}
          </button>
        ) : (
          <div className="mt-2 rounded-md border p-3">
            <p className="mb-2">{adminFormData.deleteConfirmText}</p>
            <div className="flex gap-2 justify-center">
              <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform bg-transparent border border-(--color-danger) text-(--color-danger)" onClick={handleDelete} disabled={deleting}>
                {deleting ? adminFormData.deleting : adminFormData.yesDelete}
              </button>
              <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                {adminFormData.no} 
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteError && <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-2 transition-colors"><span className="text-[0.8rem] text-(--color-danger)">{adminFormData.errors[deleteError]}</span></div>}
    </div>
  );
}

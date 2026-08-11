"use client"

import { useEffect } from "react";
import { useAdminStore } from "../store/useAdminStore";
import AdminUserForm from "./AdminUserForm";
import { useProfile } from '@/providers/ProfileContext';


export default function Admin({ onClose }: { onClose?: () => void }) {

  // I use temp adminData  you can delete this and add this in language data ; 
  const adminData = {
     
    "title": "Admin Panel",
    "searchPlaceholder": "Search by name or email",
    "searching": "Searching...",
    "search": "Search",
    "noUsersFound": "No users found.",
    "viewEdit": "View/Edit",
    "loadingUser": "Loading user...",
    "edit": "Edit",
    "errors": {
        "forbidden": "Forbidden",
        "loadUsersFailed": "Failed to load users",
        "loadUserFailed": "Failed to load user"
    },
    "form": {
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
  }

  const query = useAdminStore((s) => s.query);
  const setQuery = useAdminStore((s) => s.setQuery);
  const results = useAdminStore((s) => s.results);
  const listLoading = useAdminStore((s) => s.listLoading);
  const listError = useAdminStore((s) => s.listError);
  const searchUsers = useAdminStore((s) => s.searchUsers);
  const selectedUser = useAdminStore((s) => s.selectedUser);
  const detailLoading = useAdminStore((s) => s.detailLoading);
  const detailError = useAdminStore((s) => s.detailError);
  const selectUser = useAdminStore((s) => s.selectUser);
  const clearSelectedUser = useAdminStore((s) => s.clearSelectedUser);
  const { role } = useProfile();

  useEffect(() => {
    if (role === "ADMIN") searchUsers("");
  }, [role, searchUsers]);

  if (role !== "ADMIN") return null;

  return (
    <div className="absolute left-0 top-20 z-50 mt-3 max-h-[75vh] w-[90vw] max-w-md overflow-y-auto rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-4 shadow-xl transition-colors duration-300">
      <div className="flex w-full flex-col gap-6">
        <section className="w-full">
          <header className="mb-3 flex flex-row items-center justify-between gap-1">
            <h3 className="text-lg font-semibold tracking-tight">{adminData.title}</h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full px-2 py-0.5 text-sm font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary)"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </header>

          <form className="flex w-full gap-2 pt-2" onSubmit={(e) => {
              e.preventDefault();
              searchUsers(query);
            }}
          >
            <input className={`rounded-md border px-3 py-1.5 text-sm outline-none transition-colors flex-1`}
              placeholder={adminData.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform bg-(--color-accent) text-white" type="submit" disabled={listLoading}>
              {listLoading ? adminData.searching : adminData.search}
            </button>
          </form>

          {listError && (
            <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) border-none py-2">
              <span className="text-red-500">{adminData.errors[listError]}</span>
            </div>
          )}

          <div className="flex flex-col border-t border-(--color-border-default)">
            {!listLoading && results.length === 0 && !listError && (
              <div className="py-6 text-center text-sm text-(--color-text-secondary)">{adminData.noUsersFound}</div>
            )}
            {results.map((user) => (
              
              <div key={user.id} className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-3 transition-colors border-b border-(--color-border-default) cursor-pointer " onClick={() => selectUser(user.id)}>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span>{user.name}</span>
                  <span className={` text-green-600 text-xs`}>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-mediumForm">
                  <span className="text-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-(--color-accent-soft) text-(--color-accent)">{user.role}</span>
                  <button className="cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-transform" onClick={(e) => { e.stopPropagation(); selectUser(user.id); }}>
                    {adminData.viewEdit}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {detailLoading && <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) border-none py-2">
            <span>{adminData.loadingUser}</span>
          </div>}

          {detailError && <div className="flex w-full flex-wrap items-center justify-between gap-4 px-1 py-4 transition-colors border-b border-(--color-border-default) border-none py-2">
            <span className="text-red-500">{adminData.errors[detailError] }</span>
            </div>
          }

          {selectedUser && !detailLoading && (
            <div className="w-full">
              <header className="mb-3 flex flex-col gap-1">
                <h3 className="text-lg font-semibold tracking-tight">{adminData.edit} {selectedUser.name}</h3>
              </header>
              <AdminUserForm user={selectedUser} onCancel={clearSelectedUser} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

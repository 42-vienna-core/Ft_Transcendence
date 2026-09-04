"use client"

import { useEffect } from "react";
import { useAdminStore } from "../store/useAdminStore";
import AdminUserForm from "./AdminUserForm";
import { useProfile } from '@/providers/ProfileContext';
import { useTranslations } from 'next-intl';
import { ShieldCheck, X, Search, AlertTriangle, ChevronRight, Users } from "lucide-react";


export default function Admin({ onClose }: { onClose?: () => void }) {

    const adminData = useTranslations("Admin");

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
        <div className="absolute left-0 top-20 z-50 mt-3 w-[90vw] max-w-md overflow-hidden rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) shadow-2xl shadow-black/20 transition-colors duration-300">
            <div className="flex items-center justify-between gap-4 border-b border-(--color-border-default) bg-(--color-bg-subtle) px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-accent-soft) text-(--color-accent)">
                        <ShieldCheck size={20} />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-(--color-text-primary)">{adminData("title")}</h3>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-border-default) hover:text-(--color-text-primary)"
                        aria-label={adminData("close")}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto p-6">
                <form className="flex w-full gap-2"
                    onSubmit={(e) => { e.preventDefault(); searchUsers(query) }}
                >
                    <div className="relative flex-1">
                        <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-(--color-text-tertiary)" />
                        <input id='admin' autoComplete="off" placeholder={adminData("searchPlaceholder")} value={query}
                            className="w-full rounded-lg border border-(--color-border-default) bg-(--color-bg-subtle) py-2 pr-3 pl-11 text-sm text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-tertiary) focus:border-(--color-accent) focus:shadow-[0_0_0_3px_var(--color-accent-soft)]"
                            onChange={(e) => setQuery(e.currentTarget.value)}
                        />
                    </div>
                    <button className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-(--color-accent) px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-(--color-accent)/30 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                        type="submit" disabled={listLoading}
                    >
                        {listLoading ? adminData("searching") : adminData("search")}
                    </button>
                </form>

                {listError && (
                    <div className="flex items-center gap-2 rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/10 px-3 py-2.5 text-xs font-medium text-(--color-danger)">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{adminData(`errors.${listError}`)}</span>
                    </div>
                )}

                {!selectedUser && (
                    <div className="flex flex-col gap-1.5">
                        {!listLoading && results.length === 0 && !listError && (
                            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-(--color-text-secondary)">
                                <Users size={22} className="text-(--color-text-tertiary)" />
                                <span>{adminData("noUsersFound")}</span>
                            </div>
                        )}
                        {results.map((user) => {
                            const isAdmin = user.role === "ADMIN";
                            return (
                                <div key={user.id} title={isAdmin ? adminData("forbidden") : undefined}
                                    aria-disabled={isAdmin}
                                    className={`group flex w-full items-center gap-3 rounded-xl border border-transparent bg-(--color-bg-subtle) px-3 py-3 transition-all ${isAdmin
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer hover:-translate-y-0.5 hover:border-(--color-border-default) hover:bg-(--color-accent-soft)"
                                        }`}
                                    onClick={() => {
                                        if (isAdmin) return;
                                        selectUser(user.id);
                                    }}
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-xs font-bold tracking-wide text-white uppercase">
                                        {user.name.slice(0, 2)}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="truncate text-sm font-semibold text-(--color-text-primary)">{user.name}</span>
                                        <span className="truncate text-xs text-(--color-text-secondary)">{user.email}</span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${user.role === "ADMIN"
                                                    ? "bg-(--color-accent-soft) text-(--color-accent)"
                                                    : "bg-(--color-border-default) text-(--color-text-secondary)"
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                        <ChevronRight size={16} className="text-(--color-text-tertiary) transition-transform group-hover:translate-x-0.5 group-hover:text-(--color-accent)" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {detailLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-(--color-border-default) bg-(--color-bg-subtle) px-3 py-2.5 text-xs font-medium text-(--color-text-secondary)">
                        <span>{adminData("loadingUser")}</span>
                    </div>
                )}

                {detailError && (
                    <div className="flex items-center gap-2 rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/10 px-3 py-2.5 text-xs font-medium text-(--color-danger)">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{adminData(`errors.${detailError}`)}</span>
                    </div>
                )}

                {selectedUser && !detailLoading && (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4 border-b border-(--color-border-default) pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-accent) text-xs font-bold tracking-wide text-white uppercase">
                                    {selectedUser.name.slice(0, 2)}
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-(--color-text-primary)">
                                        {adminData("edit")} {selectedUser.name}
                                    </p>
                                    <p className="text-xs text-(--color-text-secondary)">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={clearSelectedUser}
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-(--color-text-secondary) transition-colors hover:bg-(--color-border-default) hover:text-(--color-text-primary)"
                                aria-label={adminData("close")}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <AdminUserForm user={selectedUser} onCancel={clearSelectedUser} />
                    </div>
                )}
            </div>
        </div>
    );
}

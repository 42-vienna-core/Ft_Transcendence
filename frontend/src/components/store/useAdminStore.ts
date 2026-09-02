import { create } from 'zustand';

export type Role = "ADMIN" | "PLAYER" | "BOT";


export type ListErrorKey = '' | 'forbidden' | 'loadUsersFailed';
export type DetailErrorKey = '' | 'forbidden' | 'loadUserFailed';
export type SaveErrorKey = '' | 'forbidden' | 'saveFailed';
export type DeleteErrorKey = '' | 'forbidden' | 'deleteFailed';

export interface AdminUser {
	id: number;
	name: string;
	email: string;
	role: Role;
}

export interface AdminUserUpdate {
  name: string;
  email: string;
  password?: string;
  role?: Role;
}

export interface AdminStore {
  query: string;
  results: AdminUser[];
  listLoading: boolean;
  listError: ListErrorKey;

  selectedUser: AdminUser | null;
  detailLoading: boolean;
  detailError: DetailErrorKey;

  saving: boolean;
  saveError: SaveErrorKey;

  deleting: boolean;
  deleteError: DeleteErrorKey;

  setQuery: (query: string) => void;
  searchUsers: (q: string) => Promise<void>;
  selectUser: (id: number) => Promise<void>;
  clearSelectedUser: () => void;
  saveUser: (id: number, body: AdminUserUpdate) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  query: '',
  results: [],
  listLoading: false,
  listError: '',

  selectedUser: null,
  detailLoading: false,
  detailError: '',

  saving: false,
  saveError: '',

  deleting: false,
  deleteError: '',

  setQuery: (query) => set({ query }),
  searchUsers: async (q) => {
    set({ listLoading: true, listError: '' });
    try {
      const res = await fetch(`/api/admin?path=/admin/users?q=${encodeURIComponent(q)}`);
      if (!res.ok) { 
       return set({ listError: res.status === 403 ? 'forbidden' : 'loadUsersFailed',  results: [] });
      }
      const users: AdminUser[] = await res.json();
      set({ results: users });
    } catch {
      set({ listError: 'loadUsersFailed', results: [] });
    } finally {
      set({ listLoading: false });
    }
  },
  selectUser: async (id) => {
    set({ selectedUser: null, detailLoading: true, detailError: '' });
    try {
      const res = await fetch(`/api/admin?path=/admin/users/${id}`);
      if (!res.ok) {
        set({ detailError: res.status === 403 ? 'forbidden' : 'loadUserFailed' });
        return;
      }
      const user = await res.json();
      set({ selectedUser: {...user, username: user.name} });
    } catch {
      set({ detailError: 'loadUserFailed' });
    } finally {
      set({ detailLoading: false });
    }
  },

  clearSelectedUser: () => set({ selectedUser: null, detailError: '', saveError: '', deleteError: '' }),
  saveUser: async (id, body) => {
    ("in AdminStore ", id, body);
    set({ saving: true, saveError: '' });
    try {
      const res = await fetch(`/api/admin?path=/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        set({ saveError: res.status === 403 ? 'forbidden' : 'saveFailed' });
        return false;
      }
      const updated: AdminUser = await res.json();
      set((state) => ({ 
          selectedUser: updated,
          results: state.results.map((u) => (u.id === updated.id ? updated : u)),
        }
      ));
      return true;
    } catch {
      set({ saveError: 'saveFailed' });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  deleteUser: async (id) => {
    set({ deleting: true, deleteError: '' });

    try {
      const res = await fetch(`/api/admin?path=/admin/users/${id}`, { method: 'DELETE', });
      if (!res.ok) {
        set({ deleteError: res.status === 403 ? 'forbidden' : 'deleteFailed' });
        return false;
      }
      set((state) => ({
        selectedUser: null,
        results: state.results.filter((u) => u.id !== id),
      }));
      return true;
    } catch {
      set({ deleteError: 'deleteFailed' });
      return false;
    } finally {
      set({ deleting: false });
    }
  },
}));

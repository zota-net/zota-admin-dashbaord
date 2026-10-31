import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminSession {
  token: string;
  admin: {
    id: string;
    fullname: string;
    email: string;
    role: 'Admin' | 'SuperAdmin';
  };
}

interface AdminState {
  session: AdminSession | null;
  isAuthenticated: boolean;

  login: (session: AdminSession) => void;
  logout: () => void;
  checkSession: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,

      login: (session) => set({ session, isAuthenticated: true }),

      logout: () => set({ session: null, isAuthenticated: false }),

      checkSession: () => {
        const { session } = get();
        if (!session?.token) return false;
        // Decode the JWT exp claim so stale sessions bounce to /login
        // instead of eating a 401 round-trip on the first API call.
        try {
          const payload = JSON.parse(atob(session.token.split('.')[1] ?? '')) as { exp?: number };
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            get().logout();
            return false;
          }
        } catch {
          // Token not a parseable JWT — treat as present
        }
        return true;
      },

      isSuperAdmin: () => {
        const { session } = get();
        return session?.admin?.role === 'SuperAdmin';
      },
    }),
    {
      name: 'zota-admin-session',
    }
  )
);

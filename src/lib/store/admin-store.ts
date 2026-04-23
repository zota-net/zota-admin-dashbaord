import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, ClientReport } from '@/lib/api/types';

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
}

interface AppState {
  sidebarCollapsed: boolean;
  settings: {
    sidebarCollapsed: boolean;
    [key: string]: unknown;
  };
  isLoading: boolean;
  selectedClient: Client | null;
  clientReport: ClientReport | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSelectedClient: (client: Client | null) => void;
  setClientReport: (report: ClientReport | null) => void;
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
        // Add token expiry check if needed
        return true;
      },
    }),
    {
      name: 'zota-admin-session',
    }
  )
);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      settings: {
        sidebarCollapsed: false,
      },
      isLoading: false,
      selectedClient: null,
      clientReport: null,

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
          settings: { ...state.settings, sidebarCollapsed: !state.sidebarCollapsed },
        })),

      setSidebarCollapsed: (collapsed) =>
        set((state) => ({
          sidebarCollapsed: collapsed,
          settings: { ...state.settings, sidebarCollapsed: collapsed },
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setSelectedClient: (client) => set({ selectedClient: client }),
      setClientReport: (report) => set({ clientReport: report }),
    }),
    {
      name: 'zota-admin-app',
    }
  )
);
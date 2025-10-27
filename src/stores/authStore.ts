import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JiraApiConfig } from '../types/jira.types';

interface AuthState {
  isAuthenticated: boolean;
  credentials: JiraApiConfig | null;
  isLoading: boolean;
  login: (credentials: JiraApiConfig) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      credentials: null,
      isLoading: true,

      login: (credentials: JiraApiConfig) => {
        set({
          credentials,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          credentials: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'jira-auth-storage',
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        credentials: state.credentials,
      }),
      onRehydrateStorage: () => state => {
        // Quando os dados são carregados do localStorage, verificar se as credenciais são válidas
        if (state) {
          // Se não há credenciais ou credenciais inválidas, forçar logout
          if (
            !state.credentials ||
            !state.credentials.domain ||
            !state.credentials.email ||
            !state.credentials.apiToken
          ) {
            console.log('🔐 No valid credentials found, forcing logout');
            state.isAuthenticated = false;
            state.credentials = null;
          } else {
            console.log('🔐 Valid credentials found, staying authenticated');
          }
          state.isLoading = false;
        }
      },
    }
  )
);

// Hook para facilitar o uso
export const useAuth = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    credentials: store.credentials,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
    setLoading: store.setLoading,
  };
};

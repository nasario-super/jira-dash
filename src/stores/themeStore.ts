import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  getActualTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      
      getActualTheme: () => {
        const { theme } = get()
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return theme
      }
    }),
    {
      name: 'jira-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      }
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const actualTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  
  root.classList.remove('light', 'dark')
  root.classList.add(actualTheme)
}

// Hook para facilitar o uso
export const useTheme = () => {
  const store = useThemeStore()
  return {
    theme: store.theme,
    setTheme: store.setTheme,
    getActualTheme: store.getActualTheme
  }
}















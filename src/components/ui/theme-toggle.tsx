import React from 'react'
import { useTheme } from '../../stores/themeStore'
import { Button } from './button'
import { Moon, Sun, Monitor } from 'lucide-react'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' }
  ] as const

  return (
    <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(value)}
          className="h-8 w-8 p-0"
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
















import React from 'react';
import { RefreshCw, Settings, Bell } from 'lucide-react';
import { LogoutButton } from '../auth/LogoutButton';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
}

const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  const formatLastUpdated = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 lg:ml-70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="ml-1 font-medium">
                {formatLastUpdated(lastUpdated)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>

          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;

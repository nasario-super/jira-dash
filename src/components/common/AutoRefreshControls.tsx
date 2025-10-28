import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Pause,
  Play,
  Settings,
  Clock,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

interface AutoRefreshControlsProps {
  className?: string;
}

const AutoRefreshControls: React.FC<AutoRefreshControlsProps> = ({
  className = '',
}) => {
  const {
    isRefreshing,
    lastRefresh,
    nextRefresh,
    refreshCount,
    config,
    updateConfig,
    forceRefresh,
    pauseRefresh,
    resumeRefresh,
  } = useAutoRefresh();

  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatInterval = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getIntervalOptions = () => [
    { label: '1 min', value: 1 * 60 * 1000 },
    { label: '5 min', value: 5 * 60 * 1000 },
    { label: '10 min', value: 10 * 60 * 1000 },
    { label: '15 min', value: 15 * 60 * 1000 },
    { label: '30 min', value: 30 * 60 * 1000 },
    { label: '1h', value: 60 * 60 * 1000 },
    { label: '2h', value: 2 * 60 * 60 * 1000 },
  ];

  return (
    <div className={`${className}`}>
      {/* Main Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={forceRefresh}
          disabled={isRefreshing}
          className="text-xs"
        >
          {isRefreshing ? (
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={config.enabled ? pauseRefresh : resumeRefresh}
          className="text-xs"
        >
          {config.enabled ? (
            <Pause className="w-3 h-3 mr-1" />
          ) : (
            <Play className="w-3 h-3 mr-1" />
          )}
          {config.enabled ? 'Pausar' : 'Retomar'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          Config
        </Button>

        {/* Status Badge */}
        <Badge
          variant={config.enabled ? 'default' : 'secondary'}
          className="text-xs"
        >
          {config.enabled ? (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Auto
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Pause className="w-3 h-3" />
              Pausado
            </div>
          )}
        </Badge>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 z-50"
          >
            <Card className="shadow-lg border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações de Atualização
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Atualização Automática
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Atualizar dados automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={checked =>
                      updateConfig({ enabled: checked })
                    }
                  />
                </div>

                {/* Interval */}
                {config.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Intervalo</label>
                      <p className="text-xs text-muted-foreground">
                        Atualizar a cada {formatInterval(config.interval)}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {getIntervalOptions().map(option => (
                        <Button
                          key={option.value}
                          variant={
                            config.interval === option.value
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() =>
                            updateConfig({ interval: option.value })
                          }
                          className="text-xs h-8"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Refresh */}
                {config.enabled && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Atualização Inteligente
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Só atualizar quando houver atividade
                      </p>
                    </div>
                    <Switch
                      checked={config.smartRefresh}
                      onCheckedChange={checked =>
                        updateConfig({ smartRefresh: checked })
                      }
                    />
                  </div>
                )}

                {/* Background Refresh */}
                {config.enabled && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Atualizar em Background
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Continuar atualizando quando aba não estiver ativa
                      </p>
                    </div>
                    <Switch
                      checked={config.backgroundRefresh}
                      onCheckedChange={checked =>
                        updateConfig({ backgroundRefresh: checked })
                      }
                    />
                  </div>
                )}

                {/* Status Info */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Última atualização:
                    </span>
                    <span className="font-medium">
                      {lastRefresh ? formatTime(lastRefresh) : 'Nunca'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Próxima atualização:
                    </span>
                    <span className="font-medium">
                      {nextRefresh ? formatTime(nextRefresh) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Total de atualizações:
                    </span>
                    <span className="font-medium">{refreshCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoRefreshControls;















import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: any;
  onReconnect: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectionStatus,
  lastMessage,
  onReconnect,
  className = '',
}) => {
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'disconnected':
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro de Conexão';
      case 'disconnected':
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'disconnected':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastUpdate = () => {
    if (!lastMessage) return 'Nunca';

    const now = new Date();
    const messageTime = new Date(lastMessage.timestamp);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${className}`}
      >
        <Card
          className={`border-l-4 ${getStatusColor()
            .split(' ')[0]
            .replace('bg-', 'border-l-')}`}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getStatusText()}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor()}`}
                    >
                      {connectionStatus}
                    </Badge>
                  </div>
                  {lastMessage && (
                    <div className="text-xs text-muted-foreground">
                      Última atualização: {formatLastUpdate()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connectionStatus === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReconnect}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reconectar
                  </Button>
                )}

                {connectionStatus === 'disconnected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReconnect}
                    className="text-xs"
                  >
                    <Wifi className="w-3 h-3 mr-1" />
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;















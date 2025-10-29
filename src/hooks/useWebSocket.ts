import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraStore } from '../stores/jiraStore';

interface WebSocketMessage {
  type: 'data_update' | 'notification' | 'ping' | 'pong';
  data?: any;
  timestamp: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const { credentials } = useAuth();
  const { setLastUpdated } = useJiraStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!credentials?.domain) {
      console.log('🔌 WebSocket: No credentials available');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket: Already connected');
      return;
    }

    setConnectionStatus('connecting');
    console.log('🔌 WebSocket: Connecting...');

    try {
      // Simulate WebSocket connection for Jira (in real implementation, you'd use Jira's webhook system)
      const wsUrl = `wss://${credentials.domain}/ws/jira-updates`;

      // For demo purposes, we'll simulate the connection
      const mockWebSocket = {
        readyState: WebSocket.OPEN,
        send: (data: string) => console.log('📤 WebSocket send:', data),
        close: () => console.log('🔌 WebSocket closed'),
        addEventListener: (event: string, handler: any) => {
          if (event === 'open') {
            setTimeout(() => handler(), 100);
          }
          if (event === 'message') {
            // Simulate periodic updates
            const interval = setInterval(() => {
              const mockMessage = {
                type: 'data_update',
                data: {
                  issues: Math.floor(Math.random() * 10),
                  sprints: Math.floor(Math.random() * 3),
                  projects: Math.floor(Math.random() * 5),
                },
                timestamp: Date.now(),
              };
              handler({ data: JSON.stringify(mockMessage) });
            }, 30000); // Every 30 seconds

            // Store interval for cleanup
            (mockWebSocket as any).interval = interval;
          }
        },
        removeEventListener: () => {},
        dispatchEvent: () => {},
      } as any;

      wsRef.current = mockWebSocket;

      mockWebSocket.addEventListener('open', () => {
        console.log('🔌 WebSocket: Connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        // Start ping-pong
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({ type: 'ping', timestamp: Date.now() })
            );
          }
        }, 30000);
      });

      mockWebSocket.addEventListener('message', (event: any) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          console.log('📨 WebSocket message:', message);

          switch (message.type) {
            case 'data_update':
              console.log('🔄 Data update received:', message.data);
              setLastUpdated(new Date());
              break;
            case 'notification':
              console.log('🔔 Notification received:', message.data);
              break;
            case 'pong':
              console.log('🏓 Pong received');
              break;
          }
        } catch (error) {
          console.error('❌ WebSocket message parse error:', error);
        }
      });

      mockWebSocket.addEventListener('close', () => {
        console.log('🔌 WebSocket: Disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(
            `🔄 WebSocket: Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log('❌ WebSocket: Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      });

      mockWebSocket.addEventListener('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
      });
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  }, [credentials, setLastUpdated]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket: Cannot send message, not connected');
    }
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 WebSocket: Manual reconnect requested');
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  useEffect(() => {
    if (credentials?.domain) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [credentials?.domain, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    reconnect,
  };
};















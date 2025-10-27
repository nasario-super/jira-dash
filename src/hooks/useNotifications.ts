import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../stores/authStore';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface UseNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { credentials } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn('⚠️ Notifications not supported in this browser');
        return 'denied';
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        console.log(`🔔 Notification permission: ${result}`);
        return result;
      } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return 'denied';
      }
    }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== 'granted') {
        console.warn(
          '⚠️ Cannot show notification: not supported or permission denied'
        );
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'jira-dashboard',
          requireInteraction: false,
          silent: false,
          ...options,
        });

        // Add to notifications list
        const notificationData: NotificationData = {
          id: Date.now().toString(),
          title,
          message: options?.body || '',
          type: 'info',
          timestamp: new Date(),
          read: false,
          actionUrl: options?.data?.url,
        };

        setNotifications(prev => [notificationData, ...prev.slice(0, 49)]); // Keep last 50

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Handle click
        notification.onclick = () => {
          window.focus();
          if (options?.data?.url) {
            window.open(options.data.url, '_blank');
          }
          notification.close();
        };

        console.log('🔔 Notification shown:', title);
      } catch (error) {
        console.error('❌ Error showing notification:', error);
      }
    },
    [isSupported, permission]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-request permission when user is authenticated
  useEffect(() => {
    if (credentials && isSupported && permission === 'default') {
      requestPermission();
    }
  }, [credentials, isSupported, permission, requestPermission]);

  // Simulate notifications for demo purposes
  useEffect(() => {
    if (!credentials || permission !== 'granted') return;

    const interval = setInterval(() => {
      const shouldNotify = Math.random() < 0.1; // 10% chance every 30 seconds
      if (shouldNotify) {
        const notifications = [
          {
            title: 'Nova Issue Criada',
            body: 'Uma nova issue foi criada no projeto',
            data: { url: '/dashboard' },
          },
          {
            title: 'Sprint Atualizada',
            body: 'O progresso da sprint foi atualizado',
            data: { url: '/dashboard' },
          },
          {
            title: 'Issue Resolvida',
            body: 'Uma issue foi marcada como resolvida',
            data: { url: '/dashboard' },
          },
          {
            title: 'Comentário Adicionado',
            body: 'Um novo comentário foi adicionado a uma issue',
            data: { url: '/dashboard' },
          },
        ];

        const randomNotification =
          notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotification.title, {
          body: randomNotification.body,
          data: randomNotification.data,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [credentials, permission, showNotification]);

  return {
    notifications,
    unreadCount,
    isSupported,
    permission,
    requestPermission,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
};














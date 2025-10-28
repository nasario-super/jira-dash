import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraStore } from '../stores/jiraStore';
import { useDashboardData } from './useJiraQueries';

interface AutoRefreshConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  smartRefresh: boolean; // Only refresh when data might have changed
  backgroundRefresh: boolean; // Refresh when tab is not visible
}

interface UseAutoRefreshReturn {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  nextRefresh: Date | null;
  refreshCount: number;
  config: AutoRefreshConfig;
  updateConfig: (newConfig: Partial<AutoRefreshConfig>) => void;
  forceRefresh: () => void;
  pauseRefresh: () => void;
  resumeRefresh: () => void;
}

const DEFAULT_CONFIG: AutoRefreshConfig = {
  enabled: true,
  interval: 5 * 60 * 1000, // 5 minutes
  smartRefresh: true,
  backgroundRefresh: false,
};

export const useAutoRefresh = (): UseAutoRefreshReturn => {
  const { credentials } = useAuth();
  const { lastUpdated, setLastUpdated } = useJiraStore();
  const { refetch } = useDashboardData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [config, setConfig] = useState<AutoRefreshConfig>(() => {
    const saved = localStorage.getItem('jira-auto-refresh-config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const isPausedRef = useRef(false);

  const calculateNextRefresh = useCallback(() => {
    if (config.enabled && !isPausedRef.current) {
      const next = new Date(Date.now() + config.interval);
      setNextRefresh(next);
    } else {
      setNextRefresh(null);
    }
  }, [config.enabled, config.interval]);

  const performRefresh = useCallback(async () => {
    if (!credentials || isRefreshing || isPausedRef.current) {
      return;
    }

    console.log('🔄 Auto-refresh: Starting refresh...');
    setIsRefreshing(true);
    lastActivityRef.current = new Date();

    try {
      await refetch();
      setLastRefresh(new Date());
      setLastUpdated(new Date());
      setRefreshCount(prev => prev + 1);
      console.log('✅ Auto-refresh: Completed successfully');
    } catch (error) {
      console.error('❌ Auto-refresh: Failed', error);
    } finally {
      setIsRefreshing(false);
      calculateNextRefresh();
    }
  }, [
    credentials,
    isRefreshing,
    refetch,
    setLastUpdated,
    calculateNextRefresh,
  ]);

  const forceRefresh = useCallback(() => {
    console.log('🔄 Force refresh requested');
    performRefresh();
  }, [performRefresh]);

  const pauseRefresh = useCallback(() => {
    console.log('⏸️ Auto-refresh paused');
    isPausedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setNextRefresh(null);
  }, []);

  const resumeRefresh = useCallback(() => {
    console.log('▶️ Auto-refresh resumed');
    isPausedRef.current = false;
    if (config.enabled) {
      calculateNextRefresh();
      setupInterval();
    }
  }, [config.enabled, calculateNextRefresh]);

  const setupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (config.enabled && !isPausedRef.current) {
      console.log(
        `🔄 Auto-refresh: Setting up interval (${config.interval}ms)`
      );
      intervalRef.current = setInterval(() => {
        // Smart refresh: only refresh if there's been activity or enough time has passed
        if (config.smartRefresh) {
          const timeSinceActivity =
            Date.now() - lastActivityRef.current.getTime();
          const timeSinceLastRefresh = lastRefresh
            ? Date.now() - lastRefresh.getTime()
            : Infinity;

          // Only refresh if there's been recent activity or it's been a while
          if (
            timeSinceActivity < 10 * 60 * 1000 ||
            timeSinceLastRefresh > config.interval
          ) {
            performRefresh();
          } else {
            console.log('🔄 Auto-refresh: Skipped (no recent activity)');
          }
        } else {
          performRefresh();
        }
      }, config.interval);
    }
  }, [config.enabled, config.interval, config.smartRefresh, performRefresh]);

  const updateConfig = useCallback(
    (newConfig: Partial<AutoRefreshConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      localStorage.setItem(
        'jira-auto-refresh-config',
        JSON.stringify(updatedConfig)
      );

      if (newConfig.enabled !== undefined || newConfig.interval !== undefined) {
        setupInterval();
      }
    },
    [config, setupInterval]
  );

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!config.backgroundRefresh) {
          pauseRefresh();
        }
      } else {
        if (config.enabled && !isPausedRef.current) {
          resumeRefresh();
          // Refresh immediately when tab becomes visible
          const timeSinceLastRefresh = lastRefresh
            ? Date.now() - lastRefresh.getTime()
            : Infinity;
          if (timeSinceLastRefresh > 2 * 60 * 1000) {
            // 2 minutes
            forceRefresh();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [
    config.backgroundRefresh,
    config.enabled,
    lastRefresh,
    pauseRefresh,
    resumeRefresh,
    forceRefresh,
  ]);

  // Handle user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = new Date();
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  // Setup interval when config changes
  useEffect(() => {
    setupInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setupInterval]);

  // Initial setup
  useEffect(() => {
    if (config.enabled && credentials) {
      calculateNextRefresh();
    }
  }, [config.enabled, credentials, calculateNextRefresh]);

  return {
    isRefreshing,
    lastRefresh,
    nextRefresh,
    refreshCount,
    config,
    updateConfig,
    forceRefresh,
    pauseRefresh,
    resumeRefresh,
  };
};















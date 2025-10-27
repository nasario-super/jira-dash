import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from './stores/authStore';
import { useTheme } from './stores/themeStore';
import { useProjectSelection } from './hooks/useProjectSelection';
import { LoginForm } from './components/auth/LoginForm';
import { ProjectSelection } from './components/auth/ProjectSelection';
import Dashboard from './components/dashboard/Dashboard';
import OptimizedDashboard from './components/dashboard/OptimizedDashboard';
import Analytics from './pages/Analytics';
import AgileDashboard from './pages/AgileDashboard';
import ExecutiveDashboardPage from './pages/ExecutiveDashboard';
import ReportsPage from './pages/ReportsPage';
import SlackIntegrationPage from './pages/SlackIntegration';
import QualityMetricsPage from './pages/QualityMetrics';
import AdvancedAnalyticsPage from './pages/AdvancedAnalytics';
import AdvancedAnalyticsTestPage from './pages/AdvancedAnalyticsTestPage';
import SidebarTest from './components/common/SidebarTest';
import SidebarDebug from './components/common/SidebarDebug';
import SidebarMinimal from './components/common/SidebarMinimal';
import SidebarBasic from './components/common/SidebarBasic';
import SidebarNavigationTest from './components/common/SidebarNavigationTest';
import AdvancedAnalyticsTest from './components/analytics/AdvancedAnalyticsTest';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PWANotification } from './components/ui/pwa-notification';
import { queryClient } from './lib/queryClient';
import './styles/globals.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const {
    isSelectionRequired,
    hasSelectedProjects,
    setSelectedProjects,
    skipProjectSelection,
  } = useProjectSelection();

  useEffect(() => {
    // Aplicar tema inicial
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Mostrar tela de seleção de projetos se necessário
  if (isSelectionRequired) {
    return (
      <ProjectSelection
        onProjectsSelected={setSelectedProjects}
        onSkip={skipProjectSelection}
      />
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<OptimizedDashboard />} />
          <Route path="/dashboard" element={<OptimizedDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/agile" element={<AgileDashboard />} />
          <Route path="/executive" element={<ExecutiveDashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/slack" element={<SlackIntegrationPage />} />
          <Route path="/quality" element={<QualityMetricsPage />} />
          <Route
            path="/advanced-analytics"
            element={<AdvancedAnalyticsPage />}
          />
          <Route path="/sidebar-test" element={<SidebarTest />} />
          <Route path="/sidebar-debug" element={<SidebarDebug />} />
          <Route path="/sidebar-minimal" element={<SidebarMinimal />} />
          <Route path="/sidebar-basic" element={<SidebarBasic />} />
          <Route
            path="/sidebar-navigation-test"
            element={<SidebarNavigationTest />}
          />
          <Route
            path="/advanced-analytics-test"
            element={<AdvancedAnalyticsTestPage />}
          />
        </Routes>
        <PWANotification />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

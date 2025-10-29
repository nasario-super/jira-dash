// @ts-nocheck
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '../../stores/authStore';
import { useDashboardData } from '../../hooks/useJiraQueries';
import { useJiraStore } from '../../stores/jiraStore';
import { useOptimizedFilters } from '../../hooks/useOptimizedFilters';
import { DataTransformService } from '../../services/dataTransform';
import MetricsCard from './MetricsCard';
import AdvancedFilterPanel from '../common/AdvancedFilterPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import ConnectionStatus from '../common/ConnectionStatus';
import NotificationCenter from '../common/NotificationCenter';
import AutoRefreshControls from '../common/AutoRefreshControls';
import Header from '../common/Header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useNavigate } from 'react-router-dom';
import JiraConnectionError from '../common/JiraConnectionError';

// Lazy loading para componentes pesados
const SprintProgress = lazy(() => import('./SprintProgress'));
const IssuesByStatus = lazy(() => import('./IssuesByStatus'));
const TeamVelocity = lazy(() => import('./TeamVelocity'));
const BurndownChart = lazy(() => import('./BurndownChart'));
const IssuesByType = lazy(() => import('./IssuesByType'));
const IssuesByUser = lazy(() => import('./IssuesByUser'));
const RecentActivity = lazy(() => import('./RecentActivity'));

const Dashboard: React.FC = React.memo(() => {
  const { isAuthenticated, credentials } = useAuth();

  // Early returns BEFORE any other hooks
  if (!isAuthenticated || !credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const { projects, sprints, issues, isLoading, error, refetch } =
    useDashboardData();
  const {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    getFilterSummary,
  } = useOptimizedFilters(projects || []);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Real-time features
  const { isConnected, connectionStatus, lastMessage, reconnect } =
    useWebSocket();
  const { isRefreshing, lastRefresh, refreshCount } = useAutoRefresh();

  // In production, we assume all data is real
  const hasRealData = true;
  const navigate = useNavigate();

  // Debug logs
  console.log('🔍 Dashboard Debug:', {
    isAuthenticated,
    hasCredentials: !!credentials,
    projects: projects?.length || 0,
    sprints: sprints?.length || 0,
    issues: issues?.length || 0,
    filters: filters,
    hasActiveFilters: hasActiveFilters,
  });

  // Handle Jira connection error
  if (error && !isLoading) {
    return (
      <JiraConnectionError
        error={error.message || 'Erro desconhecido ao conectar com o Jira'}
        onRetry={() => {
          console.log('🔄 Retrying Jira connection...');
          refetch();
        }}
        onOpenSettings={() => {
          console.log('⚙️ Opening settings...');
          // You can implement settings modal or redirect to settings page
          alert('Configurações do Jira - Verifique suas credenciais');
        }}
      />
    );
  }

  // Comentado temporariamente para evitar loops infinitos
  // useEffect(() => {
  //   if (projects.length > 0) {
  //     setProjects(projects);
  //   }
  // }, [projects, setProjects]);

  // useEffect(() => {
  //   if (sprints.length > 0) {
  //     setSprints(sprints);
  //   }
  // }, [sprints, setSprints]);

  // useEffect(() => {
  //   if (issues.length > 0) {
  //     setIssues(issues);
  //   }
  // }, [issues, setIssues]);

  // useEffect(() => {
  //   if (projects.length > 0 || sprints.length > 0 || issues.length > 0) {
  //     setLastUpdated(new Date());
  //   }
  // }, [projects.length, sprints.length, issues.length, setLastUpdated]);

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    console.log('🔄 filteredData useMemo triggered:', {
      issuesLength: issues?.length || 0,
      filtersProjects: filters.projects,
      filtersProjectsLength: filters.projects.length,
    });

    if (!issues || issues.length === 0) {
      console.log('❌ No issues available for filtering - Debug:', {
        issuesValue: issues,
        issuesLengthAtIf: issues?.length,
        isIssuesFalsy: !issues,
        isIssuesLengthZero: issues?.length === 0,
        issuesType: typeof issues,
      });
      return { projects: projects || [], sprints: sprints || [], issues: [] };
    }

    let filteredIssues = [...issues];

    // Filtrar por projetos
    if (filters.projects.length > 0) {
      console.log('🔍 Project Filter Debug:', {
        filterProjects: filters.projects,
        totalIssues: issues.length,
        uniqueProjects: [...new Set(issues.map((i : any) => i.fields.project.key))],
        sampleIssues: issues.slice(0, 5).map((issue : any) => ({
          key: issue.key,
          projectKey: issue.fields.project.key,
          projectName: issue.fields.project.name,
        })),
      });

      filteredIssues = filteredIssues.filter((issue : any) => {
        const projectKey = issue.fields.project.key;
        return filters.projects.includes(projectKey);
      });

      console.log(
        `✅ Filtered to ${filteredIssues.length} issues from ${filters.projects.length} projects`
      );
    }

    // Filtrar por sprints
    if (filters.sprints.length > 0) {
      filteredIssues = filteredIssues.filter(
        issue =>
          issue.fields.sprint &&
          filters.sprints.includes(issue.fields.sprint.id.toString())
      );
    }

    // Filtrar por tipos de issue
    if (filters.issueTypes.length > 0) {
      filteredIssues = filteredIssues.filter((issue : any) =>
        filters.issueTypes.includes(issue.fields.issuetype.name)
      );
    }

    // Filtrar por status
    if (filters.statuses.length > 0) {
      filteredIssues = filteredIssues.filter((issue : any) =>
        filters.statuses.includes(issue.fields.status.name)
      );
    }

    // Filtrar por assignees
    if (filters.assignees.length > 0) {
      filteredIssues = filteredIssues.filter(
        issue =>
          issue.fields.assignee &&
          filters.assignees.includes(issue.fields.assignee.displayName)
      );
    }

    // Filtrar por prioridades
    if (filters.priorities.length > 0) {
      filteredIssues = filteredIssues.filter((issue : any) =>
        filters.priorities.includes(issue.fields.priority.name)
      );
    }

    // Filtrar por data
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredIssues = filteredIssues.filter((issue : any) => {
        const issueDate = new Date(issue.fields.created);
        return issueDate >= startDate && issueDate <= endDate;
      });
    }

    console.log('🔍 Dashboard Filtering:', {
      originalCount: issues.length,
      filteredCount: filteredIssues.length,
      activeFilters: {
        projects: filters.projects,
        sprints: filters.sprints,
        issueTypes: filters.issueTypes,
        statuses: filters.statuses,
        assignees: filters.assignees,
        priorities: filters.priorities,
        dateRange:
          filters.dateRange.start && filters.dateRange.end
            ? 'active'
            : 'inactive',
      },
      sampleFilteredIssues: filteredIssues.slice(0, 3).map((issue : any) => ({
        key: issue.key,
        project: issue.fields.project.key,
        projectName: issue.fields.project.name,
        status: issue.fields.status.name,
      })),
      allProjectKeys: issues.map((issue : any) => issue.fields.project.key),
    });

    return { projects, sprints, issues: filteredIssues };
  }, [projects, sprints, issues, filters]);

  // Memoizar dados para evitar re-renderizações desnecessárias
  const data = useMemo(() => filteredData, [filteredData]);

  const handleRefresh = async () => {
    await refetch();
  };

  // Removed duplicate error handling - already handled above

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando dados do Jira..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum Dado Disponível
          </h2>
          <p className="text-gray-600">
            Não foi possível carregar os dados do dashboard
          </p>
        </div>
      </div>
    );
  }

  // Debug: Log filtered data
  console.log('🔍 Dashboard Filtered Data:', {
    totalIssues: data.issues.length,
    totalProjects: data.projects.length,
    totalSprints: data.sprints.length,
    activeFilters: {
      projects: filters.projects.length,
      statuses: filters.statuses.length,
      issueTypes: filters.issueTypes.length,
      assignees: filters.assignees.length,
      priorities: filters.priorities.length,
    },
  });

  // Transform data for charts using FILTERED data
  const issuesByStatus = DataTransformService.getIssuesByStatus(
    filteredData.issues
  );
  const issuesByType = DataTransformService.getIssuesByType(
    filteredData.issues
  );
  const issuesByUser = DataTransformService.getIssuesByUser(
    filteredData.issues
  );
  const recentActivity = DataTransformService.getRecentActivity(
    filteredData.issues
  );
  const activeSprint = filteredData.sprints.find(
    sprint => sprint.state === 'active'
  );

  // Generate velocity data using FILTERED data
  const velocityData = DataTransformService.generateVelocityData(
    filteredData.issues,
    filteredData.sprints
  );

  // Generate burndown data if there's an active sprint using FILTERED data
  const burndownData = activeSprint
    ? DataTransformService.generateBurndownData(
        filteredData.issues,
        activeSprint
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logout */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        lastUpdated={new Date()}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Data Source Indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Dados Reais do Jira
          </div>
          <span className="text-xs text-gray-500">
            {issues?.length || 0} issues • {projects?.length || 0} projetos
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                {getFilterSummary()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="text-xs"
            >
              📊 Análises
              {data.issues.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {data.issues.length}
                </Badge>
              )}
            </Button>
            <NotificationCenter />
            <AutoRefreshControls />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className="text-xs"
            >
              Filtros Avançados
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <MetricsCard
            metric={{
              title: 'Total Issues',
              value: data.issues.length,
              color: 'text-primary',
            }}
            loading={isLoading}
          />
          <MetricsCard
            metric={{
              title: 'Projetos',
              value: data.projects.length,
              color: 'text-primary',
            }}
            loading={isLoading}
          />
          <MetricsCard
            metric={{
              title: 'Sprints',
              value: data.sprints.length,
              color: 'text-primary',
            }}
            loading={isLoading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <IssuesByStatus
              data={issuesByStatus}
              loading={isLoading}
              allIssues={data.issues}
            />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <IssuesByType
              data={issuesByType}
              loading={isLoading}
              allIssues={data.issues}
            />
          </Suspense>
        </div>

        {/* User Chart */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <IssuesByUser
              data={issuesByUser}
              loading={isLoading}
              allIssues={data.issues}
            />
          </Suspense>
        </div>

        {/* Sprint and Velocity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {activeSprint && (
            <Suspense fallback={<LoadingSpinner />}>
              <SprintProgress sprint={activeSprint} loading={isLoading} />
            </Suspense>
          )}
          <Suspense fallback={<LoadingSpinner />}>
            <TeamVelocity data={velocityData} loading={isLoading} />
          </Suspense>
        </div>

        {/* Burndown Chart */}
        {burndownData.length > 0 && (
          <div className="mb-8">
            <Suspense fallback={<LoadingSpinner />}>
              <BurndownChart data={burndownData} loading={isLoading} />
            </Suspense>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <RecentActivity issues={recentActivity} loading={isLoading} />
          </Suspense>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        isOpen={isAdvancedFilterOpen}
        onToggle={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
        projects={projects}
      />

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        connectionStatus={connectionStatus}
        lastMessage={lastMessage}
        onReconnect={reconnect}
        className="fixed bottom-4 right-4 w-80"
      />
    </div>
  );
});

export default Dashboard;

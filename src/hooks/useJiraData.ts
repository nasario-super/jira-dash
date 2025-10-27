import { useState, useEffect, useCallback } from 'react';
import {
  JiraIssue,
  SprintData,
  DashboardData,
  FilterState,
} from '../types/jira.types';
import { useJiraApi } from './useJiraApi';
import {
  useIssuesQuery,
  useBoardsQuery,
  useProjectsQuery,
} from './useJiraQueries';
import { DataTransformService } from '../services/dataTransform';
import { projectAccessService } from '../services/projectAccessService';
import { useProjectAccess } from './useProjectAccess';

interface UseJiraDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isConnected: boolean;
  isDiscovering: boolean;
  discoveryInfo: any;
  forceRediscovery: () => Promise<void>;
}

export const useJiraData = (filters?: FilterState): UseJiraDataReturn => {
  const jiraApi = useJiraApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Usar hook de acesso a projetos para garantir inicialização
  const {
    isReady: projectAccessReady,
    userProjects,
    userEmail,
    isDiscovering,
    discoveryInfo,
    forceRediscovery,
  } = useProjectAccess();

  // Usar hooks mais robustos para buscar dados
  const issuesQuery = useIssuesQuery();
  const boardsQuery = useBoardsQuery();
  const projectsQuery = useProjectsQuery();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Aguardar inicialização do serviço de acesso a projetos
      if (!projectAccessReady) {
        console.log(
          '🔐 useJiraData - Waiting for project access service to be ready...'
        );
        return;
      }

      console.log('🔐 useJiraData - Project access service ready:', {
        userEmail,
        userProjects,
        isReady: projectAccessReady,
      });

      // Usar dados dos hooks mais robustos
      const issuesData = issuesQuery.data || [];
      const boardsData = boardsQuery.data || [];
      const projectsData = projectsQuery.data || [];

      console.log('🔍 useJiraData - Using robust hooks data:', {
        issues: issuesData.length,
        boards: boardsData.length,
        projects: projectsData.length,
        issuesLoading: issuesQuery.isLoading,
        boardsLoading: boardsQuery.isLoading,
        projectsLoading: projectsQuery.isLoading,
        issuesError: issuesQuery.error,
        issuesSample: issuesData.slice(0, 3).map(issue => ({
          key: issue.key,
          status: issue.fields.status.name,
          type: issue.fields.issuetype.name,
        })),
      });

      // Se não há dados ainda, não processar
      if (issuesData.length === 0 && !issuesQuery.isLoading) {
        console.log('🔍 useJiraData - No issues data available yet');
        setLoading(false);
        return;
      }

      // Usar sprints mockados para simplificar
      const sprintsData: SprintData[] = [
        {
          id: 1,
          name: 'Sprint 1',
          state: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          boardId: 1,
        },
      ];

      // Apply filters if provided
      let filteredIssues = issuesData;
      if (filters) {
        filteredIssues = DataTransformService.filterIssues(issuesData, {
          projects: filters.projects,
          statuses: filters.statuses,
          types: filters.issueTypes,
          assignees: filters.assignees,
          priorities: filters.priorities,
          dateRange: filters.dateRange,
        });
      }

      // Transform data
      const metrics = DataTransformService.getMetricsCards(
        filteredIssues,
        sprintsData
      );
      const dashboardData: DashboardData = {
        issues: filteredIssues,
        sprints: sprintsData,
        boards: boardsData,
        projects: projectsData,
        metrics: {
          totalOpen: metrics[0].value as number,
          totalClosed: metrics[1].value as number,
          completionRate: parseInt(metrics[2].value as string),
          averageResolutionTime: metrics[3].value as number,
          currentVelocity: metrics[4].value as number,
          overdueIssues: metrics[5].value as number,
        },
      };

      setData(dashboardData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao buscar dados';
      setError(errorMessage);
      console.error('Error fetching Jira data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Reagir aos dados dos hooks
    const hasData = issuesQuery.data || boardsQuery.data || projectsQuery.data;
    const isLoading =
      issuesQuery.isLoading || boardsQuery.isLoading || projectsQuery.isLoading;

    console.log('🔍 useJiraData - useEffect triggered:', {
      hasData: !!hasData,
      isLoading,
      projectAccessReady,
      userEmail,
      userProjects,
      issuesData: issuesQuery.data?.length || 0,
      boardsData: boardsQuery.data?.length || 0,
      projectsData: projectsQuery.data?.length || 0,
    });

    if (hasData && !isLoading && projectAccessReady) {
      fetchData();
    }
  }, [
    issuesQuery.data,
    boardsQuery.data,
    projectsQuery.data,
    issuesQuery.isLoading,
    boardsQuery.isLoading,
    projectsQuery.isLoading,
    projectAccessReady,
    userEmail,
    userProjects,
    fetchData,
  ]);

  return {
    data,
    loading,
    error,
    refetch,
    isConnected,
    isDiscovering,
    discoveryInfo,
    forceRediscovery,
  };
};

export const useJiraConnection = () => {
  const jiraApi = useJiraApi();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const connected = await jiraApi.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [jiraApi]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    checkConnection,
  };
};

export const useSprintData = (sprintId?: number) => {
  const jiraApi = useJiraApi();
  const [sprintIssues, setSprintIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSprintIssues = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        const issues = await jiraApi.getSprintIssues(id);
        setSprintIssues(issues);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao buscar issues da sprint';
        setError(errorMessage);
        console.error('Error fetching sprint issues:', err);
      } finally {
        setLoading(false);
      }
    },
    [jiraApi]
  );

  useEffect(() => {
    if (sprintId) {
      fetchSprintIssues(sprintId);
    }
  }, [sprintId, fetchSprintIssues]);

  return {
    sprintIssues,
    loading,
    error,
    refetch: () => sprintId && fetchSprintIssues(sprintId),
  };
};

export default useJiraData;

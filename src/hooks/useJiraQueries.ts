import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../stores/authStore';
import { useJiraStore } from '../stores/jiraStore';
import { JiraApiService } from '../services/jiraApi';
import { JiraApiRealService } from '../services/jiraApiReal';
import { JiraApiConfig } from '../types/jira.types';
import { TTLCache, PERFORMANCE_CONSTANTS } from '../lib/performance';

// Global cache instance
const globalCache = new TTLCache<string, any>(PERFORMANCE_CONSTANTS.CACHE_TTL);

// Query Keys
export const queryKeys = {
  projects: ['jira', 'projects'] as const,
  sprints: ['jira', 'sprints'] as const,
  issues: ['jira', 'issues'] as const,
  boards: ['jira', 'boards'] as const,
  myself: ['jira', 'myself'] as const,
} as const;

// Optimized query options
const defaultQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 1,
  retryDelay: 1000,
};

// Hook para buscar projetos
export const useProjectsQuery = () => {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.projects, credentials?.domain],
    queryFn: async () => {
      if (!credentials) throw new Error('Credenciais não encontradas');

      // Check cache first
      const cacheKey = `projects_${credentials.domain}`;
      const cached = globalCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const api = new JiraApiService(credentials);
      const result = await api.getProjects();

      // Cache the result
      globalCache.set(cacheKey, result);
      return result;
    },
    enabled: !!credentials,
    ...defaultQueryOptions,
    staleTime: 10 * 60 * 1000, // 10 minutos para projetos
  });
};

// Hook para buscar sprints
export const useSprintsQuery = () => {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.sprints, credentials?.domain],
    queryFn: async () => {
      if (!credentials) throw new Error('Credenciais não encontradas');
      const api = new JiraApiService(credentials);
      return await api.getSprints(1);
    },
    enabled: !!credentials,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Tenta novamente em caso de erro
  });
};

// Hook para buscar issues (SEM filtros - deixa o Dashboard filtrar)
export const useIssuesQuery = () => {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.issues, credentials?.domain],
    queryFn: async () => {
      if (!credentials) throw new Error('Credenciais não encontradas');

      console.log('🔍 useIssuesQuery: Fetching ALL issues (no filters)');

      // Check cache first (sem filtros na chave)
      const cacheKey = `issues_${credentials.domain}`;
      const cached = globalCache.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached issues:', cached.length);
        return cached;
      }

      // Try real API service first
      try {
        console.log('🔍 Trying real API service...');
        const api = new JiraApiRealService(credentials);
        const result = await api.getAllIssues();

        console.log(`✅ Real API service returned ${result.length} issues`);

        if (result.length > 0) {
          // Cache the UNFILTERED result
          globalCache.set(cacheKey, result);
          return result;
        }
      } catch (realError: any) {
        console.warn('⚠️ Real API service failed:', realError.message);
      }

      // Fallback to original API service
      try {
        console.log('🔍 Falling back to original API service...');
        const api = new JiraApiService(credentials);
        const result = await api.getAllIssues();

        // Cache the UNFILTERED result
        globalCache.set(cacheKey, result);
        return result;
      } catch (originalError: any) {
        console.error('❌ Both API services failed:', originalError.message);
        return [];
      }
    },
    enabled: !!credentials,
    ...defaultQueryOptions,
    staleTime: 10 * 60 * 1000, // 10 minutos para issues
    retry: 1,
  });
};

// Hook para buscar boards
export const useBoardsQuery = () => {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.boards, credentials?.domain],
    queryFn: async () => {
      if (!credentials) throw new Error('Credenciais não encontradas');
      const api = new JiraApiService(credentials);
      return await api.getBoards();
    },
    enabled: !!credentials,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1, // Tenta novamente em caso de erro
  });
};

// Hook para testar conexão
export const useTestConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: JiraApiConfig) => {
      console.log('useTestConnectionMutation: Starting connection test...');
      const api = new JiraApiService(credentials);
      const result = await api.testConnection();
      console.log('useTestConnectionMutation: Connection test result:', result);
      return result;
    },
    onSuccess: result => {
      console.log(
        'useTestConnectionMutation: onSuccess called with result:',
        result
      );
      // Invalidar todas as queries relacionadas ao Jira
      queryClient.invalidateQueries({ queryKey: ['jira'] });
    },
    onError: error => {
      console.error(
        'useTestConnectionMutation: onError called with error:',
        error
      );
    },
  });
};

// Hook para buscar dados do usuário
export const useMyselfQuery = () => {
  const { credentials } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.myself, credentials?.domain],
    queryFn: async () => {
      if (!credentials) throw new Error('Credenciais não encontradas');
      const api = new JiraApiService(credentials);
      return await api.getMyself();
    },
    enabled: !!credentials,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para buscar todos os dados do dashboard
export const useDashboardData = () => {
  const projectsQuery = useProjectsQuery();
  const sprintsQuery = useSprintsQuery();
  const issuesQuery = useIssuesQuery();
  const boardsQuery = useBoardsQuery();
  const myselfQuery = useMyselfQuery();

  const isLoading =
    projectsQuery.isLoading ||
    sprintsQuery.isLoading ||
    issuesQuery.isLoading ||
    boardsQuery.isLoading ||
    myselfQuery.isLoading;

  const error =
    projectsQuery.error ||
    sprintsQuery.error ||
    issuesQuery.error ||
    boardsQuery.error ||
    myselfQuery.error;

  // Debug logs
  console.log('🔍 useDashboardData Debug:', {
    projects: {
      isLoading: projectsQuery.isLoading,
      error: projectsQuery.error,
      data: projectsQuery.data?.length || 0,
    },
    sprints: {
      isLoading: sprintsQuery.isLoading,
      error: sprintsQuery.error,
      data: sprintsQuery.data?.length || 0,
    },
    issues: {
      isLoading: issuesQuery.isLoading,
      error: issuesQuery.error,
      data: issuesQuery.data?.length || 0,
    },
    boards: {
      isLoading: boardsQuery.isLoading,
      error: boardsQuery.error,
      data: boardsQuery.data?.length || 0,
    },
    myself: {
      isLoading: myselfQuery.isLoading,
      error: myselfQuery.error,
      data: !!myselfQuery.data,
    },
    overallError: error?.message || 'No error',
  });

  return {
    projects: projectsQuery.data || [],
    sprints: sprintsQuery.data || [],
    issues: issuesQuery.data || [],
    boards: boardsQuery.data || [],
    myself: myselfQuery.data,
    isLoading,
    error,
    refetch: () => {
      projectsQuery.refetch();
      sprintsQuery.refetch();
      issuesQuery.refetch();
      boardsQuery.refetch();
      myselfQuery.refetch();
    },
  };
};

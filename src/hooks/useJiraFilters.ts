import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FilterState,
  FilterOptions,
  FilteredData,
} from '../types/filters.types';
import {
  loadFilterOptions,
  fetchFilteredData,
} from '../services/filterService';
import { projectAccessService } from '../services/projectAccessService';
import { useAuth } from '../stores/authStore';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useJiraFilters() {
  const [filters, setFilters] = useState<FilterState>({
    projects: [],
    dateRange: { start: null, end: null },
    sprints: [],
    issueTypes: [],
    statuses: [],
    assignees: [],
    priorities: [],
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [data, setData] = useState<FilteredData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ OBTER CREDENCIAIS DO USUÁRIO
  const { credentials } = useAuth();

  // Carregar opções de filtros na montagem
  useEffect(() => {
    console.log('🔍 Loading filter options on mount...');

    // ✅ VERIFICAR SE CREDENCIAIS ESTÃO DISPONÍVEIS
    if (!credentials) {
      console.warn('⚠️ No credentials available yet');
      return;
    }

    // ✅ PASSAR CREDENCIAIS DO USUÁRIO
    loadFilterOptions(credentials)
      .then(options => {
        console.log('✅ Filter options loaded successfully:', options);
        setFilterOptions(options);
      })
      .catch(err => {
        console.error('❌ Error loading filter options:', err);
        setError(err.message);
        // Continuar mesmo se as opções falharem
        console.log('⚠️ Continuing without filter options...');
      });
  }, [credentials]);

  // Função debounced para buscar dados
  const debouncedFetch = useMemo(
    () =>
      debounce(async (currentFilters: FilterState) => {
        console.log('🔍 useJiraFilters - Starting data fetch:', {
          filters: currentFilters,
          projectAccessInitialized: projectAccessService.isInitialized(),
          userProjects: projectAccessService.getUserProjects(),
        });

        // Verificar se há projetos selecionados antes de buscar dados
        if (
          !projectAccessService.isInitialized() ||
          projectAccessService.getUserProjects().length === 0
        ) {
          console.log(
            '🔍 useJiraFilters - No projects selected, skipping data fetch'
          );
          setData({ issues: [], total: 0, fetched: 0 });
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          // ✅ PASSAR CREDENCIAIS DO USUÁRIO
          const rawResult = await fetchFilteredData(
            currentFilters,
            credentials!
          );
          console.log('🔍 Raw data fetched:', {
            issues: rawResult.issues.length,
            total: rawResult.total,
            fetched: rawResult.fetched,
          });

          // NÃO aplicar filtragem aqui - deixar para o useSecureJiraData
          // A filtragem será aplicada no useSecureJiraData para evitar dupla filtragem
          setData(rawResult);
          console.log(
            '✅ Raw data set (filtering will be applied in useSecureJiraData):',
            {
              originalIssues: rawResult.issues.length,
              total: rawResult.total,
              fetched: rawResult.fetched,
              userProjects: projectAccessService.getUserProjects(),
              isInitialized: projectAccessService.isInitialized(),
            }
          );
        } catch (err: any) {
          console.error('❌ Error fetching filtered data:', err);
          setError(err.message);
          setData(null);
        } finally {
          setLoading(false);
        }
      }, 800), // 800ms de debounce
    []
  );

  // Buscar dados sempre que filtros mudarem
  useEffect(() => {
    console.log('🔄 Filters changed, triggering debounced fetch...');
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  // Buscar dados iniciais mesmo sem filtros
  useEffect(() => {
    console.log('🚀 Initial data fetch (no filters)...');
    debouncedFetch(filters);
  }, [debouncedFetch]);

  // Atualizar filtro individual
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    console.log(`🔧 Updating filter ${key}:`, value);
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters');
    setFilters({
      projects: [],
      dateRange: { start: null, end: null },
      sprints: [],
      issueTypes: [],
      statuses: [],
      assignees: [],
      priorities: [],
    });
  }, []);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.projects.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.sprints.length > 0) count++;
    if (filters.issueTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    return count;
  }, [filters]);

  // Verificar se há filtros ativos
  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    filterOptions,
    data,
    loading,
    error,
    updateFilter,
    clearAllFilters,
    activeFiltersCount,
    hasActiveFilters,
  };
}

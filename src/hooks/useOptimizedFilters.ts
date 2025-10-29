// @ts-nocheck
import { useState, useCallback, useMemo } from 'react';
import { useJiraStore } from '../stores/jiraStore';
import { debounce, PERFORMANCE_CONSTANTS } from '../lib/performance';
import { FilterState } from '../types/jira.types';

export interface OptimizedFilterState extends FilterState {
  searchTerm: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export const useOptimizedFilters = (projects: any[] = []) => {
  const { filters, setFilters } = useJiraStore();

  const updateFilters = (newFilters: FilterState) => {
    console.log('🔄 Updating filters:', newFilters);
    setIsFiltering(true);
    setFilters(newFilters);
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 300);
  };

  const resetFilters = () => {
    setFilters({
      projects: [],
      sprints: [],
      issueTypes: [],
      statuses: [],
      assignees: [],
      priorities: [],
      dateRange: {
        start: '',
        end: '',
      },
    });
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      updateFilters({ ...filters, searchTerm: term });
      setIsFiltering(false);
    }, PERFORMANCE_CONSTANTS.DEBOUNCE_DELAY),
    [filters, updateFilters]
  );

  // Handle search input
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setIsFiltering(true);
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  // Memoized filter options
  const filterOptions = useMemo(
    () => ({
      projects: [
        { value: 'all', label: 'Todos os Projetos' },
        ...projects.map(project => ({
          value: project.key,
          label: project.name,
        })),
      ],
      statuses: [
        { value: 'all', label: 'Todos os Status' },
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Done', label: 'Done' },
      ],
      types: [
        { value: 'all', label: 'Todos os Tipos' },
        { value: 'Story', label: 'Story' },
        { value: 'Task', label: 'Task' },
        { value: 'Bug', label: 'Bug' },
      ],
      priorities: [
        { value: 'all', label: 'Todas as Prioridades' },
        { value: 'Highest', label: 'Highest' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
      ],
    }),
    [projects]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.projects.length > 0 ||
      filters.sprints.length > 0 ||
      filters.issueTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.assignees.length > 0 ||
      filters.priorities.length > 0 ||
      searchTerm.length > 0
    );
  }, [filters, searchTerm]);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const activeFilters = [];

    if (filters.projects.length > 0) {
      activeFilters.push(`${filters.projects.length} projeto(s)`);
    }
    if (filters.statuses.length > 0) {
      activeFilters.push(`${filters.statuses.length} status`);
    }
    if (filters.issueTypes.length > 0) {
      activeFilters.push(`${filters.issueTypes.length} tipo(s)`);
    }
    if (searchTerm.length > 0) {
      activeFilters.push(`busca: "${searchTerm}"`);
    }

    return activeFilters.join(', ');
  }, [filters, searchTerm]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    resetFilters();
  }, [resetFilters]);

  // Apply filter preset
  const applyFilterPreset = useCallback(
    (preset: string) => {
      switch (preset) {
        case 'active':
          updateFilters({
            ...filters,
            statuses: ['In Progress', 'To Do'],
            priorities: ['Highest', 'High'],
          });
          break;
        case 'completed':
          updateFilters({
            ...filters,
            statuses: ['Done'],
            issueTypes: ['Story', 'Task'],
          });
          break;
        case 'bugs':
          updateFilters({
            ...filters,
            issueTypes: ['Bug'],
            priorities: ['Highest', 'High'],
          });
          break;
        case 'my-issues':
          // This would need to be implemented with user context
          updateFilters({
            ...filters,
            assignees: ['current-user'],
          });
          break;
        default:
          break;
      }
    },
    [filters, updateFilters]
  );

  // Save filter preset
  const saveFilterPreset = useCallback(
    (name: string) => {
      const presets = JSON.parse(
        localStorage.getItem('jira-filter-presets') || '{}'
      );
      presets[name] = {
        filters,
        searchTerm,
        timestamp: Date.now(),
      };
      localStorage.setItem('jira-filter-presets', JSON.stringify(presets));
    },
    [filters, searchTerm]
  );

  // Load filter preset
  const loadFilterPreset = useCallback(
    (name: string) => {
      const presets = JSON.parse(
        localStorage.getItem('jira-filter-presets') || '{}'
      );
      const preset = presets[name];
      if (preset) {
        updateFilters(preset.filters);
        setSearchTerm(preset.searchTerm || '');
      }
    },
    [updateFilters]
  );

  // Get saved presets
  const getSavedPresets = useCallback(() => {
    const presets = JSON.parse(
      localStorage.getItem('jira-filter-presets') || '{}'
    );
    return Object.keys(presets).map(name => ({
      name,
      timestamp: presets[name].timestamp,
    }));
  }, []);

  return {
    filters,
    searchTerm,
    isFiltering,
    filterOptions,
    hasActiveFilters,
    getFilterSummary,
    handleSearchChange,
    updateFilters,
    clearAllFilters,
    applyFilterPreset,
    saveFilterPreset,
    loadFilterPreset,
    getSavedPresets,
  };
};

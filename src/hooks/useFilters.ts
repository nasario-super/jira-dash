import { useState, useCallback, useMemo } from 'react';
import { FilterState } from '../types/jira.types';

interface UseFiltersReturn {
  filters: FilterState;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  getFilterSummary: () => string;
}

const initialFilters: FilterState = {
  projects: [],
  sprints: [],
  issueTypes: [],
  statuses: [],
  assignees: [],
  dateRange: {
    start: '',
    end: ''
  },
  priorities: []
};

export const useFilters = (): UseFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.projects.length > 0 ||
      filters.sprints.length > 0 ||
      filters.issueTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.assignees.length > 0 ||
      filters.priorities.length > 0 ||
      (filters.dateRange.start !== '' && filters.dateRange.end !== '')
    );
  }, [filters]);

  const getFilterSummary = useCallback(() => {
    const activeFilters: string[] = [];

    if (filters.projects.length > 0) {
      activeFilters.push(`${filters.projects.length} projeto(s)`);
    }

    if (filters.sprints.length > 0) {
      activeFilters.push(`${filters.sprints.length} sprint(s)`);
    }

    if (filters.issueTypes.length > 0) {
      activeFilters.push(`${filters.issueTypes.length} tipo(s)`);
    }

    if (filters.statuses.length > 0) {
      activeFilters.push(`${filters.statuses.length} status(es)`);
    }

    if (filters.assignees.length > 0) {
      activeFilters.push(`${filters.assignees.length} responsável(is)`);
    }

    if (filters.priorities.length > 0) {
      activeFilters.push(`${filters.priorities.length} prioridade(s)`);
    }

    if (filters.dateRange.start !== '' && filters.dateRange.end !== '') {
      activeFilters.push('período específico');
    }

    return activeFilters.length > 0 
      ? `Filtros ativos: ${activeFilters.join(', ')}`
      : 'Nenhum filtro ativo';
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    getFilterSummary
  };
};

export const useFilterOptions = (data: any) => {
  const projectOptions = useMemo(() => {
    if (!data?.projects) return [];
    return data.projects.map((project: any) => ({
      value: project.key,
      label: project.name
    }));
  }, [data?.projects]);

  const sprintOptions = useMemo(() => {
    if (!data?.sprints) return [];
    return data.sprints
      .filter((sprint: any) => sprint.state === 'active' || sprint.state === 'closed')
      .map((sprint: any) => ({
        value: sprint.id.toString(),
        label: sprint.name
      }));
  }, [data?.sprints]);

  const issueTypeOptions = useMemo(() => {
    if (!data?.issues) return [];
    const types = [...new Set(data.issues.map((issue: any) => issue.fields.issuetype.name))] as string[];
    return types.map((type: string) => ({
      value: type,
      label: type
    }));
  }, [data?.issues]);

  const statusOptions = useMemo(() => {
    if (!data?.issues) return [];
    const statuses = [...new Set(data.issues.map((issue: any) => issue.fields.status.name))] as string[];
    return statuses.map((status: string) => ({
      value: status,
      label: status
    }));
  }, [data?.issues]);

  const assigneeOptions = useMemo(() => {
    if (!data?.issues) return [];
    const assignees = [...new Set(
      data.issues
        .map((issue: any) => issue.fields.assignee?.displayName)
        .filter(Boolean)
    )] as string[];
    return assignees.map((assignee: string) => ({
      value: assignee,
      label: assignee
    }));
  }, [data?.issues]);

  const priorityOptions = useMemo(() => {
    if (!data?.issues) return [];
    const priorities = [...new Set(data.issues.map((issue: any) => issue.fields.priority.name))] as string[];
    return priorities.map((priority: string) => ({
      value: priority,
      label: priority
    }));
  }, [data?.issues]);

  return {
    projectOptions,
    sprintOptions,
    issueTypeOptions,
    statusOptions,
    assigneeOptions,
    priorityOptions
  };
};

export default useFilters;

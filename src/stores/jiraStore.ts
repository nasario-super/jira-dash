import { create } from 'zustand';
import {
  JiraIssue,
  JiraSprint,
  ProjectData,
  FilterState,
} from '../types/jira.types';

interface JiraState {
  // Data
  issues: JiraIssue[];
  sprints: JiraSprint[];
  projects: ProjectData[];

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters
  filters: FilterState;

  // Actions
  setIssues: (issues: JiraIssue[]) => void;
  setSprints: (sprints: JiraSprint[]) => void;
  setProjects: (projects: ProjectData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearData: () => void;
}

export const useJiraStore = create<JiraState>((set, get) => ({
  // Initial state
  issues: [],
  sprints: [],
  projects: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  filters: {
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
  },

  // Actions
  setIssues: issues => set({ issues }),
  setSprints: sprints => set({ sprints }),
  setProjects: projects => set({ projects }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  setLastUpdated: lastUpdated => set({ lastUpdated }),

  setFilters: newFilters =>
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearData: () =>
    set({
      issues: [],
      sprints: [],
      projects: [],
      error: null,
      lastUpdated: null,
    }),
}));

// Selectors para performance
export const useIssues = () => useJiraStore(state => state.issues);
export const useSprints = () => useJiraStore(state => state.sprints);
export const useProjects = () => useJiraStore(state => state.projects);
export const useJiraLoading = () => useJiraStore(state => state.isLoading);
export const useJiraError = () => useJiraStore(state => state.error);
export const useJiraFilters = () => useJiraStore(state => state.filters);

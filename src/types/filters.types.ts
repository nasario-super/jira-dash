// Interfaces para sistema de filtros dinâmicos
export interface FilterState {
  projects: string[]; // Ex: ["PROJ", "ALPHA", "BETA"]
  dateRange: {
    start: string | null; // ISO: "2025-01-01"
    end: string | null; // ISO: "2025-12-31"
  };
  sprints: number[]; // IDs numéricos: [123, 124, 125]
  issueTypes: string[]; // Ex: ["Story", "Bug", "Task"]
  statuses: string[]; // Ex: ["To Do", "In Progress", "Done"]
  assignees: string[]; // Account IDs do Jira
  priorities: string[]; // Ex: ["Highest", "High", "Medium"]
}

export interface FilterOptions {
  projects: Array<{ key: string; name: string }>;
  sprints: Array<{ id: number; name: string; state: string }>;
  issueTypes: Array<{ name: string; iconUrl: string }>;
  statuses: Array<{ name: string; category: string }>;
  assignees: Array<{
    accountId: string;
    displayName: string;
    avatarUrl: string;
  }>;
  priorities: Array<{ name: string; iconUrl: string }>;
}

export interface FilteredData {
  issues: any[];
  total: number;
  fetched: number;
}

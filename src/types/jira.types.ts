export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        name: string;
        colorName: string;
      };
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    priority: {
      name: string;
      iconUrl: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
      avatarUrls: {
        '48x48': string;
      };
    } | null;
    created: string;
    updated: string;
    duedate: string | null;
    customfield_10016?: number; // Story points
    labels: string[];
    project: {
      id: string;
      key: string;
      name: string;
    };
    sprint?: {
      id: number;
      name: string;
      state: string;
    };
  };
}

export interface SprintData {
  id: number;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate: string;
  endDate: string;
  completeDate?: string;
  originBoardId: number;
}

export interface BoardData {
  id: number;
  name: string;
  type: string;
  location: {
    projectName: string;
    projectKey: string;
  };
}

export interface ProjectData {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    '48x48': string;
  };
}

export interface MetricCard {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export interface FilterState {
  projects: string[];
  sprints: string[];
  issueTypes: string[];
  statuses: string[];
  assignees: string[];
  dateRange: {
    start: string;
    end: string;
  };
  priorities: string[];
}

export interface DashboardData {
  issues: JiraIssue[];
  sprints: SprintData[];
  boards: BoardData[];
  projects: ProjectData[];
  metrics: {
    totalOpen: number;
    totalClosed: number;
    completionRate: number;
    averageResolutionTime: number;
    currentVelocity: number;
    overdueIssues: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

export interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
  velocity: number;
}

export interface ApiResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export interface JiraApiConfig {
  domain: string;
  email: string;
  apiToken: string;
}


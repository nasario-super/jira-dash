import { JiraIssue } from '../types/jira.types';

export const calculateVelocity = (issues: JiraIssue[]): number => {
  const completedIssues = issues.filter(issue =>
    ['Done', 'Cancelled'].includes(issue.fields.status.name)
  );

  return completedIssues.reduce((total, issue) => {
    return total + (issue.fields.customfield_10016 || 0);
  }, 0);
};

export const calculateCompletionRate = (issues: JiraIssue[]): number => {
  const total = issues.length;
  if (total === 0) return 0;

  const completed = issues.filter(issue =>
    ['Done', 'Cancelled'].includes(issue.fields.status.name)
  ).length;

  return Math.round((completed / total) * 100);
};

export const calculateAverageResolutionTime = (issues: JiraIssue[]): number => {
  const completedIssues = issues.filter(
    issue => issue.fields.status.name === 'Done'
  );

  if (completedIssues.length === 0) return 0;

  const totalDays = completedIssues.reduce((total, issue) => {
    const created = new Date(issue.fields.created);
    const updated = new Date(issue.fields.updated);
    const diffTime = updated.getTime() - created.getTime();
    return total + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, 0);

  return Math.round(totalDays / completedIssues.length);
};

export const calculateSprintProgress = (issues: JiraIssue[]): number => {
  const totalStoryPoints = issues.reduce(
    (total, issue) => total + (issue.fields.customfield_10016 || 0),
    0
  );

  if (totalStoryPoints === 0) return 0;

  const completedStoryPoints = issues
    .filter(issue => ['Done', 'Cancelled'].includes(issue.fields.status.name))
    .reduce((total, issue) => total + (issue.fields.customfield_10016 || 0), 0);

  return Math.round((completedStoryPoints / totalStoryPoints) * 100);
};

export const getOverdueIssues = (issues: JiraIssue[]): JiraIssue[] => {
  const now = new Date();
  return issues.filter(issue => {
    if (!issue.fields.duedate) return false;
    const dueDate = new Date(issue.fields.duedate);
    return (
      dueDate < now && !['Done', 'Cancelled'].includes(issue.fields.status.name)
    );
  });
};

export const getCriticalIssues = (issues: JiraIssue[]): JiraIssue[] => {
  return issues.filter(
    issue =>
      ['Highest', 'High'].includes(issue.fields.priority.name) &&
      !['Done', 'Cancelled'].includes(issue.fields.status.name)
  );
};

export const getIssuesByAssignee = (issues: JiraIssue[]) => {
  const assigneeStats = issues.reduce((acc, issue) => {
    const assignee = issue.fields.assignee?.displayName || 'Não atribuído';

    if (!acc[assignee]) {
      acc[assignee] = {
        total: 0,
        completed: 0,
        inProgress: 0,
        storyPoints: 0,
      };
    }

    acc[assignee].total++;
    acc[assignee].storyPoints += issue.fields.customfield_10016 || 0;

    if (['Done', 'Cancelled'].includes(issue.fields.status.name)) {
      acc[assignee].completed++;
    } else if (issue.fields.status.name === 'In Progress') {
      acc[assignee].inProgress++;
    }

    return acc;
  }, {} as Record<string, { total: number; completed: number; inProgress: number; storyPoints: number }>);

  return Object.entries(assigneeStats).map(([assignee, stats]) => ({
    assignee,
    ...stats,
    completionRate: Math.round((stats.completed / stats.total) * 100),
  }));
};

export const getIssuesByProject = (issues: JiraIssue[]) => {
  const projectStats = issues.reduce((acc, issue) => {
    const project = issue.fields.project.name;

    if (!acc[project]) {
      acc[project] = {
        total: 0,
        completed: 0,
        open: 0,
        storyPoints: 0,
      };
    }

    acc[project].total++;
    acc[project].storyPoints += issue.fields.customfield_10016 || 0;

    if (['Done', 'Cancelled'].includes(issue.fields.status.name)) {
      acc[project].completed++;
    } else {
      acc[project].open++;
    }

    return acc;
  }, {} as Record<string, { total: number; completed: number; open: number; storyPoints: number }>);

  return Object.entries(projectStats).map(([project, stats]) => ({
    project,
    ...stats,
    completionRate: Math.round((stats.completed / stats.total) * 100),
  }));
};

export const calculateTrend = (
  current: number,
  previous: number
): 'up' | 'down' | 'neutral' => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};

export const calculateChangePercentage = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Status padrão do Jira
    'To Do': '#6B778C',
    'In Progress': '#FFAB00',
    'In Review': '#0052CC',
    Done: '#36B37E',
    Cancelled: '#DE350B',
    Blocked: '#FF5630',

    // Status reais encontrados no Jira
    Pendente: '#F59E0B',
    'Em andamento': '#3B82F6',
    Concluído: '#10B981',
    Backlog: '#8B5CF6',
    Validation: '#06B6D4',
    Refinamento: '#EC4899',
    Development: '#84CC16',
    'Tarefas pendentes': '#F97316',
    Deploy: '#6366F1',
    'Desenvolvimento (DA)': '#14B8A6',
    'AGUARDANDO APROVAÇÃO GESTOR': '#F59E0B',
  };

  return statusColors[status] || '#6B778C';
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    Highest: '#DE350B',
    High: '#FF5630',
    Medium: '#FFAB00',
    Low: '#36B37E',
    Lowest: '#6B778C',
  };

  return priorityColors[priority] || '#6B778C';
};

export const getTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    Story: '#36B37E',
    Task: '#0052CC',
    Bug: '#DE350B',
    Epic: '#6554C0',
    Incident: '#FF5630',
  };

  return typeColors[type] || '#6B778C';
};

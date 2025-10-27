import {
  JiraIssue,
  SprintData,
  MetricCard,
  ChartData,
  BurndownData,
  VelocityData,
} from '../types/jira.types';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import UserService from './userService';

export class DataTransformService {
  // Transform issues into metrics cards
  static getMetricsCards(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): MetricCard[] {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Filter issues for current month
    const currentMonthIssues = issues.filter(issue => {
      const created = new Date(issue.fields.created);
      return created >= startOfCurrentMonth && created <= endOfCurrentMonth;
    });

    // Calculate metrics
    const totalOpen = issues.filter(
      issue => !['Done', 'Cancelled'].includes(issue.fields.status.name)
    ).length;

    const totalClosed = issues.filter(issue =>
      ['Done', 'Cancelled'].includes(issue.fields.status.name)
    ).length;

    const currentMonthClosed = currentMonthIssues.filter(issue =>
      ['Done', 'Cancelled'].includes(issue.fields.status.name)
    ).length;

    const completionRate =
      totalClosed > 0
        ? Math.round((totalClosed / (totalOpen + totalClosed)) * 100)
        : 0;

    const overdueIssues = issues.filter(issue => {
      if (!issue.fields.duedate) return false;
      const dueDate = new Date(issue.fields.duedate);
      return (
        dueDate < now &&
        !['Done', 'Cancelled'].includes(issue.fields.status.name)
      );
    }).length;

    // Calculate current velocity
    const activeSprint = sprints.find(sprint => sprint.state === 'active');
    const currentVelocity = activeSprint
      ? this.calculateSprintVelocity(issues, activeSprint.id)
      : 0;

    // Calculate average resolution time
    const averageResolutionTime = this.calculateAverageResolutionTime(issues);

    return [
      {
        title: 'Issues Abertas',
        value: totalOpen,
        color: 'text-danger',
        icon: '📋',
      },
      {
        title: 'Concluídas (Mês)',
        value: currentMonthClosed,
        color: 'text-success',
        icon: '✅',
      },
      {
        title: 'Taxa de Conclusão',
        value: `${completionRate}%`,
        color:
          completionRate >= 80
            ? 'text-success'
            : completionRate >= 60
            ? 'text-warning'
            : 'text-danger',
        icon: '📊',
      },
      {
        title: 'Tempo Médio (dias)',
        value: averageResolutionTime,
        color: 'text-primary',
        icon: '⏱️',
      },
      {
        title: 'Velocity Atual',
        value: currentVelocity,
        color: 'text-primary',
        icon: '🚀',
      },
      {
        title: 'Em Atraso',
        value: overdueIssues,
        color: overdueIssues > 0 ? 'text-danger' : 'text-success',
        icon: '⚠️',
      },
    ];
  }

  // Transform issues into status chart data
  static getIssuesByStatus(issues: JiraIssue[]): ChartData[] {
    const statusCounts = issues.reduce((acc, issue) => {
      const status = issue.fields.status.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'To Do': '#6B778C',
      'In Progress': '#FFAB00',
      'In Review': '#0052CC',
      Done: '#36B37E',
      Cancelled: '#DE350B',
      Blocked: '#FF5630',
    };

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B778C',
    }));
  }

  // Transform issues into type chart data
  static getIssuesByType(issues: JiraIssue[]): ChartData[] {
    const typeCounts = issues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      Story: '#36B37E',
      Task: '#0052CC',
      Bug: '#DE350B',
      Epic: '#6554C0',
      Incident: '#FF5630',
    };

    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B778C',
    }));
  }

  // Transform issues into priority chart data
  static getIssuesByPriority(issues: JiraIssue[]): ChartData[] {
    const priorityCounts = issues.reduce((acc, issue) => {
      const priority = issue.fields.priority.name;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      Highest: '#DE350B',
      High: '#FF5630',
      Medium: '#FFAB00',
      Low: '#36B37E',
      Lowest: '#6B778C',
    };

    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name as keyof typeof colors] || '#6B778C',
    }));
  }

  // Calculate sprint velocity
  static calculateSprintVelocity(
    issues: JiraIssue[],
    sprintId: number
  ): number {
    const sprintIssues = issues.filter(
      issue =>
        issue.fields.sprint?.id === sprintId &&
        ['Done', 'Cancelled'].includes(issue.fields.status.name)
    );

    return sprintIssues.reduce((total, issue) => {
      return total + (issue.fields.customfield_10016 || 0);
    }, 0);
  }

  // Calculate average resolution time
  static calculateAverageResolutionTime(issues: JiraIssue[]): number {
    const completedIssues = issues.filter(
      issue => issue.fields.status.name === 'Done'
    );

    if (completedIssues.length === 0) return 0;

    const totalDays = completedIssues.reduce((total, issue) => {
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      return total + differenceInDays(updated, created);
    }, 0);

    return Math.round(totalDays / completedIssues.length);
  }

  // Generate burndown data
  static generateBurndownData(
    issues: JiraIssue[],
    sprint: SprintData
  ): BurndownData[] {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = differenceInDays(endDate, startDate);
    const totalStoryPoints = issues.reduce(
      (total, issue) => total + (issue.fields.customfield_10016 || 0),
      0
    );

    const data: BurndownData[] = [];
    const idealBurnRate = totalStoryPoints / totalDays;

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const ideal = Math.max(0, totalStoryPoints - idealBurnRate * i);

      // Calculate actual remaining (simplified)
      const actual = Math.max(
        0,
        totalStoryPoints - totalStoryPoints * (i / totalDays)
      );

      data.push({
        date: format(currentDate, 'MMM dd'),
        ideal,
        actual,
        remaining: actual,
      });
    }

    return data;
  }

  // Generate velocity data for multiple sprints
  static generateVelocityData(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): VelocityData[] {
    // If no sprints, generate mock data based on issues
    if (sprints.length === 0) {
      return this.generateMockVelocityData(issues);
    }

    return sprints.slice(-6).map(sprint => {
      const sprintIssues = issues.filter(
        issue => issue.fields.sprint?.id === sprint.id
      );

      // Estimate story points based on issue type since customfield_10016 doesn't exist
      const planned = sprintIssues.reduce((total, issue) => {
        const type = issue.fields.issuetype.name;
        const points = this.estimateStoryPoints(type);
        return total + points;
      }, 0);

      const completed = sprintIssues
        .filter(issue =>
          ['Done', 'Cancelled', 'Concluído'].includes(issue.fields.status.name)
        )
        .reduce((total, issue) => {
          const type = issue.fields.issuetype.name;
          const points = this.estimateStoryPoints(type);
          return total + points;
        }, 0);

      return {
        sprint: sprint.name,
        planned,
        completed,
        velocity: completed,
      };
    });
  }

  // Generate mock velocity data when no sprints are available
  private static generateMockVelocityData(issues: JiraIssue[]): VelocityData[] {
    const completedIssues = issues.filter(issue =>
      ['Done', 'Cancelled', 'Concluído'].includes(issue.fields.status.name)
    );

    // Generate 6 mock sprints
    const mockSprints = [];
    for (let i = 5; i >= 0; i--) {
      const sprintNumber = i + 1;
      const sprintIssues = completedIssues.slice(i * 3, (i + 1) * 3);

      const planned = sprintIssues.length * 3; // Average 3 points per issue
      const completed = sprintIssues.reduce((total, issue) => {
        const type = issue.fields.issuetype.name;
        return total + this.estimateStoryPoints(type);
      }, 0);

      mockSprints.push({
        sprint: `Sprint ${sprintNumber}`,
        planned,
        completed,
        velocity: completed,
      });
    }

    return mockSprints;
  }

  // Estimate story points based on issue type
  private static estimateStoryPoints(issueType: string): number {
    switch (issueType) {
      case 'Story':
        return 3;
      case 'Task':
        return 2;
      case 'Bug':
        return 1;
      case 'Epic':
        return 8;
      case 'Subtarefa':
        return 1;
      case 'GMUD Unificada':
        return 5;
      default:
        return 2;
    }
  }

  // Get recent activity (last 20 updated issues)
  static getRecentActivity(issues: JiraIssue[]): JiraIssue[] {
    return issues
      .sort(
        (a, b) =>
          new Date(b.fields.updated).getTime() -
          new Date(a.fields.updated).getTime()
      )
      .slice(0, 20);
  }

  // Transform issues into user chart data using real users
  static getIssuesByUser(issues: JiraIssue[]): ChartData[] {
    console.log(
      '🔍 DataTransformService - getIssuesByUser called with:',
      issues.length,
      'issues'
    );

    const userService = UserService.getInstance();
    const usersData = userService.getUsersForChart(issues);

    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#06B6D4',
      '#84CC16',
      '#F97316',
      '#EC4899',
      '#6366F1',
    ];

    const chartData = usersData
      .sort((a, b) => b.value - a.value) // Sort by count descending
      .map((userData, index) => ({
        name: userData.name,
        value: userData.value,
        color: colors[index % colors.length],
        user: userData.user, // Include user object for detailed view
      }));

    console.log('✅ DataTransformService - getIssuesByUser result:', {
      totalUsers: chartData.length,
      topUsers: chartData
        .slice(0, 5)
        .map(u => ({ name: u.name, value: u.value })),
      isRealData: userService.isUsingRealData(),
    });

    return chartData;
  }

  // Get critical incidents
  static getCriticalIncidents(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(
      issue =>
        issue.fields.issuetype.name === 'Incident' &&
        ['Highest', 'High'].includes(issue.fields.priority.name) &&
        !['Done', 'Cancelled'].includes(issue.fields.status.name)
    );
  }

  // Filter issues by criteria
  static filterIssues(
    issues: JiraIssue[],
    filters: {
      projects?: string[];
      statuses?: string[];
      types?: string[];
      assignees?: string[];
      priorities?: string[];
      dateRange?: { start: string; end: string };
    }
  ): JiraIssue[] {
    return issues.filter(issue => {
      // Project filter
      if (filters.projects && filters.projects.length > 0) {
        if (!filters.projects.includes(issue.fields.project.key)) return false;
      }

      // Status filter
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(issue.fields.status.name)) return false;
      }

      // Type filter
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(issue.fields.issuetype.name)) return false;
      }

      // Assignee filter
      if (filters.assignees && filters.assignees.length > 0) {
        if (
          !issue.fields.assignee ||
          !filters.assignees.includes(issue.fields.assignee.displayName)
        ) {
          return false;
        }
      }

      // Priority filter
      if (filters.priorities && filters.priorities.length > 0) {
        if (!filters.priorities.includes(issue.fields.priority.name))
          return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const issueDate = new Date(issue.fields.created);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (issueDate < startDate || issueDate > endDate) return false;
      }

      return true;
    });
  }
}

export default DataTransformService;

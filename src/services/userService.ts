// @ts-nocheck
import { JiraIssue } from '../types/jira.types';

export interface JiraUser {
  displayName: string;
  emailAddress: string;
  accountId: string;
  avatarUrls: {
    '48x48': string;
  };
}

export interface UserStats {
  user: JiraUser;
  issueCount: number;
  completedIssues: number;
  inProgressIssues: number;
  todoIssues: number;
  averageCycleTime: number;
  lastActivity: string;
}

class UserService {
  private static instance: UserService;
  private realUsers: Map<string, JiraUser> = new Map();
  private userStats: Map<string, UserStats> = new Map();

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Extrai usuários reais dos issues do Jira
   */
  extractRealUsers(issues: JiraIssue[]): JiraUser[] {
    console.log(
      '🔍 UserService - Extracting real users from issues:',
      issues.length
    );

    const usersMap = new Map<string, JiraUser>();

    issues.forEach(issue => {
      if (issue.fields.assignee) {
        const assignee = issue.fields.assignee;
        const userKey = assignee.accountId || assignee.displayName;

        if (!usersMap.has(userKey)) {
          usersMap.set(userKey, {
            displayName: assignee.displayName,
            emailAddress:
              assignee.emailAddress ||
              `${assignee.displayName
                .toLowerCase()
                .replace(/\s+/g, '.')}@company.com`,
            accountId:
              assignee.accountId ||
              `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            avatarUrls: assignee.avatarUrls || {
              '48x48': `https://ui-avatars.com/api/?name=${encodeURIComponent(
                assignee.displayName
              )}&background=random&color=fff&size=48`,
            },
          });
        }
      }
    });

    const realUsers = Array.from(usersMap.values());
    console.log('✅ UserService - Extracted real users:', {
      totalUsers: realUsers.length,
      users: realUsers.map(u => u.displayName),
    });

    // Store real users
    realUsers.forEach(user => {
      this.realUsers.set(user.accountId, user);
    });

    return realUsers;
  }

  /**
   * Calcula estatísticas dos usuários baseadas nos issues
   */
  calculateUserStats(issues: JiraIssue[]): UserStats[] {
    console.log(
      '🔍 UserService - Calculating user stats for:',
      issues.length,
      'issues'
    );

    const userStatsMap = new Map<
      string,
      {
        user: JiraUser;
        issues: JiraIssue[];
      }
    >();

    // Agrupar issues por usuário
    issues.forEach(issue => {
      if (issue.fields.assignee) {
        const assignee = issue.fields.assignee;
        const userKey = assignee.accountId || assignee.displayName;

        if (!userStatsMap.has(userKey)) {
          const user = this.realUsers.get(userKey) || {
            displayName: assignee.displayName,
            emailAddress:
              assignee.emailAddress ||
              `${assignee.displayName
                .toLowerCase()
                .replace(/\s+/g, '.')}@company.com`,
            accountId:
              assignee.accountId ||
              `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            avatarUrls: assignee.avatarUrls || {
              '48x48': `https://ui-avatars.com/api/?name=${encodeURIComponent(
                assignee.displayName
              )}&background=random&color=fff&size=48`,
            },
          };

          userStatsMap.set(userKey, { user, issues: [] });
        }

        userStatsMap.get(userKey)!.issues.push(issue);
      }
    });

    // Calcular estatísticas
    const stats: UserStats[] = Array.from(userStatsMap.values()).map(
      ({ user, issues }) => {
        const completedIssues = issues.filter(
          issue => issue.fields.status.statusCategory.name === 'Done'
        ).length;

        const inProgressIssues = issues.filter(
          issue => issue.fields.status.statusCategory.name === 'In Progress'
        ).length;

        const todoIssues = issues.filter(
          issue => issue.fields.status.statusCategory.name === 'To Do'
        ).length;

        // Calcular tempo médio de ciclo (criação até atualização)
        const cycleTimes = issues
          .filter(issue => issue.fields.status.statusCategory.name === 'Done')
          .map(issue => {
            const created = new Date(issue.fields.created);
            const updated = new Date(issue.fields.updated);
            return updated.getTime() - created.getTime();
          });

        const averageCycleTime =
          cycleTimes.length > 0
            ? cycleTimes.reduce((sum, time) => sum + time, 0) /
              cycleTimes.length /
              (1000 * 60 * 60 * 24) // em dias
            : 0;

        // Última atividade
        const lastActivity =
          issues.length > 0
            ? Math.max(
                ...issues.map(issue => new Date(issue.fields.updated).getTime())
              )
            : Date.now();

        return {
          user,
          issueCount: issues.length,
          completedIssues,
          inProgressIssues,
          todoIssues,
          averageCycleTime,
          lastActivity: new Date(lastActivity).toISOString(),
        };
      }
    );

    // Ordenar por número de issues (decrescente)
    stats.sort((a, b) => b.issueCount - a.issueCount);

    console.log('✅ UserService - Calculated user stats:', {
      totalUsers: stats.length,
      topUsers: stats.slice(0, 5).map(s => ({
        name: s.user.displayName,
        issues: s.issueCount,
        completed: s.completedIssues,
      })),
    });

    return stats;
  }

  /**
   * NUNCA gera usuários mockados - apenas usa dados reais do Jira
   */
  generateRealisticMockUsers(realUsers: JiraUser[]): JiraUser[] {
    console.log(
      '🔍 UserService - Only using REAL users from Jira:',
      realUsers.length,
      'real users'
    );

    // SEMPRE usar apenas usuários reais - NUNCA mockados
    if (realUsers.length > 0) {
      console.log('✅ UserService - Using REAL users from Jira');
      return realUsers;
    }

    // Se não há usuários reais, retornar array vazio
    console.log('⚠️ UserService - No real users found - returning empty array');
    return [];
  }

  /**
   * Obtém dados de usuários para o gráfico (APENAS dados reais do Jira)
   */
  getUsersForChart(
    issues: JiraIssue[]
  ): { name: string; value: number; user: JiraUser }[] {
    console.log(
      '🔍 UserService - Getting REAL users for chart from:',
      issues.length,
      'issues'
    );

    // Extrair APENAS usuários reais do Jira
    const realUsers = this.extractRealUsers(issues);

    if (realUsers.length > 0) {
      console.log('✅ UserService - Using REAL users from Jira for chart');
      const stats = this.calculateUserStats(issues);
      return stats.map(stat => ({
        name: stat.user.displayName,
        value: stat.issueCount,
        user: stat.user,
      }));
    }

    // Se não há usuários reais, retornar array vazio - NUNCA mockados
    console.log(
      '⚠️ UserService - No real users found - returning empty chart data'
    );
    return [];
  }

  /**
   * Verifica se estamos usando dados reais ou mockados
   */
  isUsingRealData(): boolean {
    return this.realUsers.size > 0;
  }

  /**
   * Obtém lista de usuários reais
   */
  getRealUsers(): JiraUser[] {
    return Array.from(this.realUsers.values());
  }

  /**
   * Limpa cache de usuários
   */
  clearCache(): void {
    this.realUsers.clear();
    this.userStats.clear();
    console.log('🧹 UserService - Cache cleared');
  }
}

export default UserService;

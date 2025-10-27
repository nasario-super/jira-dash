import { JiraApiService } from './jiraApi';

export interface UserProjectInfo {
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  projectCategory?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface UserAccessDiscovery {
  userEmail: string;
  accessibleProjects: UserProjectInfo[];
  discoveryMethod: 'jql' | 'projects' | 'boards' | 'fallback';
  discoveryTimestamp: Date;
  totalProjectsFound: number;
  accessibleProjectsCount: number;
}

class UserProjectDiscoveryService {
  private discoveryCache: Map<string, UserAccessDiscovery> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Descobre automaticamente os projetos acessíveis do usuário
   */
  async discoverUserProjects(
    userEmail: string,
    jiraApi: JiraApiService
  ): Promise<UserAccessDiscovery> {
    console.log(
      '🔍 UserProjectDiscovery - Starting discovery for user:',
      userEmail
    );

    // Verificar cache primeiro
    const cached = this.discoveryCache.get(userEmail);
    if (cached && this.isCacheValid(cached)) {
      console.log(
        '🔍 UserProjectDiscovery - Using cached discovery for:',
        userEmail
      );
      return cached;
    }

    try {
      // Método 1: Tentar descobrir via JQL (mais preciso)
      let discovery = await this.discoverViaJQL(userEmail, jiraApi);

      if (discovery.accessibleProjects.length === 0) {
        console.log(
          '🔍 UserProjectDiscovery - JQL method failed, trying projects API'
        );
        // Método 2: Tentar via API de projetos
        discovery = await this.discoverViaProjectsAPI(userEmail, jiraApi);
      }

      if (discovery.accessibleProjects.length === 0) {
        console.log(
          '🔍 UserProjectDiscovery - Projects API failed, trying boards API'
        );
        // Método 3: Tentar via API de boards
        discovery = await this.discoverViaBoardsAPI(userEmail, jiraApi);
      }

      if (discovery.accessibleProjects.length === 0) {
        console.log(
          '🔍 UserProjectDiscovery - All methods failed, using fallback'
        );
        // Método 4: Fallback - tentar projetos comuns
        discovery = await this.discoverViaFallback(userEmail, jiraApi);
      }

      // Cachear resultado
      this.discoveryCache.set(userEmail, discovery);

      console.log('🔍 UserProjectDiscovery - Discovery completed:', {
        user: userEmail,
        method: discovery.discoveryMethod,
        totalProjects: discovery.totalProjectsFound,
        accessibleProjects: discovery.accessibleProjectsCount,
        projects: discovery.accessibleProjects.map(p => p.key),
      });

      return discovery;
    } catch (error) {
      console.error('🔍 UserProjectDiscovery - Discovery failed:', error);
      throw new Error(`Failed to discover user projects: ${error}`);
    }
  }

  /**
   * Método 1: Descobrir via JQL - mais preciso e robusto
   */
  private async discoverViaJQL(
    userEmail: string,
    jiraApi: JiraApiService
  ): Promise<UserAccessDiscovery> {
    try {
      console.log('🔍 UserProjectDiscovery - Trying JQL method');

      // Múltiplas estratégias JQL em ordem de precisão
      const jqlStrategies = [
        // Estratégia 1: Busca direta por usuário
        `assignee = "${userEmail}" OR reporter = "${userEmail}"`,

        // Estratégia 2: Busca mais ampla incluindo watchers
        `assignee = "${userEmail}" OR reporter = "${userEmail}" OR watcher = "${userEmail}"`,

        // Estratégia 3: Busca por projetos específicos conhecidos
        `project in (INFOSECC, SEGP, TS, TRE, CRMS, PPD, GCD) AND (assignee = "${userEmail}" OR reporter = "${userEmail}")`,

        // Estratégia 4: Busca por issues recentes do usuário
        `assignee = "${userEmail}" AND updated >= -30d`,

        // Estratégia 5: Busca mais simples
        `assignee = "${userEmail}"`,
      ];

      let issues: any[] = [];
      let successfulStrategy = '';

      for (const jql of jqlStrategies) {
        try {
          console.log('🔍 UserProjectDiscovery - Trying JQL:', jql);
          const strategyIssues = await jiraApi.getIssues(jql, 0, 20);

          if (strategyIssues && strategyIssues.length > 0) {
            issues = strategyIssues;
            successfulStrategy = jql;
            console.log('🔍 UserProjectDiscovery - JQL Success:', {
              strategy: jql,
              issuesFound: issues.length,
              projects: [...new Set(issues.map(i => i.fields.project.key))],
            });
            break;
          }
        } catch (strategyError: any) {
          console.warn('🔍 UserProjectDiscovery - JQL Strategy failed:', {
            strategy: jql,
            error: strategyError.response?.status || strategyError.message,
          });
          continue;
        }
      }

      if (issues.length === 0) {
        console.log(
          '🔍 UserProjectDiscovery - No issues found with any JQL strategy'
        );
        return this.createEmptyDiscovery(userEmail, 'jql');
      }

      // Extrair projetos únicos das issues
      const projectKeys = [
        ...new Set(issues.map(issue => issue.fields.project.key)),
      ];

      console.log('🔍 UserProjectDiscovery - JQL Results:', {
        successfulStrategy,
        issuesFound: issues.length,
        projects: projectKeys,
        issues: issues.map(i => ({
          key: i.key,
          project: i.fields.project.key,
        })),
      });

      return await this.getProjectDetails(
        projectKeys,
        userEmail,
        jiraApi,
        'jql'
      );
    } catch (error) {
      console.warn('🔍 UserProjectDiscovery - JQL method failed:', error);
      return this.createEmptyDiscovery(userEmail, 'jql');
    }
  }

  /**
   * Método 2: Descobrir via API de projetos
   */
  private async discoverViaProjectsAPI(
    userEmail: string,
    jiraApi: JiraApiService
  ): Promise<UserAccessDiscovery> {
    try {
      console.log('🔍 UserProjectDiscovery - Trying Projects API method');

      const projects = await jiraApi.getProjects();

      if (!projects || projects.length === 0) {
        return this.createEmptyDiscovery(userEmail, 'projects');
      }

      // Filtrar projetos que o usuário pode acessar
      const accessibleProjects: UserProjectInfo[] = [];

      for (const project of projects) {
        try {
          // Tentar buscar issues do projeto para verificar acesso
          const testJql = `project = "${project.key}"`;
          const testIssues = await jiraApi.getIssues(testJql, 0, 1);

          if (testIssues.length > 0) {
            accessibleProjects.push({
              key: project.key,
              name: project.name,
              projectTypeKey: project.projectTypeKey,
              avatarUrls: project.avatarUrls,
              projectCategory: project.projectCategory,
            });
          }
        } catch (error) {
          // Projeto não acessível, pular
          continue;
        }
      }

      return {
        userEmail,
        accessibleProjects,
        discoveryMethod: 'projects',
        discoveryTimestamp: new Date(),
        totalProjectsFound: projects.length,
        accessibleProjectsCount: accessibleProjects.length,
      };
    } catch (error) {
      console.warn(
        '🔍 UserProjectDiscovery - Projects API method failed:',
        error
      );
      return this.createEmptyDiscovery(userEmail, 'projects');
    }
  }

  /**
   * Método 3: Descobrir via API de boards
   */
  private async discoverViaBoardsAPI(
    userEmail: string,
    jiraApi: JiraApiService
  ): Promise<UserAccessDiscovery> {
    try {
      console.log('🔍 UserProjectDiscovery - Trying Boards API method');

      const boards = await jiraApi.getBoards();

      if (!boards || boards.length === 0) {
        return this.createEmptyDiscovery(userEmail, 'boards');
      }

      // Extrair projetos dos boards
      const projectKeys = [
        ...new Set(
          boards.map(board => board.location?.projectKey).filter(Boolean)
        ),
      ];

      // Buscar detalhes dos projetos
      const projects = await Promise.all(
        projectKeys.map(async key => {
          try {
            const project = await jiraApi.getProject(key);
            return {
              key: project.key,
              name: project.name,
              projectTypeKey: project.projectTypeKey,
              avatarUrls: project.avatarUrl,
              projectCategory: project.projectCategory,
            };
          } catch (error) {
            console.warn(
              `🔍 UserProjectDiscovery - Failed to get project ${key}:`,
              error
            );
            return null;
          }
        })
      );

      const validProjects = projects.filter(
        p => p !== null
      ) as UserProjectInfo[];

      return {
        userEmail,
        accessibleProjects: validProjects,
        discoveryMethod: 'boards',
        discoveryTimestamp: new Date(),
        totalProjectsFound: projectKeys.length,
        accessibleProjectsCount: validProjects.length,
      };
    } catch (error) {
      console.warn(
        '🔍 UserProjectDiscovery - Boards API method failed:',
        error
      );
      return this.createEmptyDiscovery(userEmail, 'boards');
    }
  }

  /**
   * Método 4: Fallback inteligente - tentar projetos comuns com validação
   */
  private async discoverViaFallback(
    userEmail: string,
    jiraApi: JiraApiService
  ): Promise<UserAccessDiscovery> {
    console.log('🔍 UserProjectDiscovery - Using intelligent fallback method');

    // Lista de projetos comuns organizados por prioridade
    const commonProjects = [
      // Projetos de alta prioridade (mais prováveis de ter acesso)
      { key: 'INFOSECC', priority: 1, description: 'Segurança da Informação' },
      { key: 'SEGP', priority: 1, description: 'Segurança & Privacidade' },

      // Projetos de média prioridade
      { key: 'TS', priority: 2, description: 'Template Service' },
      { key: 'TRE', priority: 2, description: 'AI Docs Elevate' },

      // Projetos de baixa prioridade
      { key: 'CRMS', priority: 3, description: 'CRM System' },
      { key: 'PPD', priority: 3, description: 'Product Development' },
      { key: 'GCD', priority: 3, description: 'Global Content Delivery' },
    ];

    const accessibleProjects: UserProjectInfo[] = [];
    const testedProjects: string[] = [];

    // Ordenar por prioridade
    const sortedProjects = commonProjects.sort(
      (a, b) => a.priority - b.priority
    );

    console.log(
      '🔍 UserProjectDiscovery - Testing projects in priority order:',
      sortedProjects.map(p => `${p.key} (${p.description})`)
    );

    for (const project of sortedProjects) {
      try {
        console.log(
          `🔍 UserProjectDiscovery - Testing project: ${project.key}`
        );
        testedProjects.push(project.key);

        // Tentar buscar o projeto
        const projectData = await jiraApi.getProject(project.key);

        // Validar se o usuário tem acesso testando uma busca simples
        try {
          const testJql = `project = "${project.key}"`;
          const testIssues = await jiraApi.getIssues(testJql, 0, 1);

          if (testIssues && testIssues.length >= 0) {
            // Mesmo que 0 issues, se não der erro, tem acesso
            accessibleProjects.push({
              key: projectData.key,
              name: projectData.name,
              projectTypeKey: projectData.projectTypeKey,
              avatarUrls: projectData.avatarUrls,
              projectCategory: projectData.projectCategory,
            });

            console.log(
              `✅ UserProjectDiscovery - Access confirmed for ${project.key}: ${project.description}`
            );
          }
        } catch (accessError) {
          console.log(
            `❌ UserProjectDiscovery - No access to ${project.key}: ${accessError}`
          );
          continue;
        }
      } catch (error) {
        console.log(
          `❌ UserProjectDiscovery - Project ${project.key} not accessible:`,
          error
        );
        continue;
      }
    }

    console.log('🔍 UserProjectDiscovery - Fallback results:', {
      testedProjects,
      accessibleProjects: accessibleProjects.map(p => p.key),
      totalFound: accessibleProjects.length,
    });

    return {
      userEmail,
      accessibleProjects,
      discoveryMethod: 'fallback',
      discoveryTimestamp: new Date(),
      totalProjectsFound: testedProjects.length,
      accessibleProjectsCount: accessibleProjects.length,
    };
  }

  /**
   * Método auxiliar para buscar detalhes dos projetos
   */
  private async getProjectDetails(
    projectKeys: string[],
    userEmail: string,
    jiraApi: JiraApiService,
    method: string
  ): Promise<UserAccessDiscovery> {
    console.log(
      '🔍 UserProjectDiscovery - Getting project details:',
      projectKeys
    );

    // Buscar detalhes dos projetos
    const projects = await Promise.all(
      projectKeys.map(async key => {
        try {
          console.log(`🔍 UserProjectDiscovery - Fetching project: ${key}`);
          const project = await jiraApi.getProject(key);
          console.log(`🔍 UserProjectDiscovery - Project ${key} details:`, {
            key: project.key,
            name: project.name,
            type: project.projectTypeKey,
          });
          return {
            key: project.key,
            name: project.name,
            projectTypeKey: project.projectTypeKey,
            avatarUrls: project.avatarUrls,
            projectCategory: project.projectCategory,
          };
        } catch (error) {
          console.warn(
            `🔍 UserProjectDiscovery - Failed to get project ${key}:`,
            error
          );
          return null;
        }
      })
    );

    const validProjects = projects.filter(p => p !== null) as UserProjectInfo[];

    console.log('🔍 UserProjectDiscovery - Project details result:', {
      requested: projectKeys.length,
      valid: validProjects.length,
      projects: validProjects.map(p => p.key),
    });

    return {
      userEmail,
      accessibleProjects: validProjects,
      discoveryMethod: method as any,
      discoveryTimestamp: new Date(),
      totalProjectsFound: projectKeys.length,
      accessibleProjectsCount: validProjects.length,
    };
  }

  /**
   * Cria uma descoberta vazia
   */
  private createEmptyDiscovery(
    userEmail: string,
    method: string
  ): UserAccessDiscovery {
    return {
      userEmail,
      accessibleProjects: [],
      discoveryMethod: method as any,
      discoveryTimestamp: new Date(),
      totalProjectsFound: 0,
      accessibleProjectsCount: 0,
    };
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(discovery: UserAccessDiscovery): boolean {
    const now = new Date();
    const cacheAge = now.getTime() - discovery.discoveryTimestamp.getTime();
    return cacheAge < this.CACHE_DURATION;
  }

  /**
   * Limpa o cache
   */
  clearCache(userEmail?: string): void {
    if (userEmail) {
      this.discoveryCache.delete(userEmail);
      console.log(
        '🔍 UserProjectDiscovery - Cache cleared for user:',
        userEmail
      );
    } else {
      this.discoveryCache.clear();
      console.log('🔍 UserProjectDiscovery - All cache cleared');
    }
  }

  /**
   * Obtém informações do cache
   */
  getCachedDiscovery(userEmail: string): UserAccessDiscovery | null {
    const cached = this.discoveryCache.get(userEmail);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    return null;
  }
}

export const userProjectDiscoveryService = new UserProjectDiscoveryService();

import { JiraIssue } from '../types/jira.types';
import {
  userProjectDiscoveryService,
  UserAccessDiscovery,
} from './userProjectDiscovery';
import { JiraApiService } from './jiraApi';

/**
 * Serviço para gerenciar acesso a projetos do usuário
 */
export class ProjectAccessService {
  private userProjects: string[] = [];
  private userEmail: string = '';
  private discoveryInfo: UserAccessDiscovery | null = null;
  private isDiscovering: boolean = false;

  /**
   * Inicializa o serviço com os projetos acessíveis do usuário
   */
  initializeUserProjects(email: string, projects: string[]) {
    console.log('🔐 ProjectAccessService - Initializing user projects:', {
      email,
      projects,
      previousProjects: this.userProjects,
      previousEmail: this.userEmail,
      projectCount: projects.length,
    });

    this.userEmail = email;
    this.userProjects = [...projects]; // Criar uma cópia para evitar mutação
    // Marcar como seleção manual (limpar discoveryInfo)
    this.discoveryInfo = null;

    console.log(
      '🔐 ProjectAccessService - User Projects Initialized (Manual Selection):',
      {
        email: this.userEmail,
        projects: this.userProjects,
        projectCount: this.userProjects.length,
        isManualSelection: true,
        isInitialized: this.isInitialized(),
      }
    );

    // Validação adicional
    if (this.userProjects.length !== projects.length) {
      console.error(
        '🔐 ProjectAccessService - CRITICAL: Project count mismatch!',
        {
          expected: projects.length,
          actual: this.userProjects.length,
          expectedProjects: projects,
          actualProjects: this.userProjects,
        }
      );
    }
  }

  /**
   * Verifica se o usuário tem acesso a um projeto específico
   */
  hasAccessToProject(projectKey: string): boolean {
    const hasAccess = this.userProjects.includes(projectKey);
    console.log('🔐 ProjectAccessService - Project Access Check:', {
      projectKey,
      hasAccess,
      userProjects: this.userProjects,
    });
    return hasAccess;
  }

  /**
   * Filtra issues baseado nos projetos acessíveis pelo usuário - Versão aprimorada
   */
  filterIssuesByUserAccess(issues: JiraIssue[]): JiraIssue[] {
    // Validação rigorosa do estado do serviço
    if (!this.isInitialized()) {
      console.warn(
        '🔐 ProjectAccessService - Service not initialized, returning empty array'
      );
      return [];
    }

    if (!this.userProjects.length) {
      console.warn(
        '🔐 ProjectAccessService - No user projects configured, returning empty array'
      );
      return [];
    }

    if (!issues || issues.length === 0) {
      console.log('🔐 ProjectAccessService - No issues to filter');
      return [];
    }

    // Análise prévia dos projetos nas issues
    const allProjectKeys = [
      ...new Set(issues.map(issue => issue.fields.project.key)),
    ];
    const accessibleProjectKeys = allProjectKeys.filter(key =>
      this.hasAccessToProject(key)
    );
    const inaccessibleProjectKeys = allProjectKeys.filter(
      key => !this.hasAccessToProject(key)
    );

    console.log('🔐 ProjectAccessService - Pre-filtering analysis:', {
      totalIssues: issues.length,
      allProjects: allProjectKeys,
      accessibleProjects: accessibleProjectKeys,
      inaccessibleProjects: inaccessibleProjectKeys,
      userProjects: this.userProjects,
    });

    // Filtragem rigorosa
    const filteredIssues = issues.filter(issue => {
      const projectKey = issue.fields.project.key;
      const hasAccess = this.hasAccessToProject(projectKey);

      if (!hasAccess) {
        console.log(
          '🔐 ProjectAccessService - Filtering out issue from inaccessible project:',
          {
            issueKey: issue.key,
            projectKey,
            projectName: issue.fields.project.name,
            userProjects: this.userProjects,
          }
        );
      }

      return hasAccess;
    });

    // Validação pós-filtragem
    const finalProjectKeys = [
      ...new Set(filteredIssues.map(issue => issue.fields.project.key)),
    ];
    const invalidProjects = finalProjectKeys.filter(
      key => !this.hasAccessToProject(key)
    );

    if (invalidProjects.length > 0) {
      console.error(
        '🔐 ProjectAccessService - CRITICAL: Invalid projects found after filtering:',
        invalidProjects
      );
    }

    console.log('🔐 ProjectAccessService - Issues filtered by user access:', {
      originalCount: issues.length,
      filteredCount: filteredIssues.length,
      removedCount: issues.length - filteredIssues.length,
      finalProjects: finalProjectKeys,
      userProjects: this.userProjects,
      isValid: invalidProjects.length === 0,
    });

    return filteredIssues;
  }

  /**
   * Obtém os projetos acessíveis pelo usuário
   */
  getUserProjects(): string[] {
    return [...this.userProjects];
  }

  /**
   * Obtém o email do usuário
   */
  getUserEmail(): string {
    return this.userEmail;
  }

  /**
   * Verifica se o serviço foi inicializado
   */
  isInitialized(): boolean {
    return this.userProjects.length > 0 && this.userEmail !== '';
  }

  /**
   * Verifica se a seleção foi feita manualmente (não por descoberta automática)
   */
  isManualSelection(): boolean {
    return this.isInitialized() && !this.discoveryInfo;
  }

  /**
   * Obtém estatísticas de acesso
   */
  getAccessStats(issues: JiraIssue[]): {
    totalIssues: number;
    accessibleIssues: number;
    inaccessibleIssues: number;
    accessibleProjects: string[];
    inaccessibleProjects: string[];
  } {
    const accessibleIssues = this.filterIssuesByUserAccess(issues);
    const inaccessibleIssues = issues.filter(
      issue => !this.hasAccessToProject(issue.fields.project.key)
    );

    const allProjectKeys = [
      ...new Set(issues.map(issue => issue.fields.project.key)),
    ];
    const accessibleProjects = allProjectKeys.filter(key =>
      this.hasAccessToProject(key)
    );
    const inaccessibleProjects = allProjectKeys.filter(
      key => !this.hasAccessToProject(key)
    );

    return {
      totalIssues: issues.length,
      accessibleIssues: accessibleIssues.length,
      inaccessibleIssues: inaccessibleIssues.length,
      accessibleProjects,
      inaccessibleProjects,
    };
  }

  /**
   * Descobre automaticamente os projetos acessíveis do usuário
   */
  async discoverUserProjects(
    email: string,
    jiraApi: JiraApiService
  ): Promise<void> {
    // Verificar se já há projetos configurados manualmente
    if (this.isManualSelection()) {
      console.log(
        '🔐 ProjectAccessService - Manual selection already configured, skipping automatic discovery'
      );
      console.log(
        '🔐 ProjectAccessService - Manual projects:',
        this.userProjects
      );
      console.log(
        '🔐 ProjectAccessService - Manual selection detected, preventing automatic discovery'
      );
      return;
    }

    // Verificar se já há projetos configurados (mesmo que não seja manual)
    if (this.isInitialized() && this.userProjects.length > 0) {
      console.log(
        '🔐 ProjectAccessService - Projects already configured, skipping automatic discovery'
      );
      console.log(
        '🔐 ProjectAccessService - Existing projects:',
        this.userProjects
      );
      return;
    }

    if (this.isDiscovering) {
      console.log(
        '🔐 ProjectAccessService - Discovery already in progress for:',
        email
      );
      return;
    }

    console.log(
      '🔍 ProjectAccessService - Automatic discovery DISABLED - Only manual selection allowed'
    );
    console.log(
      '🔐 ProjectAccessService - Skipping automatic discovery to preserve manual selection'
    );
    return;
  }

  /**
   * Configura projetos específicos para usuários conhecidos (fallback)
   */
  configureKnownUserProjects(email: string): void {
    // Configuração específica para anderson.nasario@superlogica.com
    if (email === 'anderson.nasario@superlogica.com') {
      this.initializeUserProjects(email, ['INFOSECC', 'SEGP']);
      console.log('🔐 ProjectAccessService - Configured known user projects:', {
        email,
        projects: ['INFOSECC', 'SEGP'],
        description: 'User has access only to INFOSECC and SEGP projects',
      });
    } else {
      // Para outros usuários, usar configuração padrão ou vazia
      this.initializeUserProjects(email, []);
      console.log(
        '🔐 ProjectAccessService - No specific configuration for user:',
        email
      );
    }
  }

  /**
   * Valida se os dados estão sendo filtrados corretamente
   */
  validateDataFiltering(issues: JiraIssue[]): {
    isValid: boolean;
    issues: {
      total: number;
      accessible: number;
      inaccessible: number;
    };
    projects: {
      accessible: string[];
      inaccessible: string[];
    };
    recommendations: string[];
  } {
    const accessibleIssues = this.filterIssuesByUserAccess(issues);
    const allProjectKeys = [
      ...new Set(issues.map(issue => issue.fields.project.key)),
    ];
    const accessibleProjects = allProjectKeys.filter(key =>
      this.hasAccessToProject(key)
    );
    const inaccessibleProjects = allProjectKeys.filter(
      key => !this.hasAccessToProject(key)
    );

    const recommendations: string[] = [];

    if (inaccessibleProjects.length > 0) {
      recommendations.push(
        `Remover dados de projetos inacessíveis: ${inaccessibleProjects.join(
          ', '
        )}`
      );
    }

    if (accessibleProjects.length !== this.userProjects.length) {
      recommendations.push(
        `Verificar se todos os projetos acessíveis estão sendo exibidos`
      );
    }

    if (issues.length !== accessibleIssues.length) {
      recommendations.push(
        `Filtrar ${
          issues.length - accessibleIssues.length
        } issues de projetos inacessíveis`
      );
    }

    return {
      isValid:
        inaccessibleProjects.length === 0 &&
        issues.length === accessibleIssues.length,
      issues: {
        total: issues.length,
        accessible: accessibleIssues.length,
        inaccessible: issues.length - accessibleIssues.length,
      },
      projects: {
        accessible: accessibleProjects,
        inaccessible: inaccessibleProjects,
      },
      recommendations,
    };
  }

  /**
   * Valida se um projeto está na lista de projetos acessíveis
   */
  validateProjectAccess(projectKey: string): {
    hasAccess: boolean;
    message: string;
    userProjects: string[];
  } {
    const hasAccess = this.hasAccessToProject(projectKey);

    return {
      hasAccess,
      message: hasAccess
        ? `Acesso permitido ao projeto ${projectKey}`
        : `Acesso negado ao projeto ${projectKey}. Projetos acessíveis: ${this.userProjects.join(
            ', '
          )}`,
      userProjects: this.userProjects,
    };
  }

  /**
   * Obtém informações da descoberta automática
   */
  getDiscoveryInfo(): UserAccessDiscovery | null {
    return this.discoveryInfo;
  }

  /**
   * Verifica se está em processo de descoberta
   */
  isDiscoveringProjects(): boolean {
    return this.isDiscovering;
  }

  /**
   * Força uma nova descoberta (limpa cache e seleção manual)
   */
  async forceRediscovery(
    email: string,
    jiraApi: JiraApiService
  ): Promise<void> {
    console.log(
      '🔍 ProjectAccessService - Force rediscovery DISABLED - Only manual selection allowed'
    );
    console.log(
      '🔐 ProjectAccessService - Skipping force rediscovery to preserve manual selection'
    );
    return;
  }
}

// Instância singleton do serviço
export const projectAccessService = new ProjectAccessService();

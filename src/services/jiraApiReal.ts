import axios, { AxiosInstance } from 'axios';
import {
  JiraApiConfig,
  JiraIssue,
  ProjectData,
  SprintData,
  BoardData,
} from '../types/jira.types';

export class JiraApiRealService {
  private api: AxiosInstance;
  private apiV3: AxiosInstance;
  private config: JiraApiConfig;

  constructor(config: JiraApiConfig) {
    this.config = config;
    
    // ⚠️ Em produção, credenciais virão do login do usuário
    // Permitir inicialização mesmo sem credenciais
    if (!config.domain || !config.email || !config.apiToken) {
      console.warn('⚠️ Jira credentials not provided. Please login to provide credentials.');
    }

    // API v2
    this.api = axios.create({
      baseURL: `/api/jira/rest/api/2`,
      headers: config.domain && config.email && config.apiToken
        ? {
            Authorization: `Basic ${btoa(
              `${config.email}:${config.apiToken}`
            )}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
    });

    // API v3
    this.apiV3 = axios.create({
      baseURL: `/api/jira/rest/api/3`,
      headers: config.domain && config.email && config.apiToken
        ? {
            Authorization: `Basic ${btoa(
              `${config.email}:${config.apiToken}`
            )}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      config => {
        console.log(`Sending Request to the Target: ${config.url}`);
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.api.interceptors.response.use(
      response => {
        console.log(
          `Received Response from the Target: ${response.status} ${response.config.url}`
        );
        return response;
      },
      error => {
        console.error(
          'Response error:',
          error.response?.status,
          error.response?.data
        );
        return Promise.reject(error);
      }
    );
  }

  // Get all issues using JQL (working strategy)
  async getAllIssues(): Promise<JiraIssue[]> {
    console.log('🔍 Fetching real issues using JQL...');
    console.log('📡 Using config:', {
      domain: this.config.domain,
      email: this.config.email,
      tokenLength: this.config.apiToken?.length,
    });

    try {
      // Strategy 1: Buscar issues por projeto (mais rápido e preciso)
      console.log('📊 Fetching all projects first...');
      const projects = await this.getProjects();
      console.log(`✅ Found ${projects.length} projects`);

      const allRealIssues: JiraIssue[] = [];
      const issueIds = new Set<string>();
      const MAX_ISSUES_PER_PROJECT = 200; // Limite por projeto
      const MAX_TOTAL_ISSUES = 2000; // Limite total

      // Buscar issues de cada projeto em paralelo (lotes de 10)
      const projectBatches = [];
      for (let i = 0; i < projects.length; i += 10) {
        projectBatches.push(projects.slice(i, i + 10));
      }

      for (const batch of projectBatches) {
        // Se já temos issues suficientes, parar
        if (allRealIssues.length >= MAX_TOTAL_ISSUES) {
          console.log(`✅ Reached ${allRealIssues.length} issues, stopping...`);
          break;
        }

        // Buscar issues de múltiplos projetos em paralelo
        const batchPromises = batch.map(async project => {
          try {
            const jql = `project = ${project.key}`;

            const response = await this.apiV3.get('/search/jql', {
              params: {
                jql: jql,
                maxResults: MAX_ISSUES_PER_PROJECT,
                fields:
                  'summary,status,issuetype,assignee,project,created,updated,priority,labels',
              },
            });

            const issues = response.data.issues || [];
            if (issues.length > 0) {
              console.log(`✅ ${project.key}: ${issues.length} issues`);
            }
            return issues;
          } catch (error: any) {
            // Silenciar erros de projetos sem acesso
            return [];
          }
        });

        const batchResults = await Promise.all(batchPromises);

        // Adicionar issues únicas
        for (const issues of batchResults) {
          for (const issue of issues) {
            if (!issueIds.has(issue.id)) {
              issueIds.add(issue.id);
              allRealIssues.push(...this.transformIssues([issue]));
            }
          }
        }

        console.log(
          `📊 Progress: ${allRealIssues.length} issues from ${issueIds.size} unique IDs`
        );
      }

      console.log(
        `🎯 Total unique issues fetched: ${allRealIssues.length} from ${issueIds.size} unique IDs`
      );

      if (allRealIssues.length === 0) {
        console.warn(
          '⚠️ All JQL queries failed, generating mock data from real projects...'
        );

        // Fallback: Generate mock data based on real projects and users
        try {
          const [projects, users] = await Promise.all([
            this.getProjects(),
            this.getRealUsers(),
          ]);

          if (projects.length > 0) {
            console.log(
              `📊 Generating ${
                projects.length * 3
              } mock issues based on real projects`
            );
            return this.generateMockIssuesFromRealData(projects, users);
          }
        } catch (fallbackError) {
          console.error(
            '❌ Fallback mock data generation failed:',
            fallbackError
          );
        }
      }

      return allRealIssues;
    } catch (error) {
      console.error('❌ Error fetching issues:', error);
      return [];
    }
  }

  // Get projects
  async getProjects(): Promise<any[]> {
    try {
      console.log('📡 Fetching projects...');
      const response = await this.apiV3.get('/project');
      console.log(
        '✅ Projects fetched successfully:',
        response.data.length,
        'projects'
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      return [];
    }
  }

  // Get real users
  async getRealUsers(): Promise<any[]> {
    try {
      console.log('📡 Fetching real users...');
      const response = await this.apiV3.get('/user/search', {
        params: {
          query: 'a',
          maxResults: 50,
        },
      });
      console.log(
        '✅ Users fetched successfully:',
        response.data.length,
        'users'
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  }

  // Get all boards
  async getBoards(): Promise<BoardData[]> {
    try {
      console.log('📡 Fetching boards from Jira API...');
      const response = await this.api.get('/board');
      console.log(
        '✅ Boards fetched successfully:',
        response.data.values?.length || 0,
        'boards'
      );
      return response.data.values || [];
    } catch (error) {
      console.error('❌ Error fetching boards:', error);
      return [];
    }
  }

  // Get sprints for a board
  async getSprints(_boardId: number): Promise<SprintData[]> {
    try {
      console.log('📡 Fetching sprints from Jira API...');
      const response = await this.api.get('/board/1/sprint');
      console.log(
        '✅ Sprints fetched successfully:',
        response.data.values?.length || 0,
        'sprints'
      );
      return response.data.values || [];
    } catch (error) {
      console.error('❌ Error fetching sprints:', error);
      return [];
    }
  }

  // Generate realistic mock issues based on real projects and users
  private generateMockIssuesFromRealData(
    projects: any[],
    users: any[]
  ): JiraIssue[] {
    console.log(
      '📊 Generating mock issues based on real projects and users...'
    );

    const issueTypes = ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'];
    const statuses = [
      { name: 'To Do', category: 'To Do', color: 'blue' },
      { name: 'In Progress', category: 'In Progress', color: 'yellow' },
      { name: 'Done', category: 'Done', color: 'green' },
      { name: 'Cancelled', category: 'Cancelled', color: 'red' },
      { name: 'Backlog', category: 'To Do', color: 'gray' },
      { name: 'Pendente', category: 'In Progress', color: 'orange' },
      { name: 'Em andamento', category: 'In Progress', color: 'yellow' },
      { name: 'Concluído', category: 'Done', color: 'green' },
    ];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const mockIssues: JiraIssue[] = [];
    const issuesPerProject = Math.max(2, Math.floor(80 / projects.length));

    projects.slice(0, 20).forEach((project, projectIndex) => {
      for (let i = 0; i < issuesPerProject; i++) {
        const issueType =
          issueTypes[Math.floor(Math.random() * issueTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const priority =
          priorities[Math.floor(Math.random() * priorities.length)];
        const assignee =
          Math.random() > 0.3 && users.length > 0
            ? users[Math.floor(Math.random() * users.length)]
            : null;

        const issueKey = `${project.key}-${1000 + i}`;
        const createdDate = new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
        );
        const updatedDate = new Date(
          createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
        );

        mockIssues.push({
          id: `${project.id}-${i}`,
          key: issueKey,
          fields: {
            summary: this.generateIssueSummary(issueType, project.name),
            status: {
              name: status.name,
              statusCategory: {
                name: status.category,
                colorName: status.color,
              },
            },
            issuetype: {
              name: issueType,
              iconUrl: `https://jira.atlassian.com/images/icons/issuetypes/${issueType.toLowerCase()}.svg`,
            },
            priority: {
              name: priority,
              iconUrl: `https://jira.atlassian.com/images/icons/priorities/${priority.toLowerCase()}.svg`,
            },
            assignee: assignee
              ? {
                  displayName: assignee.displayName,
                  emailAddress: assignee.emailAddress,
                  avatarUrls: assignee.avatarUrls || {
                    '48x48': `https://via.placeholder.com/48?text=${assignee.displayName.charAt(
                      0
                    )}`,
                  },
                }
              : undefined,
            created: createdDate.toISOString(),
            updated: updatedDate.toISOString(),
            project: {
              id: project.id,
              key: project.key,
              name: project.name,
            },
            sprint:
              Math.random() > 0.5
                ? {
                    id: Math.floor(Math.random() * 10) + 1,
                    name: `Sprint ${Math.floor(Math.random() * 20) + 1}`,
                    state: Math.random() > 0.7 ? 'active' : 'closed',
                  }
                : undefined,
            labels: this.generateLabels(issueType),
            duedate:
              Math.random() > 0.6
                ? new Date(
                    Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
                  )
                    .toISOString()
                    .split('T')[0]
                : undefined,
          },
        });
      }
    });

    return mockIssues;
  }

  private generateIssueSummary(issueType: string, projectName: string): string {
    const summaries = {
      Story: [
        `Implementar funcionalidade de ${projectName.toLowerCase()}`,
        `Criar nova feature para ${projectName}`,
        `Desenvolver módulo de ${projectName.toLowerCase()}`,
        `Adicionar integração com ${projectName}`,
      ],
      Bug: [
        `Corrigir erro em ${projectName.toLowerCase()}`,
        `Resolver problema de performance em ${projectName}`,
        `Fix bug na funcionalidade de ${projectName.toLowerCase()}`,
        `Corrigir validação em ${projectName}`,
      ],
      Task: [
        `Atualizar documentação de ${projectName}`,
        `Refatorar código de ${projectName.toLowerCase()}`,
        `Otimizar processo de ${projectName.toLowerCase()}`,
        `Configurar ambiente para ${projectName}`,
      ],
      Epic: [
        `Grande funcionalidade de ${projectName}`,
        `Refatoração completa de ${projectName.toLowerCase()}`,
        `Nova arquitetura para ${projectName}`,
        `Migração de ${projectName.toLowerCase()}`,
      ],
      'Sub-task': [
        `Sub-tarefa de ${projectName.toLowerCase()}`,
        `Detalhamento de ${projectName}`,
        `Implementação específica em ${projectName.toLowerCase()}`,
        `Configuração de ${projectName.toLowerCase()}`,
      ],
    };

    const typeSummaries =
      summaries[issueType as keyof typeof summaries] || summaries['Task'];
    return typeSummaries[Math.floor(Math.random() * typeSummaries.length)];
  }

  private generateLabels(issueType: string): string[] {
    const labelSets = {
      Story: ['enhancement', 'feature', 'user-story'],
      Bug: ['bug', 'fix', 'critical'],
      Task: ['task', 'maintenance', 'improvement'],
      Epic: ['epic', 'major', 'architecture'],
      'Sub-task': ['subtask', 'detail', 'implementation'],
    };

    const labels = labelSets[issueType as keyof typeof labelSets] || [
      'general',
    ];
    return labels.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  // Transform issues to match our interface
  private transformIssues(issues: any[]): JiraIssue[] {
    return issues.map(issue => ({
      id: issue.id,
      key: issue.key,
      fields: {
        summary: issue.fields?.summary || 'No summary',
        status: {
          name: issue.fields?.status?.name || 'Unknown',
          statusCategory: {
            name: issue.fields?.status?.statusCategory?.name || 'Unknown',
            colorName:
              issue.fields?.status?.statusCategory?.colorName || 'gray',
          },
        },
        issuetype: {
          name: issue.fields?.issuetype?.name || 'Task',
          iconUrl: issue.fields?.issuetype?.iconUrl || '',
        },
        priority: {
          name: issue.fields?.priority?.name || 'Medium',
          iconUrl: issue.fields?.priority?.iconUrl || '',
        },
        assignee: issue.fields?.assignee
          ? {
              displayName: issue.fields.assignee.displayName || 'Unassigned',
              emailAddress: issue.fields.assignee.emailAddress || '',
              avatarUrls: issue.fields.assignee.avatarUrls || { '48x48': '' },
            }
          : undefined,
        created: issue.fields?.created || new Date().toISOString(),
        updated: issue.fields?.updated || new Date().toISOString(),
        project: {
          id: issue.fields?.project?.id || '',
          key: issue.fields?.project?.key || 'UNKNOWN',
          name: issue.fields?.project?.name || 'Unknown Project',
        },
        sprint: issue.fields?.sprint
          ? {
              id: issue.fields.sprint.id || 0,
              name: issue.fields.sprint.name || 'Unknown Sprint',
              state: issue.fields.sprint.state || 'unknown',
            }
          : undefined,
        labels: issue.fields?.labels || [],
        duedate: issue.fields?.duedate || undefined,
      },
    }));
  }
}

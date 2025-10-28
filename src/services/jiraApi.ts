import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  JiraIssue,
  SprintData,
  BoardData,
  ProjectData,
  JiraApiConfig,
} from '../types/jira.types';
import { projectAccessService } from './projectAccessService';

class JiraApiService {
  private api: AxiosInstance;
  private config: JiraApiConfig;

  constructor(credentials?: JiraApiConfig) {
    if (credentials) {
      this.config = credentials;
    } else {
      // Fallback para variáveis de ambiente (desenvolvimento)
      this.config = {
        domain: (import.meta as any).env.VITE_JIRA_DOMAIN || '',
        email: (import.meta as any).env.VITE_JIRA_EMAIL || '',
        apiToken: (import.meta as any).env.VITE_JIRA_API_TOKEN || '',
      };
      
      // ⚠️ Em produção, credenciais virão do login do usuário
      if (!this.config.domain && !this.config.email && !this.config.apiToken) {
        console.warn('⚠️ Jira credentials not provided. Please login to provide credentials.');
      }
    }

    // ✅ USAR PROXY VITE QUE REPASSA CREDENCIAIS DO USUÁRIO
    const baseURL = `/api/jira/rest/api/2`;

    this.api = axios.create({
      baseURL,
      headers: this.config.domain && this.config.email && this.config.apiToken
        ? {
            Authorization: `Basic ${btoa(
              `${this.config.email}:${this.config.apiToken}`
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
        console.log(`Making request to: ${config.url}`);
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Test connection to Jira
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to Jira...');
      console.log('Base URL:', this.api.defaults.baseURL);
      console.log('Config:', {
        domain: this.config.domain,
        email: this.config.email,
      });

      const response = await this.api.get('/myself');
      console.log('Connection test successful:', response.status);
      return true;
    } catch (error: any) {
      console.error('Connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      return false;
    }
  }

  // Test what endpoints are available
  async testEndpoints(): Promise<any> {
    const results: any = {};

    try {
      const myself = await this.api.get('/myself');
      results.myself = { status: 'success', data: myself.data };
    } catch (err) {
      results.myself = { status: 'error', error: err };
    }

    try {
      const projects = await this.api.get('/project');
      results.projects = { status: 'success', count: projects.data.length };
    } catch (err) {
      results.projects = { status: 'error', error: err };
    }

    try {
      const search = await this.api.get('/search', {
        params: { maxResults: 1, fields: 'summary' },
      });
      results.search = { status: 'success', count: search.data.total };
    } catch (err) {
      results.search = { status: 'error', error: err };
    }

    try {
      const boards = await this.api.get('/agile/1.0/board');
      results.boards = {
        status: 'success',
        count: boards.data.values?.length || 0,
      };
    } catch (err) {
      results.boards = { status: 'error', error: err };
    }

    console.log('API Endpoints Test Results:', results);
    return results;
  }

  // Get current user info
  async getMyself(): Promise<any> {
    try {
      console.log('🔍 Fetching current user info from Jira API...');
      const response = await this.api.get('/myself');
      console.log(
        '✅ User info fetched successfully:',
        response.data.displayName
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      throw error;
    }
  }

  // Get all projects
  async getProjects(): Promise<ProjectData[]> {
    try {
      console.log('🔍 Fetching projects from Jira API...');
      const response: AxiosResponse<ProjectData[]> = await this.api.get(
        '/project'
      );
      console.log(
        '✅ Projects fetched successfully:',
        response.data.length,
        'projects'
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      throw new Error(
        'Unable to fetch projects from Jira. Please check your connection and credentials.'
      );
    }
  }

  // Get a specific project by key
  async getProject(projectKey: string): Promise<ProjectData | null> {
    try {
      console.log(`📡 Fetching project ${projectKey} from Jira API...`);
      const response: AxiosResponse<ProjectData> = await this.api.get(
        `/project/${projectKey}`
      );
      console.log(`✅ Project ${projectKey} fetched successfully`);
      return response.data;
    } catch (error: any) {
      console.warn(
        `⚠️ Error fetching project ${projectKey}:`,
        error.response?.status
      );
      return null;
    }
  }

  // Get all boards - Fixed endpoint
  async getBoards(): Promise<BoardData[]> {
    try {
      console.log('📡 Fetching boards from Jira API...');

      // Try multiple board endpoints in order of preference
      const boardEndpoints = [
        '/board', // Standard endpoint
        '/agile/1.0/board', // Agile API endpoint
        '/board?maxResults=100', // With pagination
      ];

      for (const endpoint of boardEndpoints) {
        try {
          console.log(`📡 Trying board endpoint: ${endpoint}`);
          const response = await this.api.get(endpoint);

          if (
            response.data &&
            (response.data.values || response.data.results)
          ) {
            const boards = response.data.values || response.data.results || [];
            console.log(
              '✅ Boards fetched successfully:',
              boards.length,
              'boards'
            );
            return boards;
          }
        } catch (endpointError: any) {
          console.warn(
            `⚠️ Board endpoint ${endpoint} failed:`,
            endpointError.response?.status
          );
          continue;
        }
      }

      // If all board endpoints fail, return empty array
      console.warn('⚠️ All board endpoints failed, returning empty array');
      return [];
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
      // Return empty array instead of throwing error for sprints (optional feature)
      return [];
    }
  }

  // Get issues using JQL - Fixed with multiple strategies
  async getIssues(
    jql: string,
    startAt: number = 0,
    maxResults: number = 100
  ): Promise<JiraIssue[]> {
    try {
      console.log('📡 Fetching issues with JQL:', jql);

      // Try multiple search strategies in order of preference
      const searchStrategies = [
        // Strategy 1: API v3 search endpoint (preferred)
        {
          endpoint: '/search/jql',
          params: {
            jql,
            startAt,
            maxResults,
            fields:
              'summary,status,issuetype,priority,assignee,created,updated,project',
          },
        },
        // Strategy 2: API v3 with different field set
        {
          endpoint: '/search/jql',
          params: {
            jql,
            startAt,
            maxResults,
            fields: 'summary,status,issuetype,project',
          },
        },
        // Strategy 3: API v3 with minimal fields
        {
          endpoint: '/search/jql',
          params: {
            jql,
            startAt: Math.min(maxResults, 50), // Limit for problematic queries
            maxResults: Math.min(maxResults, 50),
            fields: 'summary,project',
          },
        },
      ];

      let issues: any[] = [];
      let lastError: any = null;

      for (const strategy of searchStrategies) {
        try {
          console.log(`📡 Trying search strategy: ${strategy.endpoint}`);
          const response = await this.api.get(strategy.endpoint, {
            params: strategy.params,
          });

          if (response.data && response.data.issues) {
            issues = response.data.issues;
            console.log(`✅ Search successful with ${issues.length} issues`);
            break;
          }
        } catch (strategyError: any) {
          console.warn(
            `⚠️ Search strategy failed:`,
            strategyError.response?.status
          );
          lastError = strategyError;
          continue;
        }
      }

      if (issues.length === 0) {
        console.warn('⚠️ No issues found with any search strategy');
        if (lastError) {
          console.error('❌ Last search error:', lastError);
        }
        return [];
      }

      // Filtrar issues baseado no acesso do usuário aos projetos
      const filteredIssues =
        projectAccessService.filterIssuesByUserAccess(issues);

      console.log('🔐 JiraApiService - Issues filtered by user access:', {
        originalCount: issues.length,
        filteredCount: filteredIssues.length,
        userProjects: projectAccessService.getUserProjects(),
        userEmail: projectAccessService.getUserEmail(),
        isInitialized: projectAccessService.isInitialized(),
      });

      // Validação adicional - se não há projetos configurados, retornar array vazio
      if (
        !projectAccessService.isInitialized() ||
        projectAccessService.getUserProjects().length === 0
      ) {
        console.warn(
          '🔐 JiraApiService - No user projects configured, returning empty array'
        );
        return [];
      }

      // Log detalhado dos projetos encontrados vs. acessíveis
      const allProjectKeys = [
        ...new Set(issues.map(issue => issue.fields.project.key)),
      ];
      const accessibleProjectKeys = [
        ...new Set(filteredIssues.map(issue => issue.fields.project.key)),
      ];
      const inaccessibleProjectKeys = allProjectKeys.filter(
        key => !projectAccessService.hasAccessToProject(key)
      );

      console.log('🔐 JiraApiService - Project analysis:', {
        allProjects: allProjectKeys,
        accessibleProjects: accessibleProjectKeys,
        inaccessibleProjects: inaccessibleProjectKeys,
        shouldShowOnly: projectAccessService.getUserProjects(),
      });

      return this.transformIssues(filteredIssues);
    } catch (error) {
      console.error('❌ Error fetching issues:', error);
      // Return empty array instead of throwing error to prevent app crashes
      console.warn('⚠️ Returning empty array due to search failure');
      return [];
    }
  }

  // Get issues for a specific sprint
  async getSprintIssues(sprintId: number): Promise<JiraIssue[]> {
    try {
      const response = await this.api.get(
        `/agile/1.0/sprint/${sprintId}/issue`,
        {
          params: {
            fields: [
              'summary',
              'status',
              'issuetype',
              'priority',
              'assignee',
              'created',
              'updated',
              'duedate',
              'customfield_10016',
              'labels',
              'project',
            ].join(','),
          },
        }
      );
      return response.data.issues;
    } catch (error) {
      console.error('Error fetching sprint issues:', error);
      throw error;
    }
  }

  // Transform raw Jira API response to our format
  private transformIssues(rawIssues: any[]): JiraIssue[] {
    return rawIssues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      fields: {
        summary: issue.fields.summary || 'No summary',
        status: {
          name: issue.fields.status?.name || 'Unknown',
          statusCategory: {
            name: issue.fields.status?.statusCategory?.name || 'To Do',
            colorName: issue.fields.status?.statusCategory?.colorName || 'blue',
          },
        },
        issuetype: {
          name: issue.fields.issuetype?.name || 'Task',
          iconUrl:
            issue.fields.issuetype?.iconUrl ||
            'https://jira.atlassian.com/images/icons/issuetypes/task.svg',
        },
        priority: {
          name: issue.fields.priority?.name || 'Medium',
          iconUrl:
            issue.fields.priority?.iconUrl ||
            'https://jira.atlassian.com/images/icons/priorities/medium.svg',
        },
        assignee: issue.fields.assignee
          ? {
              displayName: issue.fields.assignee.displayName || 'Unassigned',
              emailAddress: issue.fields.assignee.emailAddress || '',
              avatarUrls: issue.fields.assignee.avatarUrls || {
                '48x48': '/default-avatar.png',
              },
            }
          : null,
        created: issue.fields.created || new Date().toISOString(),
        updated: issue.fields.updated || new Date().toISOString(),
        project: {
          id: issue.fields.project?.id || 'UNKNOWN',
          key: issue.fields.project?.key || 'UNKNOWN',
          name: issue.fields.project?.name || 'Unknown Project',
        },
        duedate: issue.fields.duedate || null,
        labels: issue.fields.labels || [],
        sprint: issue.fields.sprint
          ? {
              id: issue.fields.sprint.id,
              name: issue.fields.sprint.name,
              state: issue.fields.sprint.state || 'active',
            }
          : undefined,
      },
    }));
  }

  // Get all issues (with pagination)
  async getAllIssues(): Promise<JiraIssue[]> {
    console.log('🔍 Attempting to fetch real issues from Jira API...');

    try {
      // Strategy 1: Try with API v2 without JQL
      try {
        console.log('📡 Trying API v2 without JQL...');
        const response = await this.api.get('/search', {
          params: {
            startAt: 0,
            maxResults: 50,
            fields:
              'summary,status,issuetype,priority,assignee,created,updated,project',
          },
        });

        const realIssues = response.data.issues || [];
        if (realIssues.length > 0) {
          console.log(
            `✅ Successfully fetched ${realIssues.length} real issues via API v2`
          );
          return this.transformIssues(realIssues);
        }
      } catch (searchError: any) {
        console.warn('⚠️ API v2 search failed:', searchError.message);
      }

      // Strategy 2: Try with API v3 without JQL
      try {
        console.log('📡 Trying API v3 without JQL...');
        const apiV3 = axios.create({
          baseURL: `/api/jira/rest/api/3`,
          headers: {
            Authorization: `Basic ${btoa(
              `${this.config.email}:${this.config.apiToken}`
            )}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const response = await apiV3.get('/search', {
          params: {
            startAt: 0,
            maxResults: 20,
            fields: 'summary,status,issuetype,project',
          },
        });

        const realIssues = response.data.issues || [];
        if (realIssues.length > 0) {
          console.log(
            `✅ Successfully fetched ${realIssues.length} real issues via API v3`
          );
          return this.transformIssues(realIssues);
        }
      } catch (v3Error: any) {
        console.warn('⚠️ API v3 search failed:', v3Error.message);
      }

      // If all strategies fail, return empty array instead of throwing error
      console.warn('⚠️ All search strategies failed, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ All attempts to fetch issues failed:', error);
      return [];
    }
  }

  // Common JQL queries
  getJqlQueries() {
    return {
      openIssues: 'status != Done AND status != Cancelled',
      closedIssues: 'status = Done OR status = Cancelled',
      currentMonthIssues:
        'created >= startOfMonth() AND created <= endOfMonth()',
      criticalIncidents:
        'type = Incident AND priority in (Highest, High) AND status != Done',
      activeSprintIssues: 'sprint in openSprints()',
      overdueIssues: 'due < now() AND status != Done',
      bugs: 'issuetype = Bug',
      stories: 'issuetype = Story',
      tasks: 'issuetype = Task',
      incidents: 'issuetype = Incident',
    };
  }
}

// Export singleton instance
export const jiraApi = new JiraApiService();

// ✅ FUNÇÃO PARA ATUALIZAR CREDENCIAIS APÓS LOGIN
export function reinitializeJiraApi(credentials: JiraApiConfig) {
  const newInstance = new JiraApiService(credentials);
  Object.assign(jiraApi, newInstance);
  console.log('✅ Jira API reinitialized with user credentials');
}

export { JiraApiService };
export default jiraApi;

import {
  FilterState,
  FilterOptions,
  FilteredData,
} from '../types/filters.types';
import { projectAccessService } from './projectAccessService';

const JIRA_DOMAIN = import.meta.env.VITE_JIRA_DOMAIN;
const EMAIL = import.meta.env.VITE_JIRA_EMAIL;
const API_TOKEN = import.meta.env.VITE_JIRA_API_TOKEN;

// Usar proxy do Vite para evitar problemas de CORS
const JIRA_BASE_URL = '/api/jira';

// Headers para autenticação
const getHeaders = () => ({
  Authorization: `Basic ${btoa(`${EMAIL}:${API_TOKEN}`)}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

/**
 * Carregar opções de filtros (Montagem do Componente)
 */
export async function loadFilterOptions(): Promise<FilterOptions> {
  console.log('🔍 Loading filter options...');
  console.log('📡 JIRA_DOMAIN:', JIRA_DOMAIN);
  console.log('📡 JIRA_BASE_URL:', JIRA_BASE_URL);
  console.log('📡 EMAIL:', EMAIL);
  console.log('📡 API_TOKEN length:', API_TOKEN?.length);

  // Validar variáveis de ambiente
  if (!JIRA_BASE_URL || !EMAIL || !API_TOKEN) {
    console.error('❌ Missing environment variables:', {
      JIRA_BASE_URL: !!JIRA_BASE_URL,
      EMAIL: !!EMAIL,
      API_TOKEN: !!API_TOKEN,
    });
    throw new Error('Variáveis de ambiente não configuradas corretamente');
  }

  console.log('✅ Environment variables validated');

  try {
    // Fazer chamadas paralelas para carregar todas as opções
    const [projectsRes, issueTypesRes, statusesRes, prioritiesRes, boardsRes] =
      await Promise.all([
        fetch(`${JIRA_BASE_URL}/rest/api/3/project`, { headers: getHeaders() }),
        fetch(`${JIRA_BASE_URL}/rest/api/3/issuetype`, {
          headers: getHeaders(),
        }),
        fetch(`${JIRA_BASE_URL}/rest/api/3/status`, { headers: getHeaders() }),
        fetch(`${JIRA_BASE_URL}/rest/api/3/priority`, {
          headers: getHeaders(),
        }),
        fetch(`${JIRA_BASE_URL}/rest/agile/1.0/board`, {
          headers: getHeaders(),
        }),
      ]);

    const [projects, issueTypes, statuses, priorities, boards] =
      await Promise.all([
        projectsRes.json(),
        issueTypesRes.json(),
        statusesRes.json(),
        prioritiesRes.json(),
        boardsRes.json(),
      ]);

    // Sprints: buscar do primeiro board ativo
    let sprints = [];
    if (boards.values && boards.values.length > 0) {
      const firstBoardId = boards.values[0].id;
      console.log('🔍 Trying to fetch sprints for board:', firstBoardId);
      try {
        const sprintsRes = await fetch(
          `${JIRA_BASE_URL}/rest/agile/1.0/board/${firstBoardId}/sprint`,
          { headers: getHeaders() }
        );

        if (!sprintsRes.ok) {
          console.warn(
            `⚠️ Sprint request failed: ${sprintsRes.status} ${sprintsRes.statusText}`
          );
          // Continuar sem sprints se falhar
        } else {
          const sprintsData = await sprintsRes.json();
          sprints = sprintsData.values || [];
          console.log('✅ Sprints loaded:', sprints.length);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch sprints:', error);
      }
    }

    // Assignees: buscar usuários ativos
    let assignees = [];
    try {
      const assigneesRes = await fetch(
        `${JIRA_BASE_URL}/rest/api/3/users/search?maxResults=100`,
        { headers: getHeaders() }
      );
      const assigneesData = await assigneesRes.json();
      assignees = assigneesData || [];
    } catch (error) {
      console.warn('⚠️ Could not fetch assignees:', error);
    }

    const filterOptions: FilterOptions = {
      projects: projects.map((p: any) => ({ key: p.key, name: p.name })),
      sprints: sprints.map((s: any) => ({
        id: s.id,
        name: s.name,
        state: s.state,
      })),
      issueTypes: issueTypes.map((it: any) => ({
        name: it.name,
        iconUrl: it.iconUrl,
      })),
      statuses: statuses.map((s: any) => ({
        name: s.name,
        category: s.statusCategory.name,
      })),
      assignees: assignees.map((a: any) => ({
        accountId: a.accountId,
        displayName: a.displayName,
        avatarUrl: a.avatarUrls?.['24x24'] || '',
      })),
      priorities: priorities.map((p: any) => ({
        name: p.name,
        iconUrl: p.iconUrl,
      })),
    };

    console.log('✅ Filter options loaded:', {
      projects: filterOptions.projects.length,
      sprints: filterOptions.sprints.length,
      issueTypes: filterOptions.issueTypes.length,
      statuses: filterOptions.statuses.length,
      assignees: filterOptions.assignees.length,
      priorities: filterOptions.priorities.length,
    });

    return filterOptions;
  } catch (error) {
    console.error('❌ Error loading filter options:', error);
    throw new Error(`Failed to load filter options: ${error}`);
  }
}

/**
 * Deduplica issues por ID
 */
function deduplicateById(issues: any[]): any[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  return issues.filter(issue => {
    if (seen.has(issue.id)) {
      duplicates.push(issue.key);
      return false;
    }
    seen.add(issue.id);
    return true;
  });
}

/**
 * Paginação segura com verificações duplas de fim
 */
async function fetchWithPaginationSafe(
  jql: string,
  maxPages: number = 10
): Promise<any[]> {
  let allIssues: any[] = [];
  let startAt = 0;
  let pageCount = 0;
  const maxResults = 100;

  console.log(
    `📡 Starting pagination: ${jql.substring(
      0,
      50
    )}... (limit: ${maxPages} pages)`
  );

  while (pageCount < maxPages) {
    try {
      pageCount++;

      const url = new URL(
        `${JIRA_BASE_URL}/rest/api/3/search/jql`,
        window.location.origin
      );
      url.searchParams.append('jql', jql);
      url.searchParams.append('maxResults', maxResults.toString());
      url.searchParams.append('startAt', startAt.toString());
      url.searchParams.append(
        'fields',
        'summary,status,issuetype,priority,assignee,created,updated,duedate,customfield_10016,project,sprint'
      );

      const response = await fetch(url.toString(), {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      const fetchedCount = data.issues?.length || 0;

      allIssues.push(...data.issues);

      // ⚡ LOGS CONCISOS: apenas a cada 5 páginas
      if (pageCount % 5 === 0 || pageCount === 1) {
        console.log(`  📄 Page ${pageCount}: ${allIssues.length} issues total`);
      }

      // VERIFICAÇÃO TRIPLA de fim de dados
      const hasMoreData = fetchedCount === maxResults;
      const isLastPage = data.isLast === true;
      const noNextToken = !data.nextPageToken;

      if (!hasMoreData || isLastPage || noNextToken) {
        console.log(`✅ Pagination complete: ${allIssues.length} issues`);
        break;
      }

      startAt += maxResults;
    } catch (error: any) {
      console.error(`❌ Error on page ${pageCount}:`, error.message);
      break;
    }
  }

  if (pageCount >= maxPages) {
    console.warn(
      `⚠️ Reached page limit (${maxPages}): ${allIssues.length} issues`
    );
  }

  return allIssues;
}

/**
 * Validar que todos os projetos selecionados estão presentes nos dados
 */
function validateProjectsInData(
  issues: any[],
  expectedProjects: string[]
): void {
  const projectsFound = [
    ...new Set(issues.map((i: any) => i.fields.project.key)),
  ];
  const projectsMissing = expectedProjects.filter(
    p => !projectsFound.includes(p)
  );

  console.log(`🔍 Validation:`, {
    expected: expectedProjects.join(', '),
    found: projectsFound.join(', '),
  });

  if (projectsMissing.length > 0) {
    console.error(`🚨 MISSING PROJECTS: ${projectsMissing.join(', ')}`);
  }

  // ⚡ LOG CONCISO: apenas contagem final
  projectsFound.forEach((projectKey: string) => {
    const count = issues.filter(
      (i: any) => i.fields.project.key === projectKey
    ).length;
    console.log(`   📊 ${projectKey}: ${count} issues`);
  });
}

/**
 * Buscar dados com fetch paralelo por projeto
 */
async function fetchDataByProjects(projectKeys: string[]): Promise<any[]> {
  console.log(`🔍 Fetching ${projectKeys.length} projects IN PARALLEL`);

  // ⚡ BUSCA PARALELA: ao invés de sequencial
  const projectPromises = projectKeys.map(async projectKey => {
    const jql = `project = "${projectKey}"`;
    console.log(`  ⏳ Starting: ${projectKey}`);

    try {
      const issues = await fetchWithPaginationSafe(jql, 10); // 10 páginas = 1000 issues
      console.log(`  ✅ ${projectKey}: ${issues.length} issues`);
      return issues;
    } catch (error: any) {
      console.error(`  ❌ Error: ${projectKey}: ${error.message}`);
      return [];
    }
  });

  // ⚡ AGUARDAR TODAS em paralelo
  console.log(`⏳ Waiting for all projects...`);
  const projectResults = await Promise.all(projectPromises);

  // Mesclar resultados
  const allIssues = projectResults.flat();

  console.log(
    `🔄 Merged: ${allIssues.length} issues from ${projectKeys.length} projects`
  );

  return allIssues;
}

/**
 * Construir JQL Dinamicamente
 */
export function buildJQLFromFilters(filters: FilterState): string {
  const conditions: string[] = [];

  // Usar apenas projetos selecionados manualmente
  const selectedProjects = projectAccessService.getUserProjects();
  console.log('🔍 buildJQLFromFilters - Debug info:', {
    selectedProjects,
    projectAccessInitialized: projectAccessService.isInitialized(),
    userEmail: projectAccessService.getUserEmail(),
    isManualSelection: projectAccessService.isManualSelection(),
  });

  if (selectedProjects.length > 0) {
    console.log(
      '🔍 buildJQLFromFilters - Using manually selected projects:',
      selectedProjects
    );
    console.log(
      '🔍 buildJQLFromFilters - Project count:',
      selectedProjects.length
    );

    // Garantir que múltiplos projetos sejam incluídos no JQL
    const projectCondition = `project in (${selectedProjects
      .map(p => `"${p}"`)
      .join(',')})`;

    console.log(
      '🔍 buildJQLFromFilters - Project condition:',
      projectCondition
    );
    console.log(
      '🔍 buildJQLFromFilters - Project condition length:',
      projectCondition.length
    );
    console.log(
      '🔍 buildJQLFromFilters - Multiple projects detected:',
      selectedProjects.length > 1
    );

    conditions.push(projectCondition);
  } else {
    console.warn(
      '🔍 buildJQLFromFilters - No projects selected, returning empty JQL'
    );
    return 'project in ("NONE")'; // JQL que não retorna nada
  }

  // Projetos do filtro (ignorados se há seleção manual)
  if (filters.projects.length > 0 && selectedProjects.length === 0) {
    conditions.push(`project in (${filters.projects.join(',')})`);
  }

  // Período
  if (filters.dateRange.start && filters.dateRange.end) {
    conditions.push(
      `created >= "${filters.dateRange.start}" AND created <= "${filters.dateRange.end}"`
    );
  } else if (filters.dateRange.start) {
    conditions.push(`created >= "${filters.dateRange.start}"`);
  } else if (filters.dateRange.end) {
    conditions.push(`created <= "${filters.dateRange.end}"`);
  }

  // Sprints
  if (filters.sprints.length > 0) {
    conditions.push(`sprint in (${filters.sprints.join(',')})`);
  }

  // Tipos de Issue
  if (filters.issueTypes.length > 0) {
    const escaped = filters.issueTypes.map(t => `"${t}"`).join(',');
    conditions.push(`issuetype in (${escaped})`);
  }

  // Status
  if (filters.statuses.length > 0) {
    const escaped = filters.statuses.map(s => `"${s}"`).join(',');
    conditions.push(`status in (${escaped})`);
  }

  // Assignees
  if (filters.assignees.length > 0) {
    conditions.push(`assignee in (${filters.assignees.join(',')})`);
  }

  // Prioridades
  if (filters.priorities.length > 0) {
    const escaped = filters.priorities.map(p => `"${p}"`).join(',');
    conditions.push(`priority in (${escaped})`);
  }

  // Se não há filtros, retornar query padrão para não trazer tudo
  if (conditions.length === 0) {
    return 'created >= -90d'; // Últimos 90 dias por padrão
  }

  const jql = conditions.join(' AND ');
  console.log('🔍 Built JQL:', jql);
  console.log('🔍 JQL Debug Info:', {
    selectedProjects,
    conditions,
    finalJQL: jql,
    projectAccessInitialized: projectAccessService.isInitialized(),
    isManualSelection: projectAccessService.isManualSelection(),
    multipleProjectsSelected: selectedProjects.length > 1,
    expectedTotalIssues:
      selectedProjects.length > 1
        ? 'Should aggregate data from multiple projects'
        : 'Single project data',
  });
  return jql;
}

/**
 * Carregar dados filtrados
 */
export async function fetchFilteredData(
  filters: FilterState
): Promise<FilteredData> {
  // Validar variáveis de ambiente
  if (!JIRA_BASE_URL || !EMAIL || !API_TOKEN) {
    throw new Error('Variáveis de ambiente não configuradas corretamente');
  }

  console.log('====================================');
  console.log('⏳ fetchFilteredData START');
  console.log('====================================');

  const selectedProjects = projectAccessService.getUserProjects();
  console.log(`📋 Projects: ${selectedProjects.join(', ')}`);

  if (selectedProjects.length === 0) {
    console.warn('⚠️ No projects selected');
    return { issues: [], total: 0, fetched: 0 };
  }

  let allIssues: any[] = [];

  try {
    // ✅ SOLUÇÃO: Fetch paralelo por projeto
    if (selectedProjects.length > 1) {
      console.log('🟡 Multiple projects - using parallel fetch');
      allIssues = await fetchDataByProjects(selectedProjects);
    } else {
      console.log('🟢 Single project - using direct JQL');
      const jql = buildJQLFromFilters(filters);
      allIssues = await fetchWithPaginationSafe(jql, 10);
    }

    // ⚡ DEDUPLICAÇÃO RÁPIDA
    const duplicateCount =
      allIssues.length - new Set(allIssues.map(i => i.id)).size;

    if (duplicateCount > 0) {
      console.log(`🔄 Deduplicating: removing ${duplicateCount} duplicates`);
      allIssues = deduplicateById(allIssues);
    }

    // ⚡ VALIDAÇÃO RÁPIDA
    validateProjectsInData(allIssues, selectedProjects);

    console.log(`✅ SUCCESS: ${allIssues.length} issues`);
    console.log('====================================\n');

    return {
      issues: allIssues,
      total: allIssues.length,
      fetched: allIssues.length,
    };
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error('====================================\n');
    throw error;
  }
}

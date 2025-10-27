import axios from 'axios';

// Usar a mesma configuração que está funcionando no sistema
const JIRA_CONFIG = {
  domain: 'superlogica.atlassian.net',
  email: 'anderson.nasario@superlogica.com',
  apiToken: 'ATATT3xFfGF0r8Q...', // Token real do sistema
};

const api = axios.create({
  baseURL: `https://${JIRA_CONFIG.domain}/rest/api/3`,
  auth: {
    username: JIRA_CONFIG.email,
    password: JIRA_CONFIG.apiToken,
  },
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

async function quickAnalyze() {
  console.log('🔍 ANÁLISE RÁPIDA DOS DADOS DO JIRA');
  console.log('='.repeat(50));

  try {
    // Testar com JQL que sabemos que funciona
    const jql = 'project in ("INFOSECC", "SEGP")';
    console.log(`🔍 JQL: ${jql}`);

    const response = await api.get('/search/jql', {
      params: {
        jql: jql,
        maxResults: 1000,
        fields: 'summary,status,issuetype,assignee,project',
      },
    });

    const issues = response.data.issues;
    console.log(`📊 Total de Issues encontradas: ${issues.length}`);

    // Análise por projeto
    const projectAnalysis = {};
    issues.forEach(issue => {
      const projectKey = issue.fields.project.key;
      if (!projectAnalysis[projectKey]) {
        projectAnalysis[projectKey] = {
          totalIssues: 0,
          users: new Set(),
          statusCount: {},
          typeCount: {},
        };
      }

      projectAnalysis[projectKey].totalIssues++;

      if (issue.fields.assignee) {
        projectAnalysis[projectKey].users.add(
          issue.fields.assignee.displayName
        );
      }

      const status = issue.fields.status.name;
      projectAnalysis[projectKey].statusCount[status] =
        (projectAnalysis[projectKey].statusCount[status] || 0) + 1;

      const type = issue.fields.issuetype.name;
      projectAnalysis[projectKey].typeCount[type] =
        (projectAnalysis[projectKey].typeCount[type] || 0) + 1;
    });

    // Exibir resultados
    Object.entries(projectAnalysis).forEach(([projectKey, data]) => {
      console.log(`\n📋 Projeto: ${projectKey}`);
      console.log(`  Total Issues: ${data.totalIssues}`);
      console.log(`  Total Usuários: ${data.users.size}`);
      console.log(`  Usuários: ${Array.from(data.users).join(', ')}`);

      console.log(`\n  📈 Issues por Status:`);
      Object.entries(data.statusCount).forEach(([status, count]) => {
        console.log(`    ${status}: ${count}`);
      });

      console.log(`\n  📋 Issues por Tipo:`);
      Object.entries(data.typeCount).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });
    });

    // Análise agregada
    console.log(`\n🔄 ANÁLISE AGREGADA`);
    console.log('='.repeat(30));

    const totalIssues = Object.values(projectAnalysis).reduce(
      (sum, data) => sum + data.totalIssues,
      0
    );
    const allUsers = new Set();
    Object.values(projectAnalysis).forEach(data => {
      data.users.forEach(user => allUsers.add(user));
    });

    console.log(`📊 Total Issues (Agregado): ${totalIssues}`);
    console.log(`👥 Total Usuários Únicos: ${allUsers.size}`);
    console.log(`👥 Usuários: ${Array.from(allUsers).join(', ')}`);

    // Status agregado
    const allStatusCount = {};
    Object.values(projectAnalysis).forEach(data => {
      Object.entries(data.statusCount).forEach(([status, count]) => {
        allStatusCount[status] = (allStatusCount[status] || 0) + count;
      });
    });

    console.log(`\n📈 Issues por Status (Agregado):`);
    Object.entries(allStatusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Tipos agregados
    const allTypeCount = {};
    Object.values(projectAnalysis).forEach(data => {
      Object.entries(data.typeCount).forEach(([type, count]) => {
        allTypeCount[type] = (allTypeCount[type] || 0) + count;
      });
    });

    console.log(`\n📋 Issues por Tipo (Agregado):`);
    Object.entries(allTypeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

quickAnalyze();

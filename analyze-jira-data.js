import axios from 'axios';

// Configuração do Jira
const JIRA_CONFIG = {
  domain: 'superlogica.atlassian.net',
  email: 'anderson.nasario@superlogica.com',
  apiToken: process.env.JIRA_API_TOKEN || 'ATATT3xFfGF0...', // Use seu token real
};

const api = axios.create({
  baseURL: `https://${JIRA_CONFIG.domain}/rest/api/2`,
  auth: {
    username: JIRA_CONFIG.email,
    password: JIRA_CONFIG.apiToken,
  },
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

async function analyzeProject(projectKey) {
  console.log(`\n🔍 Analisando projeto: ${projectKey}`);
  console.log('='.repeat(50));

  try {
    // 1. Buscar todas as issues do projeto
    const jql = `project = "${projectKey}"`;
    const response = await api.get('/search', {
      params: {
        jql: jql,
        maxResults: 1000,
        fields: 'summary,status,issuetype,assignee,project',
      },
    });

    const issues = response.data.issues;
    console.log(`📊 Total de Issues: ${issues.length}`);

    // 2. Análise por Status
    const statusCount = {};
    const statusDetails = {};

    issues.forEach(issue => {
      const status = issue.fields.status.name;
      if (!statusCount[status]) {
        statusCount[status] = 0;
        statusDetails[status] = [];
      }
      statusCount[status]++;
      statusDetails[status].push({
        key: issue.key,
        summary: issue.fields.summary,
        assignee: issue.fields.assignee?.displayName || 'Não atribuído',
      });
    });

    console.log('\n📈 Issues por Status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // 3. Análise por Tipo
    const typeCount = {};
    issues.forEach(issue => {
      const type = issue.fields.issuetype.name;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    console.log('\n📋 Issues por Tipo:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 4. Análise por Usuário
    const userIssues = {};
    const userDetails = {};

    issues.forEach(issue => {
      const assignee = issue.fields.assignee;
      if (assignee) {
        const userKey = assignee.displayName;
        if (!userIssues[userKey]) {
          userIssues[userKey] = 0;
          userDetails[userKey] = {
            email: assignee.emailAddress,
            totalIssues: 0,
            byStatus: {},
            byType: {},
          };
        }
        userIssues[userKey]++;
        userDetails[userKey].totalIssues++;

        // Por status
        const status = issue.fields.status.name;
        userDetails[userKey].byStatus[status] =
          (userDetails[userKey].byStatus[status] || 0) + 1;

        // Por tipo
        const type = issue.fields.issuetype.name;
        userDetails[userKey].byType[type] =
          (userDetails[userKey].byType[type] || 0) + 1;
      }
    });

    console.log('\n👥 Issues por Usuário:');
    Object.entries(userIssues).forEach(([user, count]) => {
      console.log(`  ${user}: ${count} issues`);
    });

    console.log(
      `\n👥 Total de Usuários Únicos: ${Object.keys(userIssues).length}`
    );

    // 5. Resumo
    const totalIssues = issues.length;
    const totalUsers = Object.keys(userIssues).length;
    const totalStatuses = Object.keys(statusCount).length;
    const totalTypes = Object.keys(typeCount).length;

    console.log('\n📊 Resumo do Projeto:');
    console.log(`  Total Issues: ${totalIssues}`);
    console.log(`  Total Usuários: ${totalUsers}`);
    console.log(`  Total Status: ${totalStatuses}`);
    console.log(`  Total Tipos: ${totalTypes}`);

    return {
      projectKey,
      totalIssues,
      totalUsers,
      issues,
      statusCount,
      typeCount,
      userIssues,
      userDetails,
    };
  } catch (error) {
    console.error(`❌ Erro ao analisar projeto ${projectKey}:`, error.message);
    return null;
  }
}

async function analyzeMultipleProjects(projectKeys) {
  console.log('🚀 Iniciando análise de múltiplos projetos...');
  console.log(`📋 Projetos: ${projectKeys.join(', ')}`);

  const results = [];

  for (const projectKey of projectKeys) {
    const result = await analyzeProject(projectKey);
    if (result) {
      results.push(result);
    }
  }

  // Análise agregada
  if (results.length > 1) {
    console.log('\n🔄 ANÁLISE AGREGADA (Múltiplos Projetos)');
    console.log('='.repeat(60));

    const aggregatedData = {
      totalIssues: 0,
      totalUsers: new Set(),
      allStatusCount: {},
      allTypeCount: {},
      allUserIssues: {},
      allUserDetails: {},
    };

    results.forEach(result => {
      aggregatedData.totalIssues += result.totalIssues;

      // Usuários únicos
      Object.keys(result.userIssues).forEach(user => {
        aggregatedData.totalUsers.add(user);
      });

      // Status agregados
      Object.entries(result.statusCount).forEach(([status, count]) => {
        aggregatedData.allStatusCount[status] =
          (aggregatedData.allStatusCount[status] || 0) + count;
      });

      // Tipos agregados
      Object.entries(result.typeCount).forEach(([type, count]) => {
        aggregatedData.allTypeCount[type] =
          (aggregatedData.allTypeCount[type] || 0) + count;
      });

      // Usuários agregados
      Object.entries(result.userIssues).forEach(([user, count]) => {
        if (!aggregatedData.allUserIssues[user]) {
          aggregatedData.allUserIssues[user] = 0;
          aggregatedData.allUserDetails[user] = {
            totalIssues: 0,
            byStatus: {},
            byType: {},
            projects: [],
          };
        }
        aggregatedData.allUserIssues[user] += count;
        aggregatedData.allUserDetails[user].totalIssues += count;
        aggregatedData.allUserDetails[user].projects.push(result.projectKey);
      });
    });

    console.log(`📊 Total Issues (Agregado): ${aggregatedData.totalIssues}`);
    console.log(`👥 Total Usuários Únicos: ${aggregatedData.totalUsers.size}`);

    console.log('\n📈 Issues por Status (Agregado):');
    Object.entries(aggregatedData.allStatusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n📋 Issues por Tipo (Agregado):');
    Object.entries(aggregatedData.allTypeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\n👥 Issues por Usuário (Agregado):');
    Object.entries(aggregatedData.allUserIssues).forEach(([user, count]) => {
      const details = aggregatedData.allUserDetails[user];
      console.log(
        `  ${user}: ${count} issues (Projetos: ${details.projects.join(', ')})`
      );
    });
  }

  return results;
}

// Executar análise
async function main() {
  try {
    console.log('🔍 ANÁLISE COMPLETA DOS DADOS DO JIRA');
    console.log('='.repeat(60));

    // Analisar projetos individuais
    const infoseccData = await analyzeProject('INFOSECC');
    const segpData = await analyzeProject('SEGP');

    // Analisar múltiplos projetos
    if (infoseccData && segpData) {
      await analyzeMultipleProjects(['INFOSECC', 'SEGP']);
    }

    console.log('\n✅ Análise concluída!');
  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

main();

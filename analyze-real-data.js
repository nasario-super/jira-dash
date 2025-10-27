import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Usar as credenciais reais do .env
const JIRA_CONFIG = {
  domain: process.env.VITE_JIRA_DOMAIN || 'superlogica.atlassian.net',
  email: process.env.VITE_JIRA_EMAIL || 'anderson.nasario@superlogica.com',
  apiToken: process.env.VITE_JIRA_API_TOKEN || '',
};

console.log('🔍 ANÁLISE REAL DOS DADOS DO JIRA');
console.log('='.repeat(50));
console.log(`📡 Domain: ${JIRA_CONFIG.domain}`);
console.log(`📧 Email: ${JIRA_CONFIG.email}`);
console.log(`🔑 Token: ${JIRA_CONFIG.apiToken.substring(0, 20)}...`);

// Configurar API
const api = axios.create({
  baseURL: `https://${JIRA_CONFIG.domain}/rest/api/3`,
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function analyzeProject(projectKey) {
  console.log(`\n🔍 Analisando projeto: ${projectKey}`);
  console.log('='.repeat(50));

  try {
    // Buscar todas as issues do projeto
    const jql = `project = "${projectKey}"`;
    console.log(`🔍 JQL: ${jql}`);

    const response = await api.get('/search/jql', {
      params: {
        jql: jql,
        maxResults: 1000,
        fields:
          'summary,status,issuetype,assignee,project,created,updated,priority',
      },
    });

    const issues = response.data.issues;
    console.log(`📊 Total de Issues: ${issues.length}`);

    if (issues.length === 0) {
      console.log('⚠️ Nenhuma issue encontrada para este projeto');
      return null;
    }

    // Análise por Status
    const statusCount = {};
    issues.forEach(issue => {
      const status = issue.fields.status.name;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    console.log('\n📈 Issues por Status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Análise por Tipo
    const typeCount = {};
    issues.forEach(issue => {
      const type = issue.fields.issuetype.name;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    console.log('\n📋 Issues por Tipo:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // Análise por Usuário
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

    // Resumo
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
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    return null;
  }
}

async function analyzeMultipleProjects(projectKeys) {
  console.log('\n🔄 ANÁLISE DE MÚLTIPLOS PROJETOS');
  console.log('='.repeat(60));
  console.log(`📋 Projetos: ${projectKeys.join(', ')}`);

  const results = [];

  for (const projectKey of projectKeys) {
    const result = await analyzeProject(projectKey);
    if (result) {
      results.push(result);
    }
  }

  // Análise agregada
  if (results.length > 0) {
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

    // Comparação com dados do dashboard
    console.log('\n🔍 COMPARAÇÃO COM DASHBOARD:');
    console.log('='.repeat(40));
    console.log(`📊 Total Issues (Real): ${aggregatedData.totalIssues}`);
    console.log(`📊 Total Issues (Dashboard): 100`);
    console.log(`📊 Diferença: ${aggregatedData.totalIssues - 100}`);

    console.log(
      `\n👥 Total Usuários (Real): ${aggregatedData.totalUsers.size}`
    );
    console.log(`👥 Total Usuários (Dashboard): 8`);
    console.log(`👥 Diferença: ${aggregatedData.totalUsers.size - 8}`);
  }

  return results;
}

// Executar análise
async function main() {
  try {
    console.log('🚀 Iniciando análise com credenciais reais...');

    // Analisar projetos individuais
    const infoseccData = await analyzeProject('INFOSECC');
    const segpData = await analyzeProject('SEGP');

    // Analisar múltiplos projetos
    if (infoseccData || segpData) {
      const validProjects = [];
      if (infoseccData) validProjects.push('INFOSECC');
      if (segpData) validProjects.push('SEGP');

      if (validProjects.length > 1) {
        await analyzeMultipleProjects(validProjects);
      }
    }

    console.log('\n✅ Análise concluída!');
  } catch (error) {
    console.error('❌ Erro na análise:', error);
  }
}

main();

import axios from 'axios';

// SUBSTITUA PELO SEU TOKEN REAL
const JIRA_DOMAIN = 'superlogica.atlassian.net';
const JIRA_EMAIL = 'anderson.nasario@superlogica.com';
const JIRA_API_TOKEN = 'SUBSTITUA_PELO_SEU_TOKEN_AQUI';

const baseURL = `https://${JIRA_DOMAIN}`;

const api = axios.create({
  baseURL: `${baseURL}/rest/api/3`,
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${JIRA_EMAIL}:${JIRA_API_TOKEN}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function quickTest() {
  console.log('🚀 TESTE RÁPIDO - DADOS REAIS DO JIRA');
  console.log('='.repeat(50));

  if (JIRA_API_TOKEN === 'SUBSTITUA_PELO_SEU_TOKEN_AQUI') {
    console.log('❌ ERRO: Substitua o token no arquivo!');
    return;
  }

  const tests = [
    { name: '👤 Usuário', endpoint: '/myself' },
    { name: '📁 Projetos', endpoint: '/project' },
    {
      name: '🔍 Issues (JQL)',
      endpoint: '/search/jql',
      params: { jql: 'ORDER BY updated DESC', maxResults: 20 },
    },
    {
      name: '👥 Usuários',
      endpoint: '/user/search',
      params: { query: 'a', maxResults: 20 },
    },
    { name: '📋 Tipos', endpoint: '/issuetype' },
    { name: '📊 Status', endpoint: '/status' },
  ];

  const results = {};

  for (const test of tests) {
    try {
      const response = await api.get(test.endpoint, { params: test.params });
      const data = response.data;

      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data.values) {
        count = data.values.length;
      } else if (data.issues) {
        count = data.issues.length;
      }

      results[test.name] = { success: true, count, data };
      console.log(`✅ ${test.name}: ${count} itens`);
    } catch (error) {
      results[test.name] = { success: false, error: error.response?.status };
      console.log(`❌ ${test.name}: Erro ${error.response?.status}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 COMPARAÇÃO COM DASHBOARD:');
  console.log('='.repeat(50));

  const dashboardData = {
    'Total Issues': 45,
    Projetos: 88,
    Sprints: 0,
  };

  console.log('DASHBOARD ATUAL:');
  Object.entries(dashboardData).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('\nDADOS REAIS DO JIRA:');
  console.log(`  Projetos: ${results['📁 Projetos']?.count || 0}`);
  console.log(`  Issues: ${results['🔍 Issues (JQL)']?.count || 0}`);
  console.log(`  Usuários: ${results['👥 Usuários']?.count || 0}`);
  console.log(`  Tipos: ${results['📋 Tipos']?.count || 0}`);
  console.log(`  Status: ${results['📊 Status']?.count || 0}`);

  if (results['👥 Usuários']?.success && results['👥 Usuários'].data) {
    console.log('\n👥 USUÁRIOS REAIS ENCONTRADOS:');
    results['👥 Usuários'].data.slice(0, 10).forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.displayName} (${user.emailAddress})`);
    });
  }

  if (
    results['🔍 Issues (JQL)']?.success &&
    results['🔍 Issues (JQL)'].data?.issues
  ) {
    console.log('\n📋 ISSUES REAIS ENCONTRADAS:');
    const issues = results['🔍 Issues (JQL)'].data.issues;
    const statusCount = {};
    const userCount = {};

    issues.forEach(issue => {
      const status = issue.fields?.status?.name || 'Unknown';
      const user = issue.fields?.assignee?.displayName || 'Unassigned';
      statusCount[status] = (statusCount[status] || 0) + 1;
      userCount[user] = (userCount[user] || 0) + 1;
    });

    console.log('  Por Status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`    ${status}: ${count}`);
    });

    console.log('  Por Usuário:');
    Object.entries(userCount).forEach(([user, count]) => {
      console.log(`    ${user}: ${count}`);
    });
  }

  console.log('='.repeat(50));
}

quickTest().catch(console.error);

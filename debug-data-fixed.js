import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const domain = process.env.VITE_JIRA_DOMAIN;
const email = process.env.VITE_JIRA_EMAIL;
const token = process.env.VITE_JIRA_API_TOKEN;

if (!domain || !email || !token) {
  console.error('❌ Credenciais faltando em .env');
  process.exit(1);
}

const api = axios.create({
  baseURL: `https://${domain}/rest/api/3`,
  auth: {
    username: email,
    password: token,
  },
});

async function countIssuesByProject() {
  console.log('\n📊 CONTANDO ISSUES POR PROJETO...\n');

  try {
    const jqlInfosecc = 'project = "INFOSECC"';
    const jqlSegp = 'project = "SEGP"';

    const [responseInfosecc, responseSegp] = await Promise.all([
      api.get('/search/jql', {
        params: { jql: jqlInfosecc, maxResults: 1 },
      }),
      api.get('/search/jql', {
        params: { jql: jqlSegp, maxResults: 1 },
      }),
    ]);

    const infoCount = responseInfosecc.data.total || 0;
    const segpCount = responseSegp.data.total || 0;

    console.log(`📁 INFOSECC: ${infoCount} issues`);
    console.log(`📁 SEGP: ${segpCount} issues`);
    console.log(`\n📊 TOTAL: ${infoCount + segpCount} issues`);

    return { infosecc: infoCount, segp: segpCount, total: infoCount + segpCount };
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function countDistinctUsers() {
  console.log('\n\n👤 CONTANDO USUÁRIOS...\n');

  try {
    // Buscar todas issues (sem limite de assignee específico)
    const response = await api.get('/search/jql', {
      params: {
        jql: 'project in ("INFOSECC", "SEGP")',
        fields: 'assignee',
        maxResults: 1000,
      },
    });

    const usersSet = new Set();

    response.data.issues.forEach(issue => {
      if (issue.fields.assignee?.displayName) {
        usersSet.add(issue.fields.assignee.displayName);
      }
    });

    console.log(`✅ USUÁRIOS ÚNICOS: ${usersSet.size}\n`);
    console.log('Lista de usuários:');
    Array.from(usersSet)
      .sort()
      .forEach((user, i) => {
        console.log(`  ${i + 1}. ${user}`);
      });

    return Array.from(usersSet);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   DEBUG: INVESTIGAÇÃO DE DISCREPÂNCIA DE DADOS             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    const projectCounts = await countIssuesByProject();
    const users = await countDistinctUsers();

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    COMPARAÇÃO FINAL                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 RESUMO:');
    console.log(`  ✓ Usuários ÚNICOS que têm issues: ${users.length}`);
    console.log(`  ✓ Issues INFOSECC: ${projectCounts.infosecc}`);
    console.log(`  ✓ Issues SEGP: ${projectCounts.segp}`);
    console.log(`  ✓ Issues TOTAL: ${projectCounts.total}`);

    console.log('\n🔍 ANÁLISE:');
    console.log(`  • Você mencionou: 11 usuários exibidos no dashboard`);
    console.log(`  • Realidade: ${users.length} usuários ÚNICOS têm issues`);
    console.log(`  • Diferença: ${users.length - 11} usuários a mais`);

    console.log(`\n💡 POSSÍVEIS CAUSAS:`);
    console.log(`  • Filtro removendo usuários sem issues (OK)`);
    console.log(`  • Limite máximo de 8 usuários no dashboard`);
    console.log(`  • Usuários sem nome completo (emails)`);
    console.log(`  • Issues não atribuídas a ninguém`);

    console.log('\n');
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();

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

async function getAllUsers() {
  console.log('\n📋 CONTANDO USUÁRIOS...\n');
  
  try {
    // Buscar issues de INFOSECC
    const jqlInfosecc = 'project = "INFOSECC"';
    const responseInfosecc = await api.get('/search/jql', {
      params: {
        jql: jqlInfosecc,
        fields: 'assignee,reporter',
        maxResults: 1000,
      },
    });

    // Buscar issues de SEGP
    const jqlSegp = 'project = "SEGP"';
    const responseSegp = await api.get('/search/jql', {
      params: {
        jql: jqlSegp,
        fields: 'assignee,reporter',
        maxResults: 1000,
      },
    });

    const usersSet = new Set();

    // Adicionar usuários de INFOSECC
    responseInfosecc.data.issues.forEach(issue => {
      if (issue.fields.assignee?.displayName) {
        usersSet.add(issue.fields.assignee.displayName);
      }
      if (issue.fields.reporter?.displayName) {
        usersSet.add(issue.fields.reporter.displayName);
      }
    });

    // Adicionar usuários de SEGP
    responseSegp.data.issues.forEach(issue => {
      if (issue.fields.assignee?.displayName) {
        usersSet.add(issue.fields.assignee.displayName);
      }
      if (issue.fields.reporter?.displayName) {
        usersSet.add(issue.fields.reporter.displayName);
      }
    });

    console.log('✅ USUÁRIOS ÚNICOS ENCONTRADOS:', usersSet.size);
    console.log('\nLista de usuários:');
    Array.from(usersSet)
      .sort()
      .forEach((user, i) => {
        console.log(`  ${i + 1}. ${user}`);
      });

    return Array.from(usersSet);
  } catch (error) {
    console.error('❌ Erro ao contar usuários:', error.message);
    throw error;
  }
}

async function countIssuesByProject() {
  console.log('\n\n📊 CONTANDO ISSUES POR PROJETO...\n');

  try {
    // INFOSECC
    const jqlInfosecc = 'project = "INFOSECC"';
    const responseInfosecc = await api.get('/search/jql', {
      params: {
        jql: jqlInfosecc,
        maxResults: 1,
      },
    });

    // SEGP
    const jqlSegp = 'project = "SEGP"';
    const responseSegp = await api.get('/search/jql', {
      params: {
        jql: jqlSegp,
        maxResults: 1,
      },
    });

    const infoCount = responseInfosecc.data.total;
    const segpCount = responseSegp.data.total;

    console.log(`📁 INFOSECC: ${infoCount} issues`);
    console.log(`📁 SEGP: ${segpCount} issues`);
    console.log(`\n📊 TOTAL: ${infoCount + segpCount} issues`);

    return { infosecc: infoCount, segp: segpCount, total: infoCount + segpCount };
  } catch (error) {
    console.error('❌ Erro ao contar issues:', error.message);
    throw error;
  }
}

async function countIssuesByUser(users) {
  console.log('\n\n👤 CONTANDO ISSUES POR USUÁRIO...\n');

  try {
    const userCounts = {};
    let totalIssuesSum = 0;

    for (const user of users) {
      const jql = `assignee = "${user}"`;
      const response = await api.get('/search/jql', {
        params: {
          jql,
          maxResults: 1,
        },
      });

      const count = response.data.total;
      userCounts[user] = count;
      totalIssuesSum += count;

      console.log(`  ${user}: ${count} issues`);
    }

    console.log(`\n📊 TOTAL ISSUES (somatória dos usuários): ${totalIssuesSum}`);

    return { userCounts, total: totalIssuesSum };
  } catch (error) {
    console.error('❌ Erro ao contar issues por usuário:', error.message);
    throw error;
  }
}

async function main() {
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║   DEBUG: INVESTIGAÇÃO DE DISCREPÂNCIA DE DADOS          ║');
  console.log('╚═════════════════════════════════════════════════════════╝');

  try {
    // 1. Contar usuários
    const users = await getAllUsers();

    // 2. Contar issues por projeto
    const projectCounts = await countIssuesByProject();

    // 3. Contar issues por usuário
    const userCounts = await countIssuesByUser(users);

    // 4. Comparação
    console.log('\n\n╔═════════════════════════════════════════════════════════╗');
    console.log('║                    COMPARAÇÃO FINAL                     ║');
    console.log('╚═════════════════════════════════════════════════════════╝\n');

    console.log('📊 RESUMO:');
    console.log(`  ✓ Usuários únicos: ${users.length}`);
    console.log(`  ✓ Issues INFOSECC: ${projectCounts.infosecc}`);
    console.log(`  ✓ Issues SEGP: ${projectCounts.segp}`);
    console.log(`  ✓ Issues Total (projetos): ${projectCounts.total}`);
    console.log(`  ✓ Issues Total (usuários): ${userCounts.total}`);

    // Verificar discrepâncias
    console.log('\n🔍 ANÁLISE DE DISCREPÂNCIAS:');

    if (userCounts.total !== projectCounts.total) {
      const diff = Math.abs(userCounts.total - projectCounts.total);
      console.log(`  ⚠️  DIFERENÇA ENCONTRADA: ${diff} issues`);
      console.log(`      Issues por projeto: ${projectCounts.total}`);
      console.log(`      Issues por usuário: ${userCounts.total}`);
    } else {
      console.log(`  ✅ OK: Números batem!`);
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

main();

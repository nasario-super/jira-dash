import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const domain = process.env.VITE_JIRA_DOMAIN;
const email = process.env.VITE_JIRA_EMAIL;
const token = process.env.VITE_JIRA_API_TOKEN;

const api = axios.create({
  baseURL: `https://${domain}/rest/api/3`,
  auth: { username: email, password: token },
});

async function test() {
  console.log('\n🔍 TESTANDO RESPOSTA DA API\n');

  try {
    // Teste 1: INFOSECC
    console.log('📝 Teste 1: project = "INFOSECC"\n');
    const r1 = await api.get('/search/jql', {
      params: { jql: 'project = "INFOSECC"', maxResults: 5 },
    });
    console.log(`Total: ${r1.data.total}`);
    console.log(`Issues retornadas: ${r1.data.issues.length}`);
    if (r1.data.issues.length > 0) {
      console.log(`Primeira issue: ${r1.data.issues[0].key}`);
    }

    // Teste 2: SEGP
    console.log('\n📝 Teste 2: project = "SEGP"\n');
    const r2 = await api.get('/search/jql', {
      params: { jql: 'project = "SEGP"', maxResults: 5 },
    });
    console.log(`Total: ${r2.data.total}`);
    console.log(`Issues retornadas: ${r2.data.issues.length}`);
    if (r2.data.issues.length > 0) {
      console.log(`Primeira issue: ${r2.data.issues[0].key}`);
    }

    // Teste 3: Ambos
    console.log('\n📝 Teste 3: project in ("INFOSECC", "SEGP")\n');
    const r3 = await api.get('/search/jql', {
      params: { jql: 'project in ("INFOSECC", "SEGP")', maxResults: 5 },
    });
    console.log(`Total: ${r3.data.total}`);
    console.log(`Issues retornadas: ${r3.data.issues.length}`);
    r3.data.issues.forEach(issue => {
      console.log(`  • ${issue.key}`);
    });

    // Teste 4: Verificar se tem paginação
    console.log('\n📝 Teste 4: Verificando estrutura de resposta\n');
    console.log('Campos disponíveis na resposta:');
    console.log(Object.keys(r3.data));
    console.log('\nTotal field:', r3.data.total);
    console.log('StartAt field:', r3.data.startAt);
    console.log('MaxResults field:', r3.data.maxResults);
    console.log('IsLast field:', r3.data.isLast);

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

test();

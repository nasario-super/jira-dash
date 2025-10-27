import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_DOMAIN = process.env.VITE_JIRA_DOMAIN;
const EMAIL = process.env.VITE_JIRA_EMAIL;
const API_TOKEN = process.env.VITE_JIRA_API_TOKEN;

const axiosInstance = axios.create({
  baseURL: `https://${JIRA_DOMAIN}`,
  auth: {
    username: EMAIL,
    password: API_TOKEN,
  },
});

async function countAllIssues(projectKey) {
  try {
    console.log(`\n🧪 Contando TODOS os issues de ${projectKey} (sem limite)...`);
    console.log('=====================================');

    let page = 0;
    let startAt = 0;
    let totalIssues = 0;
    let isLastPage = false;

    const jql = `project = "${projectKey}"`;
    const maxResults = 100;

    while (!isLastPage) {
      page++;

      try {
        const response = await axiosInstance.get('/rest/api/3/search/jql', {
          params: {
            jql,
            startAt,
            maxResults,
            fields: 'summary,project',
          },
        });

        const issues = response.data.issues || [];
        isLastPage = response.data.isLast === true;
        const responseTotal = response.data.total;

        totalIssues += issues.length;

        console.log(`Página ${page}: +${issues.length} issues (total acumulado: ${totalIssues}), isLast: ${isLastPage}, API total: ${responseTotal}`);

        if (isLastPage || issues.length === 0) {
          break;
        }

        startAt += maxResults;

        // Segurança: máximo 1000 páginas
        if (page >= 1000) {
          console.log('⚠️ Atingiu limite de teste (1000 páginas)');
          break;
        }
      } catch (error) {
        console.error(`❌ Erro na página ${page}:`, error.message);
        break;
      }
    }

    console.log(`\n✅ ${projectKey}: ${totalIssues} TOTAL de issues em ${page} páginas`);
    return totalIssues;
  } catch (error) {
    console.error(`❌ Erro ao processar ${projectKey}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('\n🚀 TESTE DE CONTAGEM REAL - SEM LIMITES DE TESTE');
  console.log('================================================\n');

  const infosecc = await countAllIssues('INFOSECC');
  const segp = await countAllIssues('SEGP');
  
  console.log('\n\n================================================');
  console.log('📊 RESULTADO FINAL:');
  console.log('================================================');
  console.log(`INFOSECC: ${infosecc} issues`);
  console.log(`SEGP:     ${segp} issues`);
  console.log(`TOTAL:    ${infosecc + segp} issues`);
  console.log('================================================\n');
}

main();

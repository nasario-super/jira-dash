import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_DOMAIN = process.env.VITE_JIRA_DOMAIN;
const JIRA_USERNAME = process.env.VITE_JIRA_USERNAME;
const JIRA_TOKEN = process.env.VITE_JIRA_TOKEN;

const auth = Buffer.from(`${JIRA_USERNAME}:${JIRA_TOKEN}`).toString('base64');

async function analyzeStatusFields() {
  try {
    console.log('\n📊 ANALISANDO ESTRUTURA DE STATUS DA API\n');
    console.log(`Domain: ${JIRA_DOMAIN}`);

    // Tentar diferentes JQLs
    const jqls = [
      'order by updated DESC',
      'project = INFOSECC',
      'project = SEGP',
      'issuetype in (Task, Bug, Story)',
    ];

    for (const jql of jqls) {
      console.log(`\n🔍 Tentando JQL: "${jql}"`);
      
      try {
        const response = await axios.get(
          `https://${JIRA_DOMAIN}/rest/api/3/search/jql`,
          {
            params: {
              jql,
              maxResults: 3,
              fields: 'status,summary,key',
            },
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        console.log(`✅ Encontradas ${response.data.issues?.length} issues`);

        if (response.data.issues && response.data.issues.length > 0) {
          response.data.issues.forEach((issue, idx) => {
            const status = issue.fields.status;
            console.log(`\n  ${idx + 1}. ${issue.key}`);
            console.log(`     Status.name: "${status?.name}"`);
            console.log(`     StatusCategory.name: "${status?.statusCategory?.name}"`);
            console.log(`     StatusCategory.key: "${status?.statusCategory?.key}"`);
          });
          break;
        }
      } catch (err) {
        console.log(`   ❌ JQL falhou: ${err.response?.status}`);
      }
    }

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

analyzeStatusFields();

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

    // Buscar issues para verificar estrutura
    const response = await axios.get(
      `https://${JIRA_DOMAIN}/rest/api/3/search/jql`,
      {
        params: {
          jql: 'project in ("INFOSECC", "SEGP") ORDER BY updated DESC',
          maxResults: 5,
          fields: 'status,summary,key',
        },
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('\n✅ RESPOSTA DA API RECEBIDA\n');
    console.log(`Total de issues encontradas: ${response.data.issues?.length}`);

    if (response.data.issues && response.data.issues.length > 0) {
      console.log('\n📋 ANÁLISE DAS 5 PRIMEIRAS ISSUES:\n');

      response.data.issues.forEach((issue, idx) => {
        const status = issue.fields.status;
        console.log(`\n${idx + 1}. ${issue.key} - ${issue.fields.summary}`);
        console.log('   ┌─ Status Fields:');
        console.log(`   ├─ status.id: ${status?.id}`);
        console.log(`   ├─ status.name: ${status?.name}`);
        console.log(`   ├─ status.statusCategory: ${JSON.stringify(status?.statusCategory)}`);
        console.log(`   ├─ status.statusCategory.id: ${status?.statusCategory?.id}`);
        console.log(`   ├─ status.statusCategory.name: ${status?.statusCategory?.name}`);
        console.log(`   ├─ status.statusCategory.key: ${status?.statusCategory?.key}`);
        console.log('   └─ Status completo:', JSON.stringify(status, null, 2));
      });

      // Análise de padrões
      console.log('\n\n🔍 ANÁLISE DE PADRÕES:\n');

      const statusNames = new Set();
      const categoryNames = new Set();

      response.data.issues.forEach(issue => {
        const status = issue.fields.status;
        if (status?.name) statusNames.add(status.name);
        if (status?.statusCategory?.name) categoryNames.add(status.statusCategory.name);
      });

      console.log('Status.name encontrados:', Array.from(statusNames));
      console.log('StatusCategory.name encontrados:', Array.from(categoryNames));

      // Recomendação
      console.log('\n\n💡 RECOMENDAÇÃO PARA FILTRAR "CONCLUÍDOS":\n');
      console.log(`
// Usar múltiplas estratégias para detectar concluídos:
const completed = issues.filter(i => {
  const status = i.fields.status;
  return (
    status?.statusCategory?.name === 'Done' ||          // Padrão Jira
    status?.statusCategory?.key === 'done' ||           // Alternativa
    status?.name === 'Concluído' ||                     // Custom português
    status?.name === 'Done' ||                          // Custom inglês
    status?.name === 'Resolvido' ||                     // Custom português
    status?.name === 'Fechado' ||                       // Custom português
    status?.statusCategory?.name === 'Concluído'        // Custom português
  );
}).length;
      `);
    }
  } catch (error) {
    console.error('❌ ERRO:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

analyzeStatusFields();

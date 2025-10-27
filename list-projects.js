import axios from 'axios';

// SUBSTITUA PELO SEU TOKEN REAL
const JIRA_DOMAIN = 'superlogica.atlassian.net';
const JIRA_EMAIL = 'anderson.nasario@superlogica.com';
const JIRA_API_TOKEN =
  'ATATT3xFfGF0EY_88mBb0MUjrBO1hJ0avb9avCmMPUAcM4XEGIINo63ctrMvHf1k_Q_661_X_sNJuIsHw9oXdh9pYS9CDkyxI3cVwtXMXgS884hMVuIoyfv2ouimd6yuDnfL9jgEvfcJOegnqcduoTklCBP5C7Rvn46JyRG0l6sFHaPzdZ-JX1U=FE700BB8';

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

async function listProjects() {
  console.log('📁 LISTANDO PROJETOS COM ACESSO');
  console.log('='.repeat(60));
  console.log(`📡 Domínio: ${JIRA_DOMAIN}`);
  console.log(`👤 Email: ${JIRA_EMAIL}`);
  console.log(`🔑 Token: ${JIRA_API_TOKEN.substring(0, 10)}...`);
  console.log('');

  if (JIRA_API_TOKEN === 'SUBSTITUA_PELO_SEU_TOKEN_AQUI') {
    console.log('❌ ERRO: Substitua o token no arquivo!');
    console.log(
      '📝 Edite o arquivo list-projects.js e substitua SUBSTITUA_PELO_SEU_TOKEN_AQUI pelo seu token real'
    );
    return;
  }

  try {
    console.log('🔍 Buscando projetos...');
    const response = await api.get('/project');
    const projects = response.data;

    console.log(`✅ Encontrados ${projects.length} projetos com acesso:`);
    console.log('');

    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado. Possíveis causas:');
      console.log('   - Token não tem permissões de leitura');
      console.log('   - Token expirado');
      console.log('   - Email incorreto');
      console.log('   - Domínio incorreto');
      return;
    }

    // Listar todos os projetos
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.key} - ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Tipo: ${project.projectTypeKey}`);
      console.log(`   Líder: ${project.lead?.displayName || 'N/A'}`);
      console.log(`   Descrição: ${project.description || 'N/A'}`);
      console.log(`   URL: ${project.self}`);
      console.log('');
    });

    // Resumo por tipo de projeto
    const projectTypes = {};
    projects.forEach(project => {
      const type = project.projectTypeKey || 'Unknown';
      projectTypes[type] = (projectTypes[type] || 0) + 1;
    });

    console.log('📊 RESUMO POR TIPO:');
    console.log('-'.repeat(30));
    Object.entries(projectTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count} projetos`);
    });

    console.log('');
    console.log('🔍 TESTANDO ACESSO A ISSUES POR PROJETO:');
    console.log('-'.repeat(50));

    // Testar acesso a issues em alguns projetos
    const testProjects = projects.slice(0, 5); // Testar apenas os primeiros 5
    for (const project of testProjects) {
      try {
        console.log(`\n📋 Testando ${project.key}...`);
        const issuesResponse = await api.get(`/project/${project.id}/issues`, {
          params: {
            maxResults: 5,
            fields: 'summary,status,issuetype',
          },
        });

        const issues = issuesResponse.data.issues || [];
        console.log(`   ✅ ${issues.length} issues encontradas`);

        if (issues.length > 0) {
          console.log('   📝 Primeiras issues:');
          issues.slice(0, 3).forEach((issue, i) => {
            console.log(
              `      ${i + 1}. ${issue.key}: ${issue.fields.summary}`
            );
            console.log(`         Status: ${issue.fields.status.name}`);
            console.log(`         Tipo: ${issue.fields.issuetype.name}`);
          });
        }
      } catch (error) {
        console.log(
          `   ❌ Erro ao acessar issues: ${error.response?.status} - ${error.response?.statusText}`
        );
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTE CONCLUÍDO');
    console.log(`📊 Total de projetos com acesso: ${projects.length}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.log(
      `❌ Erro ao buscar projetos: ${error.response?.status} - ${error.response?.statusText}`
    );

    if (error.response?.data) {
      console.log('📄 Detalhes do erro:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verifique se o token está correto');
    console.log('2. Verifique se o token não expirou');
    console.log('3. Verifique se o email está correto');
    console.log('4. Verifique se o domínio está correto');
    console.log('5. Verifique se o token tem permissões de leitura');
  }
}

listProjects().catch(console.error);

import axios from 'axios';

// Simular exatamente o que o sistema está fazendo
async function simulateSystem() {
  console.log('🔍 SIMULANDO SISTEMA ATUAL');
  console.log('='.repeat(50));

  try {
    // Usar a mesma configuração que está funcionando no sistema
    const api = axios.create({
      baseURL: 'https://superlogica.atlassian.net/rest/api/3',
      headers: {
        Authorization:
          'Basic YW5kZXJzb24ubmFzYXJpb0BzdXBlcmxvZ2ljYS5jb206QVRBVFQzeEZmR0Yw...', // Token real
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Testar com JQL que sabemos que funciona
    const jql = 'project in ("INFOSECC", "SEGP")';
    console.log(`🔍 JQL: ${jql}`);

    const response = await api.get('/search/jql', {
      params: {
        jql: jql,
        maxResults: 1000,
        fields: 'summary,status,issuetype,assignee,project',
      },
    });

    const issues = response.data.issues;
    console.log(`📊 Total de Issues encontradas: ${issues.length}`);

    if (issues.length === 0) {
      console.log(
        '⚠️ Nenhuma issue encontrada. Testando com projetos individuais...'
      );

      // Testar INFOSECC individualmente
      try {
        const infoseccResponse = await api.get('/search/jql', {
          params: {
            jql: 'project = "INFOSECC"',
            maxResults: 1000,
            fields: 'summary,status,issuetype,assignee,project',
          },
        });
        console.log(
          `📊 INFOSECC: ${infoseccResponse.data.issues.length} issues`
        );

        if (infoseccResponse.data.issues.length > 0) {
          console.log('📋 Primeiras 5 issues do INFOSECC:');
          infoseccResponse.data.issues.slice(0, 5).forEach(issue => {
            console.log(`  - ${issue.key}: ${issue.fields.summary}`);
          });
        }
      } catch (error) {
        console.log(`❌ INFOSECC: Erro - ${error.message}`);
      }

      // Testar SEGP individualmente
      try {
        const segpResponse = await api.get('/search/jql', {
          params: {
            jql: 'project = "SEGP"',
            maxResults: 1000,
            fields: 'summary,status,issuetype,assignee,project',
          },
        });
        console.log(`📊 SEGP: ${segpResponse.data.issues.length} issues`);

        if (segpResponse.data.issues.length > 0) {
          console.log('📋 Primeiras 5 issues do SEGP:');
          segpResponse.data.issues.slice(0, 5).forEach(issue => {
            console.log(`  - ${issue.key}: ${issue.fields.summary}`);
          });
        }
      } catch (error) {
        console.log(`❌ SEGP: Erro - ${error.message}`);
      }

      return;
    }

    // Análise por projeto
    const projectAnalysis = {};
    issues.forEach(issue => {
      const projectKey = issue.fields.project.key;
      if (!projectAnalysis[projectKey]) {
        projectAnalysis[projectKey] = {
          totalIssues: 0,
          users: new Set(),
          statusCount: {},
          typeCount: {},
        };
      }

      projectAnalysis[projectKey].totalIssues++;

      if (issue.fields.assignee) {
        projectAnalysis[projectKey].users.add(
          issue.fields.assignee.displayName
        );
      }

      const status = issue.fields.status.name;
      projectAnalysis[projectKey].statusCount[status] =
        (projectAnalysis[projectKey].statusCount[status] || 0) + 1;

      const type = issue.fields.issuetype.name;
      projectAnalysis[projectKey].typeCount[type] =
        (projectAnalysis[projectKey].typeCount[type] || 0) + 1;
    });

    // Exibir resultados
    Object.entries(projectAnalysis).forEach(([projectKey, data]) => {
      console.log(`\n📋 Projeto: ${projectKey}`);
      console.log(`  Total Issues: ${data.totalIssues}`);
      console.log(`  Total Usuários: ${data.users.size}`);
      console.log(`  Usuários: ${Array.from(data.users).join(', ')}`);

      console.log(`\n  📈 Issues por Status:`);
      Object.entries(data.statusCount).forEach(([status, count]) => {
        console.log(`    ${status}: ${count}`);
      });

      console.log(`\n  📋 Issues por Tipo:`);
      Object.entries(data.typeCount).forEach(([type, count]) => {
        console.log(`    ${type}: ${count}`);
      });
    });

    // Análise agregada
    console.log(`\n🔄 ANÁLISE AGREGADA`);
    console.log('='.repeat(30));

    const totalIssues = Object.values(projectAnalysis).reduce(
      (sum, data) => sum + data.totalIssues,
      0
    );
    const allUsers = new Set();
    Object.values(projectAnalysis).forEach(data => {
      data.users.forEach(user => allUsers.add(user));
    });

    console.log(`📊 Total Issues (Agregado): ${totalIssues}`);
    console.log(`👥 Total Usuários Únicos: ${allUsers.size}`);
    console.log(`👥 Usuários: ${Array.from(allUsers).join(', ')}`);

    // Status agregado
    const allStatusCount = {};
    Object.values(projectAnalysis).forEach(data => {
      Object.entries(data.statusCount).forEach(([status, count]) => {
        allStatusCount[status] = (allStatusCount[status] || 0) + count;
      });
    });

    console.log(`\n📈 Issues por Status (Agregado):`);
    Object.entries(allStatusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Tipos agregados
    const allTypeCount = {};
    Object.values(projectAnalysis).forEach(data => {
      Object.entries(data.typeCount).forEach(([type, count]) => {
        allTypeCount[type] = (allTypeCount[type] || 0) + count;
      });
    });

    console.log(`\n📋 Issues por Tipo (Agregado):`);
    Object.entries(allTypeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

simulateSystem();

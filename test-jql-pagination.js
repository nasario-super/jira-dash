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

async function testJQLPagination() {
  try {
    console.log('🧪 Testing JQL Pagination for INFOSECC and SEGP');
    console.log('=====================================\n');

    let allIssues = [];
    let page = 0;
    let startAt = 0;
    let hasMore = true;

    const jql = 'project in ("INFOSECC","SEGP")';
    const maxResults = 100;
    const maxPages = 100; // Alta limite para testar

    while (hasMore && page < maxPages) {
      page++;
      console.log(`\n📄 Fetching page ${page} (startAt=${startAt}, maxResults=${maxResults})...`);

      try {
        const response = await axiosInstance.get('/rest/api/3/search/jql', {
          params: {
            jql,
            startAt,
            maxResults,
            fields: 'summary,status,issuetype,priority,assignee,created,updated,project',
          },
        });

        const issues = response.data.issues || [];
        const total = response.data.total;
        const isLast = response.data.isLast;

        allIssues.push(...issues);

        console.log(`   ✅ Received ${issues.length} issues`);
        console.log(`   📊 Total: ${total}`);
        console.log(`   🔄 Is Last: ${isLast}`);
        console.log(`   📈 Cumulative: ${allIssues.length} issues`);

        // Quebrar projeto-se forem os últimos
        if (isLast) {
          console.log(`   ✅ Reached last page`);
          hasMore = false;
        } else {
          startAt += maxResults;
        }
      } catch (error) {
        console.error(`   ❌ Error fetching page ${page}:`, error.message);
        hasMore = false;
      }

      if (allIssues.length >= 5000) {
        console.log('\n⚠️ Reached 5000 issues limit, stopping...');
        break;
      }
    }

    console.log('\n\n=====================================');
    console.log(`✅ FINAL RESULTS:`);
    console.log(`   Total Issues Fetched: ${allIssues.length}`);
    console.log(`   Total Pages: ${page}`);

    // Contar por projeto
    const byProject = {};
    allIssues.forEach(issue => {
      const key = issue.fields.project.key;
      byProject[key] = (byProject[key] || 0) + 1;
    });

    console.log(`\n📊 Issues by Project:`);
    Object.entries(byProject).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} issues`);
    });

    // Contar por usuário
    const byUser = {};
    allIssues.forEach(issue => {
      const assignee = issue.fields.assignee;
      if (assignee) {
        const name = assignee.displayName;
        byUser[name] = (byUser[name] || 0) + 1;
      }
    });

    console.log(`\n👥 Issues by User (top 10):`);
    Object.entries(byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} issues`);
      });

    console.log('\n=====================================');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testJQLPagination();

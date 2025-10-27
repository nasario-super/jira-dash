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

async function testProject(projectKey) {
  try {
    console.log(`\n🧪 Testing ${projectKey}`);
    console.log('=====================================');

    let page = 0;
    let startAt = 0;
    let totalIssues = 0;
    let hasMore = true;

    const jql = `project = "${projectKey}"`;
    const maxResults = 100;

    while (hasMore && page < 20) {
      page++;

      const response = await axiosInstance.get('/rest/api/3/search/jql', {
        params: {
          jql,
          startAt,
          maxResults,
          fields: 'summary,project',
        },
      });

      const issues = response.data.issues || [];
      const isLast = response.data.isLast;

      totalIssues += issues.length;

      console.log(`Page ${page}: ${issues.length} issues (total: ${totalIssues}), isLast: ${isLast}`);

      if (isLast || issues.length === 0) {
        hasMore = false;
      } else {
        startAt += maxResults;
      }
    }

    console.log(`✅ ${projectKey}: ${totalIssues} total issues in ${page} pages`);
    return totalIssues;
  } catch (error) {
    console.error(`❌ Error for ${projectKey}:`, error.message);
    return 0;
  }
}

async function main() {
  const infosecc = await testProject('INFOSECC');
  const segp = await testProject('SEGP');
  
  console.log('\n=====================================');
  console.log('📊 SUMMARY:');
  console.log(`   INFOSECC: ${infosecc}`);
  console.log(`   SEGP: ${segp}`);
  console.log(`   TOTAL: ${infosecc + segp}`);
}

main();

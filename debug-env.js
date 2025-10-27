// Debug das variáveis de ambiente
console.log('🔍 Environment Variables Debug:');
console.log('VITE_JIRA_DOMAIN:', import.meta.env.VITE_JIRA_DOMAIN);
console.log('VITE_JIRA_EMAIL:', import.meta.env.VITE_JIRA_EMAIL);
console.log(
  'VITE_JIRA_API_TOKEN length:',
  import.meta.env.VITE_JIRA_API_TOKEN?.length
);

// Teste de construção de URL
const JIRA_DOMAIN = import.meta.env.VITE_JIRA_DOMAIN;
const JIRA_BASE_URL = JIRA_DOMAIN ? `https://${JIRA_DOMAIN}` : null;

console.log('📡 JIRA_DOMAIN:', JIRA_DOMAIN);
console.log('📡 JIRA_BASE_URL:', JIRA_BASE_URL);

// Teste de fetch simples
if (JIRA_BASE_URL) {
  console.log('🔍 Testing simple fetch...');
  fetch(`${JIRA_BASE_URL}/rest/api/3/myself`, {
    headers: {
      Authorization: `Basic ${btoa(
        `${import.meta.env.VITE_JIRA_EMAIL}:${
          import.meta.env.VITE_JIRA_API_TOKEN
        }`
      )}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
    .then(response => {
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    })
    .then(data => {
      console.log('✅ API Test successful:', data);
    })
    .catch(error => {
      console.error('❌ API Test failed:', error);
    });
} else {
  console.error('❌ JIRA_BASE_URL is null');
}

// Script para analisar os dados que estão sendo exibidos no dashboard
console.log('🔍 ANÁLISE DOS DADOS DO DASHBOARD ATUAL');
console.log('='.repeat(50));

// Baseado nas imagens fornecidas pelo usuário, vamos analisar os dados
console.log('\n📊 DADOS ATUAIS DO DASHBOARD:');
console.log('='.repeat(30));

console.log('\n📋 Projeto SEGP (Segurança & Privacidade):');
console.log('  Total Issues: 100');
console.log('  Usuários Ativos: 8');
console.log('  Status: GOOD');

console.log('\n👥 Usuários Identificados no Dashboard:');
const users = [
  'José Gabriel de Oliveira Honório',
  'Jean Rodrigues',
  'Mariana Ruzzi',
  'João Vitor Custodio Dalla Rosa',
  'Elaine Morais',
  'Rafaela Rogério Tadeo',
  'Gabriel Donato',
  'Gil Santos',
];

users.forEach((user, index) => {
  console.log(`  ${index + 1}. ${user}`);
});

console.log('\n📈 Issues por Status (Dashboard):');
const statusData = {
  Cancelado: 48,
  Resolvido: 33,
  'AGUARDANDO SUPORTE': 10,
  FECHADO: 4,
  'Em andamento': 1,
  'Aguardando cliente': 2,
  'Em Aberto': 1,
  'AGUARDANDO APROVAÇÃO GESTOR': 1,
};

Object.entries(statusData).forEach(([status, count]) => {
  console.log(`  ${status}: ${count}`);
});

const totalStatusIssues = Object.values(statusData).reduce(
  (sum, count) => sum + count,
  0
);
console.log(`\n📊 Total Issues por Status: ${totalStatusIssues}`);

console.log('\n📋 Issues por Tipo (Dashboard):');
const typeData = {
  '[System] Solicitação de serviço': 69,
  Tarefa: 19,
  '[System] Solicitação de serviço com aprovações': 9,
};

Object.entries(typeData).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

const totalTypeIssues = Object.values(typeData).reduce(
  (sum, count) => sum + count,
  0
);
console.log(`\n📊 Total Issues por Tipo: ${totalTypeIssues}`);

console.log('\n👥 Issues por Usuário (Dashboard):');
const userIssues = {
  'José Gabriel de Oliveira Honório': 37,
  'Jean Rodrigues': 10,
  'Mariana Ruzzi': 4,
  'João Vitor Custodio Dalla Rosa': 6,
  'Elaine Morais': 1,
  'Rafaela Rogério Tadeo': 3,
  'Gabriel Donato': 4,
  'Gil Santos': 1,
};

Object.entries(userIssues).forEach(([user, count]) => {
  console.log(`  ${user}: ${count} issues`);
});

const totalUserIssues = Object.values(userIssues).reduce(
  (sum, count) => sum + count,
  0
);
console.log(`\n📊 Total Issues por Usuário: ${totalUserIssues}`);

console.log('\n🔍 ANÁLISE DE DISCREPÂNCIAS:');
console.log('='.repeat(30));

console.log(`\n❌ PROBLEMAS IDENTIFICADOS:`);
console.log(`1. Total Issues do Projeto: 100`);
console.log(`2. Total Issues por Status: ${totalStatusIssues}`);
console.log(`3. Total Issues por Tipo: ${totalTypeIssues}`);
console.log(`4. Total Issues por Usuário: ${totalUserIssues}`);

console.log(`\n📊 DISCREPÂNCIAS:`);
console.log(
  `- Status vs Projeto: ${totalStatusIssues} vs 100 = ${
    totalStatusIssues - 100
  }`
);
console.log(
  `- Tipo vs Projeto: ${totalTypeIssues} vs 100 = ${totalTypeIssues - 100}`
);
console.log(
  `- Usuário vs Projeto: ${totalUserIssues} vs 100 = ${totalUserIssues - 100}`
);

console.log(`\n🎯 CONCLUSÕES:`);
console.log(`1. O dashboard está exibindo apenas dados do projeto SEGP`);
console.log(
  `2. Há inconsistências na contagem de issues entre diferentes visualizações`
);
console.log(
  `3. A soma das issues dos usuários (${totalUserIssues}) não bate com o total do projeto (100)`
);
console.log(
  `4. O sistema não está agregando dados de múltiplos projetos quando selecionados`
);

console.log(`\n🔧 RECOMENDAÇÕES:`);
console.log(
  `1. Verificar se o JQL está sendo gerado corretamente para múltiplos projetos`
);
console.log(
  `2. Corrigir a agregação de dados quando múltiplos projetos são selecionados`
);
console.log(
  `3. Garantir que a contagem de issues seja consistente em todas as visualizações`
);
console.log(
  `4. Implementar lógica para somar issues de usuários que aparecem em múltiplos projetos`
);

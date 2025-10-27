# 🔍 INVESTIGAÇÃO: DISCREPÂNCIA DE DADOS

**Data**: 27/10/2025
**Backup**: jira-dash-git ✅
**Status**: Em investigação

---

## 🚨 PROBLEMAS IDENTIFICADOS

### Problema 1: 11 Usuários vs 8 Exibidos
```
Esperado: 11 usuários
Exibido: 8 usuários
Diferença: 3 usuários faltando (25% de perda)
```

### Problema 2: Issues Não Batem
```
Esperado: Somatória de issues por projeto
Exibido: Valores inconsistentes
Diferença: A ser medida
```

---

## 📊 ANÁLISE NECESSÁRIA

### 1. Verificar Contagem de Usuários

**Onde isso acontece:**
- `src/services/filterService.ts` - função `buildJQLFromFilters()`
- `src/components/dashboard/OptimizedDashboard.tsx` - exibição de usuários
- `src/components/dashboard/IssuesByUser.tsx` - listagem de usuários

**Possíveis causas:**
- ❓ Filtro removendo usuários (sem issues visíveis?)
- ❓ Limite máximo de usuários hardcoded?
- ❓ Usuários com mesmo nome/email?
- ❓ Deduplicação incorreta?

### 2. Verificar Contagem de Issues

**Onde isso acontece:**
- `src/services/filterService.ts` - `fetchFilteredData()`
- `src/components/dashboard/ProjectStatusCard.tsx` - exibição de issues por projeto
- `src/components/dashboard/IssuesByUser.tsx` - issues por usuário

**Possíveis causas:**
- ❓ Paginação incompleta (fetch interrompido prematuramente)?
- ❓ Deduplicação removendo issues válidas?
- ❓ Limite de 1000 issues ainda aplicado em algum lugar?
- ❓ Issues filtradas indevidamente?

---

## 🧪 TESTES NECESSÁRIOS

### Teste 1: Contar Usuários Reais

```javascript
// Verificar quantos usuários ÚNICOS têm issues no Jira
const jql = 'assignee is not EMPTY OR reporter is not EMPTY';
// ou
const jql = 'assignee in (user1, user2, ...) OR reporter in (...)';

// Resultado esperado: 11 usuários
```

### Teste 2: Contar Issues Reais

```javascript
// Verificar total de issues por projeto
const jqlInfosecc = 'project = "INFOSECC"';
const jqlSegp = 'project = "SEGP"';

// Total esperado = issues_infosecc + issues_segp
```

### Teste 3: Validar Deduplicação

```javascript
// Verificar se deduplicação está removendo issues válidas
// Contar issues ANTES da deduplicação
// Contar issues DEPOIS da deduplicação
// Diferença deve ser ~0
```

---

## 📋 CHECKLIST DE INVESTIGAÇÃO

- [ ] Verificar logs de quantos usuários são descobertos
- [ ] Verificar logs de quantos usuários são exibidos
- [ ] Verificar logs de quantas issues são buscadas
- [ ] Verificar logs de deduplicação
- [ ] Testar JQL individual para cada projeto
- [ ] Contar issues na API diretamente
- [ ] Comparar com números do Jira Web

---

## 🛠️ PRÓXIMOS PASSOS

1. **Adicionar logs detalhados** para rastrear onde os usuários/issues são perdidos
2. **Criar script de teste** para contar dados reais do Jira
3. **Comparar** números com o Jira Web
4. **Identificar** qual função está removendo dados
5. **Corrigir** a função identificada

---

**Status**: ⏳ Aguardando investigação
**Prioridade**: 🔴 Alta (dados inconsistentes)


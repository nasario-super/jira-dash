# 📊 SUMÁRIO: INVESTIGAÇÃO DE DISCREPÂNCIA DE DADOS

**Data**: 27/10/2025
**Status**: 🔴 CRÍTICO - Backup Realizado e Investigação em Progresso
**Backup**: ✅ `/home/anderson.nasario/Documentos/Nasario/jira-dash-git`

---

## ✅ O QUE FOI FEITO

1. ✅ **Backup Completo Criado**
   - Nome: `jira-dash-git`
   - Local: `/home/anderson.nasario/Documentos/Nasario/`
   - Status: 100% seguro, pronto para testes

2. ✅ **Investigação Inicial Realizada**
   - Scripts de debug criados
   - API v3 testada
   - Respostas analisadas

---

## 🚨 PROBLEMAS DESCOBERTOS

### Problema 1: Resposta da API v3 Diferente

**Esperado (API v2):**
```json
{
  "total": 100,
  "startAt": 0,
  "maxResults": 50,
  "issues": [...]
}
```

**Realidade (API v3):**
```json
{
  "issues": [...],
  "nextPageToken": "abc123",
  "isLast": false
}
```

**Impacto**: 
- Campos `total`, `startAt`, `maxResults` não existem!
- Código provavelmente está tentando acessar esses campos
- Resultado: `undefined` em toda parte

### Problema 2: Discrepância de Usuários

- **Reportado**: 11 usuários exibidos no dashboard
- **Realidade**: 7 usuários COM issues atribuídas
- **Causa**: Provavelmente contando usuários sem issues

### Problema 3: Discrepância de Issues

- **Reportado**: Números não batem
- **Possível Causa**: API v3 retornando `undefined` para totais
- **Impacto**: Cálculos incorretos em toda a dashboard

---

## 🔍 ANÁLISE DO CÓDIGO

Arquivos que **provavelmente têm problemas**:

1. **`src/services/filterService.ts`** ⚠️
   ```typescript
   // Provavelmente fazendo:
   const total = response.data.total; // undefined!
   ```

2. **`src/services/jiraApi.ts`** ⚠️
   ```typescript
   // Provavelmente retornando dados com campos errados
   return response.data; // Não tem 'total'!
   ```

3. **Componentes que exibem números** ⚠️
   - `OptimizedDashboard.tsx`
   - `ProjectStatusCard.tsx`
   - `IssuesByUser.tsx`

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1: Corrigir API v3
- [ ] Remover acesso a `response.data.total`
- [ ] Usar `response.data.issues.length` para contagem local
- [ ] Implementar paginação com `nextPageToken`
- [ ] Usar `isLast` para detectar fim de dados

### PASSO 2: Corrigir Usuários
- [ ] Investigar por que 11 usuários aparecem
- [ ] Validar se estão sendo deduplicados corretamente
- [ ] Checar se há usuários sem nome/email válido

### PASSO 3: Corrigir Issues
- [ ] Validar que todas as issues estão sendo buscadas
- [ ] Verificar paginação com `nextPageToken`
- [ ] Confirmar deduplicação funciona

### PASSO 4: Validar
- [ ] Testar com ambos os projetos
- [ ] Comparar números com Jira Web
- [ ] Validar que tudo bate

---

## 🛠️ ARQUIVOS CRIADOS PARA DEBUG

1. **`debug-data-discrepancy.js`** - Primeiro teste (incompleto)
2. **`debug-data-fixed.js`** - Teste melhorado
3. **`debug-api-response.js`** - Análise da resposta da API
4. **`INVESTIGACAO_DISCREPANCIA_DADOS.md`** - Documentação de investigação
5. **`SUMARIO_INVESTIGACAO.md`** - Este arquivo

---

## 💡 RECOMENDAÇÕES

### Para Segurança
✅ **NÃO fazer alterações diretamente no `jira-dash`**
✅ **Trabalhar em `jira-dash-git` para testes**
✅ **Usar `git` para controlar versões**

### Para Correção
1. Começar pelo `jiraApi.ts`
2. Depois `filterService.ts`
3. Por fim, componentes que exibem dados

---

## 📊 MÉTRICAS

| Métrica | Valor |
|---------|-------|
| Backup Realizado | ✅ Sim |
| Problemas Identificados | 3 |
| Prioridade | 🔴 CRÍTICA |
| Usuários Extras | ~3-4 |
| Campos Faltando | 4 (total, startAt, maxResults, key) |
| Campos Novos | 2 (nextPageToken, isLast) |

---

## 🎯 STATUS FINAL

```
✅ Backup: SEGURO
🔴 Problemas: CRÍTICOS
📋 Documentação: COMPLETA
🛠️  Próximo: CORRIGIR API v3
```

---

**Próxima Reunião**: Corrigir as funções de API para lidar com API v3 corretamente


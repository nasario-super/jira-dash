# 🔴 PROBLEMAS IDENTIFICADOS - AGILE DASHBOARD

**Data**: 27/10/2025
**Status**: CRÍTICO - Múltiplos problemas de exibição

---

## 🚨 PROBLEMAS ENCONTRADOS

### 1️⃣ CONCLUÍDOS NÃO REFLETEM (CRÍTICO)

**Observação**: Card mostra "Concluídas: 0" mas Daily Scrum mostra "45 issues concluídas"

**Causa Provável**:
- Campo `statusCategory` pode não estar sendo usado corretamente
- Possível valores: `"Done"`, `"To Do"`, `"In Progress"`
- Alguns status customizados podem não ter `statusCategory`

**Solução**:
```typescript
// ANTES (ERRO)
const completed = issues.filter(
  i => i.fields.status.statusCategory?.name === 'Done'
).length;

// DEPOIS (CORRETO)
const completed = issues.filter(
  i => 
    i.fields.status.statusCategory?.name === 'Done' ||
    i.fields.status.name === 'Concluído' ||
    i.fields.status.name === 'Done' ||
    i.fields.status.name === 'Resolvido'
).length;
```

---

### 2️⃣ STATUS NÃO TRAZ RESULTADO

**Observação**: "Concluídas: 0%" mas dados indicam 45 issues concluídas

**Causa Provável**:
- `statusCategory` retorna `undefined` ou null
- Campo correto pode ser `status.id` ou `status.name`

**Teste necessário**:
```bash
# Fazer requisição à API para ver estrutura real
curl -X GET "https://${DOMAIN}/rest/api/3/search/jql?jql=project='INFOSECC'" \
  -H "Authorization: Basic ${TOKEN}" | jq '.issues[0].fields.status'
```

---

### 3️⃣ DAILY SCRUM COMO LISTA (NÃO CARDS)

**Problema**: 
- Cards não exibem todos os dados
- Textos cortados
- Layout não responsivo

**Solução Proposta**:
- Converter cards em lista com expandable rows
- Mostrar informações principais inline
- Expandir para detalhes completos ao clicar

**Layout**:
```
📋 Hoje Vou Fazer (5 items)
├─ INFOSECC-1412 | Rever Items Não atribuídos | [Em andamento]
├─ INFOSECC-1405 | Rever Items da Leticia | [Em andamento]
├─ INFOSECC-1395 | Expert de informações MFA | [Em andamento]
├─ ... (mais items)
└─ +X mais items

👥 Hoje Vou Fazer (com detalhes expansíveis)
└─ ▼ INFOSECC-1412
   ├─ Responsável: Leticia Ide
   ├─ Criado: 10/10/2025
   ├─ Atualizado: 27/10/2025
   ├─ Descrição completa...
   └─ Status: Em andamento
```

---

### 4️⃣ TEXTOS EXTENSOS ULTRAPASSAM TELA

**Problema**:
- Títulos longos de issues quebram layout
- Descrições não tem scroll
- Modal fica desalinhado

**Solução**:
- Truncar textos com `...` (truncate)
- Adicionar scroll em áreas de conteúdo
- Usar tooltips para ver texto completo
- Melhor ajuste de padding/margins

```typescript
// Exemplo de truncate
<div className="truncate">Texto muito longo que será cortado...</div>
<div className="line-clamp-2">Máximo 2 linhas</div>
```

---

### 5️⃣ ALERTAS NÃO MOSTRAM DETALHES AO CLICAR

**Problema**:
- Cards de alerta não são clicáveis
- Sem detalhes quando clica

**Solução Proposta**:
- Tornar cards clicáveis
- Abrir modal com detalhes completos
- Mostrar lista de issues relacionadas
- Sugerir ações corretivas

**Exemplo**:
```
Alerta: Issues Atrasadas [HIGH]
├─ 11 issues em atraso
├─ Ação Necessária: Atenção Imediata
└─ [CLIQUE PARA DETALHES]

Modal ao clicar:
├─ INFOSECC-1404: Rever items da Zé
├─ INFOSECC-1402: Fix código de busca pelos logs do Slack
├─ INFOSECC-1400: Enviar as metas (Dally & Retro)
└─ +8 mais
```

---

## 📋 PRÓXIMAS AÇÕES

### PASSO 1: Diagnosticar Estrutura Real da API
- [ ] Verificar como Jira retorna `statusCategory`
- [ ] Confirmar valores possíveis
- [ ] Testar com ambos os projetos

### PASSO 2: Corrigir Cálculo de Concluídos
- [ ] Atualizar lógica de detecção de status
- [ ] Incluir múltiplas variações de status
- [ ] Validar com dados reais

### PASSO 3: Converter Daily Scrum
- [ ] Mudar de cards para lista
- [ ] Adicionar expansão de detalhes
- [ ] Truncar textos longos

### PASSO 4: Melhorar Responsividade
- [ ] Ajustar layout para mobile
- [ ] Adicionar scroll em áreas necessárias
- [ ] Usar truncate/line-clamp

### PASSO 5: Adicionar Interatividade em Alertas
- [ ] Tornar alertas clicáveis
- [ ] Criar modal de detalhes
- [ ] Listar issues relacionadas

---

## 🎯 PRIORIDADE

1. 🔴 **CRÍTICO**: Corrigir "Concluídos" (0%)
2. 🔴 **CRÍTICO**: Status não funcionando
3. 🟠 **ALTA**: Daily Scrum como lista
4. 🟠 **ALTA**: Textos truncados
5. 🟡 **MÉDIA**: Alertas com detalhes

---

**Estimativa**: 2-3 horas de implementação


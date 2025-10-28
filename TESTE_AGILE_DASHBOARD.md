# 🧪 GUIA COMPLETO DE TESTES - AGILE DASHBOARD

**Data**: 27/10/2025
**Status**: Pronto para testes

---

## 🚀 COMO TESTAR

### PASSO 1: Compilar e Iniciar o Servidor

```bash
cd /home/anderson.nasario/Documentos/Nasario/jira-dash

# Compilar
npm run build

# Ou apenas dev (se compilar completo mostrar muitos avisos de unused vars de outros arquivos)
npm run dev
```

### PASSO 2: Acessar a Aplicação

```
http://localhost:3000
```

---

## 📋 TESTE 1: MÉTRICAS CORRETAS (Crítico)

### Preparação:
1. Login com credenciais do `.env`
2. Selecionar projetos: **INFOSECC** + **SEGP**
3. Navegar para **Agile Dashboard** → **Visão Geral**

### Esperado:
```
Total de Issues: ~200 (somando ambos)
Concluídas: ~45 (NOT 0!) ✅
Em Progresso: ~30 (NOT 0!) ✅
Bloqueadas: ~8 (NOT 0!) ✅
Em Atraso: ~11 ✅
Percentual: ~22% (concluídas/total)
```

### Validação:
- [ ] Concluídas > 0
- [ ] Em Progresso > 0
- [ ] Bloqueadas > 0
- [ ] Percentual correto
- [ ] Barra de progresso está cheia em ~22%

### Onde ver:
- Console do navegador (F12 → Console) deve mostrar:
  ```
  📊 Métricas Agile: { total: 200, completed: 45, inProgress: 30, blocked: 8, ... }
  ```

---

## 📋 TESTE 2: DAILY SCRUM COM LISTA EXPANSÍVEL

### Preparação:
1. Agile Dashboard → Tab **Daily Scrum**

### Esperado:
```
✅ Ontem Concluí (5 items)  ← Expansível
🔵 Hoje Vou Fazer (30 items)  ← Expansível
⚠️ Issues em Atraso (11 items)  ← Expansível
```

### Validação:
- [ ] 3 seções expansíveis com contagem
- [ ] Clicando na seção, expande/contrai com chevron rotativo
- [ ] "Hoje Vou Fazer" mostra **TODOS os 30+ items**
- [ ] Cada item mostra: `KEY | Título | Status | 👤 Assignee | ⚡ Priority | 📅 Due Date`
- [ ] Se muitos items, aparece scroll dentro da seção
- [ ] Textos truncados em 2 linhas máximo com `...`

### Verificação Visual:
```
┌─ ✅ Ontem Concluí (5) ▼
│  ├─ INFOSECC-1412 | Rever Items Não Atribuídos | [Concluído] | 👤 João | ⚡ High | 📅 22/10
│  ├─ INFOSECC-1405 | Rever Items da Leticia | [Concluído] | 👤 Maria | ⚡ Medium
│  ├─ ...
│  └─ +X mais items (se houver scroll)
│
├─ 🔵 Hoje Vou Fazer (30) ▼
│  ├─ INFOSECC-1389 | Em desenvolvimento ... | [Em Andamento] | 👤 Pedro
│  ├─ SEGP-456 | Segurança de Acesso | [Em Progresso] | 👤 Ana
│  ├─ ...
│  └─ (scroll interno se > 10 items)
│
└─ ⚠️ Issues em Atraso (11) ▼
   ├─ INFOSECC-1404 | Rever items da Zé | [Em Andamento] | 👤 Zé
   └─ ...
```

---

## 📋 TESTE 3: ALERTAS CLICÁVEIS COM MODAL

### Preparação:
1. Agile Dashboard → Tab **Alertas**

### Esperado:
```
🔴 Alto Risco (1)        🟠 Atenção (1)        🔵 Informação (0)

Issues Atrasadas [HIGH]
├─ 11 issues em atraso
└─ Clique para detalhes ← Clicável!

Velocity Baixa [MEDIUM]
└─ ...

Issues Sem Responsável [LOW]
└─ ...
```

### Validação ao Clicar em "Issues Atrasadas":
- [ ] Modal abre com fundo escuro (backdrop)
- [ ] Header mostra ícone + título + severidade
- [ ] Seção "Detalhes" mostra descrição completa
- [ ] Seção "Issues Relacionadas (11)" mostra até 20 issues
- [ ] Cada issue mostra: `KEY | Título (2 linhas) | 👤 Assignee | 📅 Due Date`
- [ ] Se > 20 issues, mostra "+X mais" no final
- [ ] Scroll interno se conteúdo > tela
- [ ] Botão X fecha o modal
- [ ] Clicando fora também fecha

### Verificação Visual do Modal:
```
╔════════════════════════════════════════════════════════════════╗
║ ⚠️  Issues Atrasadas                [HIGH] [Ação Necessária]   ║ X
╠════════════════════════════════════════════════════════════════╣
║ Detalhes:                                                      ║
║ 11 issues estão atrasadas e requerem atenção imediata         ║
║                                                                ║
║ Issues Relacionadas (11):                                      ║
║ ┌────────────────────────────────────────────────────────┐   ║
║ │ INFOSECC-1404 | Concluído                              │   ║
║ │ Rever items da Zé                                      │   ║
║ │ 👤 Zé  📅 20/10/2025                                   │   ║
║ ├────────────────────────────────────────────────────────┤   ║
║ │ INFOSECC-1402 | Em Andamento                           │   ║
║ │ Fix código de busca pelos logs do Slack               │   ║
║ │ 👤 João  📅 18/10/2025                                 │   ║
║ ├────────────────────────────────────────────────────────┤   ║
║ │ ... (mais items com scroll)                            │   ║
║ └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║ Criado em: 27/10/2025 22:00:00                               ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 📋 TESTE 4: SELEÇÃO DE PROJETO ÚNICO

### Preparação:
1. Logout
2. Login novamente
3. Selecionar **APENAS INFOSECC** (desselecionar SEGP)

### Esperado:
```
Total de Issues: ~2000 (apenas INFOSECC)
Concluídas: ~1000+ (números de INFOSECC)
Em Progresso: ~...
Daily: Apenas issues de INFOSECC
Alertas: Baseados em INFOSECC
```

### Validação:
- [ ] Métricas refletem APENAS INFOSECC
- [ ] Daily mostra apenas issues de INFOSECC
- [ ] Nenhuma issue de SEGP aparece

---

## 📋 TESTE 5: COMPARAÇÃO COM JIRA UI

### Procedimento:
1. Abrir Jira UI diretamente: `https://superlogica.atlassian.net/`
2. JQL: `project in ("INFOSECC", "SEGP")`
3. Comparar números com Agile Dashboard

### Pontos de Comparação:
```
Jira UI                          | Agile Dashboard
─────────────────────────────────┼──────────────────────────
Total issues: 4000               | Total Issues: (check)
Issues Done: 1000+               | Concluídas: (check)
Issues In Progress: 500+         | Em Progresso: (check)
Issues Blocked: 50+              | Bloqueadas: (check)
Overdue: 100+                    | Em Atraso: (check)
```

### Tolerância:
- ±10% de diferença é aceitável (sincronização, cache, etc)

---

## 🐛 TESTES DE EDGE CASES

### Teste 6: 0 Issues Concluídas
1. Selecionar projeto que tenha 0 concluídas
2. Verificar que mostra "Concluídas: 0" (não quebra)

### Teste 7: Sem Issues em Atraso
1. Selecionar projeto com 0 em atraso
2. Alerta não deve aparecer
3. Barra de saúde deve estar verde

### Teste 8: Muitos Issues (100+)
1. Daily Scrum com 100+ items
2. Verificar scroll funciona
3. Verificar performance aceitável

---

## 📊 CHECKLIST DE TESTES

### Métricas
- [ ] Concluídas corrige (não 0)
- [ ] Em Progresso corrige (não 0)
- [ ] Bloqueadas corrige (não 0)
- [ ] Percentual correto
- [ ] Log de debug aparece

### Daily Scrum
- [ ] 3 seções expansíveis
- [ ] Chevron rotativo
- [ ] TODOS os items mostrados (sem limite)
- [ ] Scroll funciona
- [ ] Textos truncados
- [ ] Ícones visuais

### Alertas
- [ ] Cards clicáveis
- [ ] Modal abre ao clicar
- [ ] Issues relacionadas listadas
- [ ] Scroll interno funciona
- [ ] Fechar com X funciona
- [ ] Fechar clicando fora funciona

### Responsividade
- [ ] Desktop (1920px) - tudo visível
- [ ] Tablet (768px) - layout ajusta
- [ ] Mobile (375px) - layout ajusta

---

## 📝 COMO REPORTAR ERROS

Se encontrar algum erro:

1. **Captura de Tela**: Fazer print
2. **Logs**: Abrir DevTools (F12) → Console
3. **Informações**:
   - Navegador + Versão
   - Projetos selecionados
   - Tab ativa (Overview/Daily/Velocity/Alertas)
   - O que estava fazendo

4. **Enviar para**:
   ```
   [Incluir print + logs + informações]
   
   Título: [BUG] Breve descrição
   Descrição: Passos para reproduzir + O que esperava vs o que viu
   ```

---

## ✅ TESTES PASSARAM?

Se todos os testes passarem:

1. Commit das mudanças:
   ```bash
   git add src/pages/AgileDashboard.tsx
   git add src/components/dashboard/DailyScrumDashboard.tsx
   git add src/components/dashboard/AlertSystem.tsx
   git commit -m "✨ Correções críticas do Agile Dashboard: métricas, Daily list, alertas interativos"
   git push origin main
   ```

2. Próximos passos:
   - Implementar `useFilteredProjectData` hook
   - Aplicar filtro global em outros dashboards
   - Testes de integração

---

## 🎯 RESUMO

| Teste | Crítico? | Passou? | Notas |
|-------|----------|---------|-------|
| Métricas | ✅ SIM | [ ] | Concluídas, Em Progresso, Bloqueadas |
| Daily List | ✅ SIM | [ ] | Expansível, TODOS items |
| Alertas Modal | ✅ SIM | [ ] | Clicável com detalhes |
| Projeto Único | ⚠️ IMPORTANTE | [ ] | Apenas um projeto |
| Jira UI Compare | ⚠️ IMPORTANTE | [ ] | ±10% tolerância |
| Edge Cases | 🔵 NORMAL | [ ] | 0 items, muitos items |
| Responsividade | 🔵 NORMAL | [ ] | Desktop/Tablet/Mobile |

---

**BOA SORTE NOS TESTES! 🚀**


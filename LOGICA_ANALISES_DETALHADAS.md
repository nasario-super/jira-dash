# 🔬 LÓGICA E ANÁLISES DETALHADAS

## 📊 Como Cada Análise Funciona

---

## 1️⃣ DISTRIBUIÇÃO POR STATUS

### O Que É?
Mostra como as issues estão distribuídas nos diferentes estados do ciclo de vida.

### Lógica

```
Para cada issue:
  1. Obter status atual (Ex: "Aberto", "Em Progresso", "Concluído")
  2. Incrementar contador para esse status
  3. Calcular percentual = (contador / total_issues) * 100

Resultado:
  - Gráfico em pizza
  - Cards com números
  - Tendência ao longo do tempo
```

### Código Conceitual

```javascript
const statusDistribution = {};

issues.forEach(issue => {
  const status = issue.fields.status.name;
  statusDistribution[status] = (statusDistribution[status] || 0) + 1;
});

const percentages = Object.entries(statusDistribution).map(
  ([status, count]) => ({
    status,
    count,
    percentage: (count / issues.length) * 100
  })
);
```

### Interpretação

| Distribuição | Significado | Ação |
|--------------|------------|------|
| 50% Aberto, 50% Concluído | Processo equilibrado | Manter |
| 80% Aberto | Backlog grande | Priorizar |
| 60% Em Progresso | Muita coisa simultânea | Focar em conclusão |
| 90% Concluído | Alta produtividade | Aumentar demanda |

---

## 2️⃣ VELOCITY (VELOCIDADE DA EQUIPE)

### O Que É?
Mede quantas issues a equipe conclui por sprint/período.

### Lógica

```
Velocity = Issues Concluídas por Período

Para cada sprint/semana:
  1. Contar issues com status = "Concluído"
  2. Registrar data de conclusão
  3. Calcular taxa

Exemplo:
  - Sprint 1: 12 issues
  - Sprint 2: 15 issues
  - Sprint 3: 14 issues
  - Média: 13.67 issues/sprint
```

### Fórmula

```
Velocity Média = Σ(Issues Concluídas) / Número de Sprints
```

### Casos Práticos

| Velocity | Tendência | Interpretação |
|----------|-----------|---------------|
| 10 → 15 → 18 | ⬆️ Crescente | Equipe acelerando, bom ritmo |
| 20 → 18 → 15 | ⬇️ Decrescente | Possível problema (vacation? impedimento?) |
| 14 → 14 → 14 | ➡️ Estável | Previsível, fácil planejar |

### Por Quê Usar?

1. **Previsão**: "Com velocity de 15, conseguimos fazer 60 issues em 1 mês"
2. **Planejamento**: Definir meta realista para próxima sprint
3. **Performance**: Detectar queda ou melhoria

---

## 3️⃣ CYCLE TIME (TEMPO DE CICLO)

### O Que É?
Tempo médio que uma issue leva do início até conclusão.

### Lógica

```
Para cada issue concluída:
  1. Obter data de criação
  2. Obter data de conclusão
  3. Calcular diferença em dias

Cycle Time = (Data Conclusão - Data Criação)

Exemplo:
  Issue 1: Criada 01/10, Concluída 05/10 = 4 dias
  Issue 2: Criada 01/10, Concluída 08/10 = 7 dias
  Issue 3: Criada 02/10, Concluída 06/10 = 4 dias
  
Média = (4 + 7 + 4) / 3 = 5 dias
```

### Código

```javascript
const cycleTime = [];

completedIssues.forEach(issue => {
  const created = new Date(issue.fields.created);
  const updated = new Date(issue.fields.updated);
  const daysToComplete = (updated - created) / (1000 * 60 * 60 * 24);
  cycleTime.push(daysToComplete);
});

const averageCycleTime = cycleTime.reduce((a, b) => a + b) / cycleTime.length;
```

### Interpretação

| Cycle Time | Status | Ação |
|-----------|--------|------|
| < 2 dias | ✅ Excelente | Manter processo |
| 2-5 dias | ✅ Bom | Monitorar |
| 5-10 dias | ⚠️ Alerta | Investigar gargalos |
| > 10 dias | 🔴 Crítico | Intervir imediatamente |

### O Que Causa Cycle Time Alto?

- **Bloqueios**: Issues esperando algo
- **Dependências**: Aguardando outras issues
- **Priorização**: Muitas coisas simultâneas
- **Complexidade**: Issues complexas

---

## 4️⃣ EFFICIENCY (EFICIÊNCIA)

### O Que É?
% de issues concluídas do total.

### Lógica

```
Efficiency = (Issues Concluídas / Total Issues) * 100

Exemplo:
  Total: 100 issues
  Concluídas: 75
  Efficiency = (75 / 100) * 100 = 75%
```

### Fórmula

```
Efficiency % = (Concluídas / (Aberto + Em Progresso + Concluído)) * 100
```

### Interpretação

| Efficiency | Significado |
|-----------|-------------|
| 90-100% | Processo muito fechado, pouco fluxo de trabalho |
| 70-90% | Ótimo, equipe muito produtiva |
| 50-70% | Bom, trabalho em fluxo |
| 30-50% | Preocupante, gargalos |
| < 30% | Crítico, muita coisa aberta |

---

## 5️⃣ IDENTIFICAÇÃO DE ANOMALIAS

### O Que É?
Detecção automática de padrões anormais nos dados.

### Lógica

```
Para cada métrica:
  1. Calcular média e desvio padrão histórico
  2. Comparar valor atual com média
  3. Se desvio > 2 * desvio_padrão = ANOMALIA

Exemplo:
  Histórico velocity: 12, 14, 13, 15, 14 (média=13.6)
  Desvio padrão: 1.14
  
  Velocity atual: 8
  Diferença de média: 13.6 - 8 = 5.6
  Limite normal: 13.6 + (2 * 1.14) = 15.88
  
  8 < 15.88 = ANOMALIA DETECTADA ⚠️
```

### Tipos de Anomalias

| Tipo | Causa | Ação |
|------|-------|------|
| **Spike** | Aumento súbito | Aproveitar momentum |
| **Drop** | Queda súbita | Investigar bloqueio |
| **Padrão Quebrado** | Comportamento anormal | Revisar processo |
| **Outlier** | Um ponto fora da curva | Analisar contexto |

---

## 6️⃣ DISTRIBUIÇÃO POR PROJETO

### O Que É?
Como as issues estão distribuídas entre projetos.

### Lógica

```
Para cada projeto:
  1. Contar issues do projeto
  2. Calcular % do total
  3. Comparar com outros projetos

Exemplo:
  Projeto A: 50 issues = 50%
  Projeto B: 30 issues = 30%
  Projeto C: 20 issues = 20%
```

### Interpretação

| Padrão | Significado |
|--------|------------|
| Uma domina (70%+) | Muita concentração, risco |
| Distribuição igual | Carga bem balanceada |
| Uma muito pequena | Projeto com poucos requisitos |

---

## 7️⃣ PREVISÕES (FORECASTING)

### O Que É?
Projeção de quantas issues serão concluídas.

### Lógica - Próximo Sprint

```
Previsão = Velocity Média (últimas 3 sprints)

Exemplo:
  Sprint 1: 12 issues
  Sprint 2: 15 issues
  Sprint 3: 14 issues
  Média: 13.67 ≈ 14 issues

Previsão Sprint 4: ~14 issues
```

### Lógica - Próximo Mês

```
Previsão = (Velocity Média / Dias Sprint) * 30

Exemplo:
  Velocity: 14 issues / 10 dias
  Taxa diária: 1.4 issues/dia
  Próximo mês (30 dias): 1.4 * 30 = 42 issues
```

### Lógica - Burn-Down

```
Taxa Atual = (Issues Concluídas Atual) / (Sprint Concluída %)

Se taxa continuar:
  - Dias faltantes = Backlog Restante / Taxa Atual

Exemplo:
  Concluídas: 30 de 50 (60%)
  Sprint: 50% concluída
  Taxa: 30 / (5 de 10 dias) = 6 issues/dia
  
  Faltam 20 issues
  Dias faltantes: 20 / 6 = 3.3 dias
  
  Se tudo correr bem: Concluem em 3-4 dias
```

---

## 8️⃣ ANÁLISE DE CARGA POR USUÁRIO

### O Que É?
Quantidade de trabalho atribuído a cada pessoa.

### Lógica

```
Para cada usuário:
  1. Contar total de issues atribuídas
  2. Contar issues abertas
  3. Contar issues concluídas
  4. Calcular proporção

Carga = Issues Abertas / (Issues Abertas + Concluídas)

Exemplo:
  Usuário A:
    - Total: 20 issues
    - Abertas: 15
    - Concluídas: 5
    - Carga: 15 / 20 = 75% (muito carregado)
    
  Usuário B:
    - Total: 20 issues
    - Abertas: 5
    - Concluídas: 15
    - Carga: 5 / 20 = 25% (disponível)
```

### Interpretação

| Carga | Status | Ação |
|-------|--------|------|
| < 30% | ✅ Disponível | Pode receber mais trabalho |
| 30-60% | ✅ Normal | Balanceado |
| 60-80% | ⚠️ Alertar | Monitorar atentamente |
| > 80% | 🔴 Crítico | Redistribuir trabalho |

---

## 9️⃣ TAXA DE DEFEITOS

### O Que É?
% de issues que são bugs.

### Lógica

```
Taxa Defeitos = (Bugs / Total Issues) * 100

Categorização:
  - Bug: Tipo de issue = "Bug"
  - Task: Tipo = "Task"
  - Epic: Tipo = "Epic"
  - Story: Tipo = "Story"

Exemplo:
  Total: 100 issues
  Bugs: 20
  Taxa: 20%
```

### Interpretação

| Taxa | Saúde | Ação |
|------|-------|------|
| 0-10% | 🟢 Excelente | Manter qualidade |
| 10-20% | 🟡 Bom | Manter atenção |
| 20-30% | 🟠 Alerta | Revisitar QA |
| > 30% | 🔴 Crítico | Parar e revisar |

---

## 🔟 CORRELAÇÃO DE DADOS

### O Que É?
Relação entre duas métricas.

### Exemplo: Velocity vs Bugs

```
Se Velocity está crescendo, mas Taxa de Bugs também cresce:
→ Possível redução de qualidade para ganhar velocidade

Correlação Esperada:
  ✅ Velocity crescente + Taxa de bugs estável = Bom
  ⚠️ Velocity crescente + Taxa de bugs crescente = Risco
```

### Análise de Causas

| Padrão | Possível Causa |
|--------|----------------|
| Cycle Time ↑ + Bugs ↑ | Complexidade aumentou |
| Velocity ↓ + Bloqueios ↑ | Dependências |
| Efficiency ↓ + Carga ↑ | Overload |

---

## 📈 AGREGAÇÃO DE DADOS

### Por Status
```
Total = Σ(Issues por Status)
```

### Por Projeto
```
Total Projeto A = Σ(Issues de Projeto A)
```

### Por Usuário
```
Total Usuário X = Σ(Issues de Usuário X)
```

### Múltiplos Projetos
```
Total Agregado = Σ(Issues Projeto 1 + Issues Projeto 2 + ...)

Exemplo:
  Projeto A: 50 issues
  Projeto B: 30 issues
  Total: 80 issues
  
  Por Status (agregado):
    - Aberto: 20 + 10 = 30
    - Em Progresso: 15 + 10 = 25
    - Concluído: 15 + 10 = 25
```

---

## 🎯 TRATAMENTO DE CASOS ESPECIAIS

### Issues Recém-Criadas

```
Se Issue criada há < 1 dia:
  - Incluir em "Aberto"
  - NÃO incluir em cálculos de Cycle Time
  - Usar para tendências recentes
```

### Issues com Data Vencida

```
Se data vencimento < hoje:
  - Marcar como "Atrasada"
  - Incluir em alertas
  - Calcular dias em atraso
```

### Usuários Inativos

```
Se usuário sem issues por > 30 dias:
  - Filtrar em "Usuários Ativos"
  - Manter em histórico
  - Não incluir em cálculos atuais
```

---

## 🔄 SINCRONIZAÇÃO E ATUALIZAÇÃO

### Frequência de Atualização
- **Real-time**: Status de issues
- **5 minutos**: Agregações
- **1 hora**: Previsões
- **1 dia**: Tendências

### Causas de Atraso
1. Volume de dados (se > 10k issues)
2. Latência Jira API
3. Processamento de IA
4. Conectividade

---

## 📊 EXEMPLO PRÁTICO COMPLETO

### Cenário
- 3 Projetos: A, B, C
- 100 issues total
- 2 sprints histórico

### Cálculos

```
1. Distribuição por Status
   Aberto: 30 (30%)
   Em Progresso: 40 (40%)
   Concluído: 30 (30%)

2. Velocity
   Sprint 1: 25 issues
   Sprint 2: 30 issues
   Média: 27.5 ≈ 28 issues/sprint

3. Cycle Time
   Média histórica: 6 dias

4. Efficiency
   30 / 100 = 30% (baixa, preocupante)

5. Previsão Próximo Sprint
   ~28 issues

6. Anomalias
   Nenhuma detectada (padrão normal)

7. Carga por Usuário
   Usuário A: 15 issues (14 abertas = 93% carga)
   Usuário B: 10 issues (5 abertas = 50% carga)
   Usuário C: 5 issues (2 abertas = 40% carga)

8. Recomendação
   ⚠️ Redistribuir trabalho do Usuário A
   ⚠️ Investigar por que Efficiency é baixa (30%)
```

---

**Versão**: 1.0
**Data**: 28 de Outubro de 2025
**Status**: ✅ Documentado

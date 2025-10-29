# 📖 GUIA COMPLETO DE USO - JIRA DASHBOARD

## 🎯 O QUE É O JIRA DASHBOARD?

O **Jira Dashboard** é uma ferramenta web moderna que oferece:
- ✅ Visualização centralizada de dados do Jira
- ✅ Análises avançadas de produtividade
- ✅ Relatórios executivos
- ✅ Métricas de qualidade
- ✅ Insights de IA
- ✅ Previsões e anomalias

---

## 🚀 COMEÇANDO

### 1. Acessar a Aplicação

```
http://3.83.28.223:3000
```

Você verá a **tela de login**.

---

### 2. Login

#### Credenciais Necessárias:
- **Email**: seu-email@example.com
- **API Token**: Gerar em https://id.atlassian.com/manage-profile/security/api-tokens

#### Como Gerar API Token:
1. Abra https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Digite um nome (ex: "Jira Dashboard")
4. Copie o token gerado
5. Cole na tela de login do Dashboard

---

### 3. Seleção de Projetos

Após login, você verá a **tela de seleção de projetos**.

#### Opções:
1. ✅ Carregar Projetos
2. 🔍 Pesquisar por nome
3. ☑️ Selecionar múltiplos projetos
4. ✅ Confirmar seleção

#### Dica:
- Selecione 1-3 projetos para melhor performance
- Pode selecionar mais tarde

---

## 📊 PÁGINA PRINCIPAL - DASHBOARD

### Visão Geral (Cards Superiores)

| Card | Significado |
|------|-------------|
| **Total de Issues** | Todas as issues nos projetos selecionados |
| **Projetos Ativos** | Quantidade de projetos em uso |
| **Usuários Ativos** | Pessoas com issues atribuídas |
| **Filtros Aplicados** | Quais filtros estão ativos |

### Gráfico de Issues por Status

Mostra a **distribuição** de issues por status:
- 🔵 **Aberto**: Issues não iniciadas
- 🟡 **Em Progresso**: Issues sendo trabalhadas
- 🟢 **Concluído**: Issues finalizadas

**Interpretação**:
- Alto % em "Aberto" → Muitas tarefas não iniciadas
- Alto % em "Concluído" → Equipe produtiva
- Muito em "Em Progresso" → Muita coisa simultânea

### Gráfico de Issues por Projeto

Mostra quanto cada projeto contribui ao total.

**Interpretação**:
- Se um projeto domina → Concentrar recursos
- Distribuição igual → Carga balanceada

### Lista de Usuários

Mostra cada usuário e suas issues:
- Nome do usuário
- Total de issues atribuídas
- Issues concluídas
- Issues em progresso

**Ações**:
- Clique no usuário → Abre modal com detalhes
- Ver todas suas issues
- Ver por projeto
- Ver por status

---

## 🎯 FILTROS

### Como Usar Filtros

1. Vá para a **barra de filtros**
2. Selecione as opções desejadas:
   - **Status**: Aberto, Em Progresso, Concluído, etc
   - **Tipo**: Bug, Tarefa, Epic, etc
   - **Prioridade**: Baixa, Média, Alta, Crítica
   - **Responsável**: Selecione usuários

3. Os dados **atualizam automaticamente**

### Exemplos de Filtros Úteis

**Encontrar Gargalos:**
```
Status: Em Progresso
Prioridade: Crítica
```
→ Issues críticas paradas

**Avaliar Produtividade:**
```
Status: Concluído
Data: Última semana
```
→ O que foi entregue

**Identificar Overload:**
```
Responsável: [Usuário]
Status: Em Progresso, Aberto
```
→ Carga de trabalho de uma pessoa

---

## 📈 AGILE DASHBOARD

### O que Oferece

#### Visão Geral (Overview)
- **Total de Issues**: Na sprint atual
- **Concluídas**: % de conclusão
- **Em Progresso**: Issues sendo feitas
- **Bloqueadas**: Issues paradas
- **Em Atraso**: Issues vencidas

#### Daily Scrum
Lista de issues do dia:
- Status atual
- Responsável
- Prioridade
- Data de vencimento

**Use para**:
- Standups diários
- Ver bloqueios
- Acompanhar sprints

#### Alertas Inteligentes
Detecta automaticamente:
- ⚠️ Issues vencidas
- ⚠️ Issues bloqueadas
- ⚠️ Alta taxa de bugs
- ⚠️ Capacidade sobrecarregada

**Ação**: Clique no alerta para ver issues relacionadas

---

## 📊 EXECUTIVE DASHBOARD

### Para Diretores e Gestores

#### KPIs Principais
1. **Velocity**: Issues concluídas por sprint
2. **Throughput**: Taxa de entrega
3. **Cycle Time**: Tempo médio issue
4. **Lead Time**: Tempo do pedido até conclusão
5. **Efficiency**: % de issues concluídas

#### Gráficos
- **Tendência**: Produtividade ao longo do tempo
- **Distribuição por Tipo**: Bugs vs Tarefas
- **Performance por Projeto**: Qual projeto é mais rápido

**Interpretação**:
- Velocity crescente → Equipe acelerando
- Cycle Time reduzindo → Processos melhorando
- Efficiency alta → Bom planejamento

---

## 📊 QUALITY METRICS

### Análises de Qualidade

#### Taxa de Defeitos
```
Bugs Encontrados vs Issues Totais
```
- **Ideal**: < 20%
- **Alerta**: > 30%

#### Tempo para Resolver Bugs
```
Dias do reporte até conclusão
```
- **Rápido**: < 2 dias
- **Normal**: 2-5 dias
- **Lento**: > 5 dias

#### Cobertura de Testes
Se integrado:
- % de issues com testes
- Bugs encontrados pós-release

#### Retrabalho
```
Issues reabertas / Issues resolvidas
```
- **Baixo**: < 10% (bom)
- **Alto**: > 20% (problema)

---

## 🤖 ANALYTICS IA

### Insights Gerados Automaticamente

#### 1. Tendências
- Padrões de velocidade
- Picos de atividade
- Sazonalidade

#### 2. Detecção de Anomalias
Identifica:
- Queda súbita em velocidade
- Aumento anormal de bugs
- Usuário com muita carga

#### 3. Previsões
- Quando a sprint será concluída
- Quantas issues em 1 mês
- Taxa de burn-down esperada

#### 4. Recomendações
- "Priorize bugs críticos"
- "Distribua carga entre equipe"
- "Aproveite momentum atual"

---

## 📋 RELATÓRIOS

### Gerar Relatórios

1. Clique em **"Relatórios"** no menu
2. Selecione período
3. Escolha projetos
4. **Exportar** em PDF ou Excel

### Informações Incluídas

- Resumo executivo
- Métricas principais
- Gráficos
- Análise por usuário
- Recomendações

---

## 🔍 COMO INTERPRETAR OS DADOS

### Exemplo 1: Issue Tem Status Diferente

**Por quê?**
- Atualização em tempo real
- Múltiplos usuários alterando
- Sincronização com Jira

**Solução**: 
- Clique **Atualizar** no Dashboard
- Ou recarregue a página (F5)

### Exemplo 2: Número de Issues Não Bate

**Por quê?**
- Filtros aplicados
- Issues de subitens não incluídas
- Sincronização em progresso

**Verificar**:
- Veja os filtros ativos
- Procure por "Filtros Aplicados" no card

### Exemplo 3: Um Usuário Desapareceu

**Por quê?**
- Usuário sem issues atribuídas
- Issues foram reassignadas
- Usuário fora do projeto

**Ação**: Reatribua issues se necessário

---

## ⚙️ CONFIGURAÇÕES

### Projeto Configuration

```
Configuração de Projetos
├─ Projetos Selecionados: [Lista]
├─ Status: ✅ Conectado
└─ Atualizar
```

**Use para**:
- Verificar quais projetos estão selecionados
- Adicionar/remover projetos
- Validar conexão

---

## 🎓 CASOS DE USO

### Caso 1: Sprint Planning

1. Abra **Agile Dashboard**
2. Veja **Total de Issues** disponível
3. Analise **Velocity** anterior
4. Defina meta de sprint

### Caso 2: Daily Standup

1. Vá para **Daily Scrum**
2. Veja issues de hoje
3. Identifique bloqueios
4. Discuta soluções

### Caso 3: Relatório para Gerente

1. Vá para **Executive Dashboard**
2. Analise KPIs
3. Exporte **Relatórios**
4. Apresente dados

### Caso 4: Encontrar Problema

1. Vá para **Quality Metrics**
2. Procure **Taxa de Defeitos** alta
3. Clique para ver bugs
4. Priorize correção

### Caso 5: Avaliar Performance

1. Vá para **Analytics IA**
2. Veja **Previsões** e **Anomalias**
3. Compare com **Histórico**
4. Ajuste processos

---

## 💡 DICAS E TRUQUES

### ✅ Para Melhor Performance
- Use 1-3 projetos de cada vez
- Limpe filtros não necessários
- Recarregue página se lento

### ✅ Para Melhor Análise
- Compare períodos (semana vs mês)
- Analise tendências, não picos
- Considere contexto externo

### ✅ Para Melhor Colaboração
- Compartilhe relatórios
- Use insights para 1-on-1s
- Discuta anomalias com equipe

---

## 🆘 PROBLEMAS COMUNS

### "Nenhuma issue encontrada"

**Causas possíveis:**
1. Projeto sem issues
2. Filtros muito restritivos
3. Usuário sem acesso

**Solução:**
- Limpe todos os filtros
- Selecione projeto diferente
- Verifique acesso Jira

### "Números diferentes do Jira"

**Por quê?**
- Delay de sincronização (5-10 min)
- Filtros diferentes
- Issues subitens

**Solução:**
- Clique Atualizar
- Aguarde 5 minutos
- Verifique filtros

### "Usuário não aparece"

**Por quê?**
- Sem issues atribuídas
- Saiu do projeto
- Desativado

**Solução:**
- Reatribua issues
- Convide usuário ao projeto

---

## 📞 SUPORTE

Para dúvidas:
1. Verifique este guia
2. Veja a documentação técnica
3. Contacte o administrador

---

**Versão**: 1.0
**Data**: 28 de Outubro de 2025
**Status**: ✅ Pronto para Usar

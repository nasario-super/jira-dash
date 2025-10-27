# 🔒 FILTRO DE PROJETOS SELECIONADOS - IMPLEMENTAÇÃO GLOBAL

**Objetivo**: Garantir que TODAS as funcionalidades (Agile, Executive, Analytics, Qualidade, Relatórios) exibam APENAS dados dos projetos selecionados.

---

## 📋 ANÁLISE ATUAL

### ✅ Páginas que JÁ RESPEITAM o Filtro:

1. **Dashboard Principal** (`OptimizedDashboard.tsx`)
   - ✅ Usa `useSecureJiraData()`
   - ✅ Filtra por `projectAccessService.getUserProjects()`
   - ✅ Valida dados

2. **Agile Dashboard** (`AgileDashboard.tsx`)
   - ✅ Usa `useJiraFilters()`
   - ✅ Passa `data.issues` para componentes
   - ⚠️ **PORÉM**: `useJiraFilters()` busca com JQL correto

3. **Executive Dashboard** (`ExecutiveDashboard.tsx`)
   - ✅ Usa `useJiraFilters()`
   - ✅ Passa dados filtrados
   - ⚠️ **PORÉM**: Sem validação explícita

4. **Quality Metrics** (`QualityMetrics.tsx`)
   - ✅ Usa `useJiraFilters()`
   - ✅ Passa dados filtrados
   - ⚠️ **PORÉM**: Sem validação explícita

5. **Advanced Analytics** (`AdvancedAnalytics.tsx`)
   - ⚠️ Usa `useJiraData()` (não `useJiraFilters()`)
   - ❌ **PROBLEMA**: Pode estar trazendo TODOS os dados

---

## 🎯 SOLUÇÃO: Wrapper Hook Universal

### PASSO 1: Criar Hook de Filtro Seguro
**Arquivo:** `src/hooks/useFilteredProjectData.ts`

```typescript
import { useSecureJiraData } from './useSecureJiraData';
import { useJiraFilters } from './useJiraFilters';
import { projectAccessService } from '../services/projectAccessService';

interface FilteredDataReturn {
  issues: any[];
  loading: boolean;
  error: string | null;
  selectedProjects: string[];
  isReady: boolean;
}

/**
 * Hook universal que garante filtro de projetos em TODAS as funcionalidades
 * Equivalente a useSecureJiraData() mas com interface mais simples
 */
export function useFilteredProjectData(): FilteredDataReturn {
  const { data, loading, error } = useJiraFilters();
  const selectedProjects = projectAccessService.getUserProjects();
  const isReady = projectAccessService.isInitialized() && selectedProjects.length > 0;

  console.log('🔐 useFilteredProjectData:', {
    projects: selectedProjects,
    issues: data?.issues?.length || 0,
    isReady,
  });

  if (!isReady) {
    return {
      issues: [],
      loading: true,
      error: error || 'Nenhum projeto selecionado',
      selectedProjects: [],
      isReady: false,
    };
  }

  // ✅ VALIDAR: Todos os issues pertencem aos projetos selecionados
  const filteredIssues = (data?.issues || []).filter((issue: any) => {
    const projectKey = issue.fields.project.key;
    const hasAccess = selectedProjects.includes(projectKey);
    
    if (!hasAccess) {
      console.warn(`⚠️ Issue ${issue.key} de projeto não selecionado: ${projectKey}`);
    }
    
    return hasAccess;
  });

  return {
    issues: filteredIssues,
    loading,
    error,
    selectedProjects,
    isReady,
  };
}
```

---

## 🔧 PASSO 2: Atualizar Cada Página

### 2.1 - Agile Dashboard
**Arquivo:** `src/pages/AgileDashboard.tsx`

```typescript
// ❌ ANTES
import { useJiraFilters } from '../hooks/useJiraFilters';
const { data, loading, error } = useJiraFilters();
const processedData = { issues: data?.issues || [] };

// ✅ DEPOIS
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, error, selectedProjects, isReady } = useFilteredProjectData();

// Adicionar validação
if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}

const processedData = { issues };
```

### 2.2 - Executive Dashboard
**Arquivo:** `src/pages/ExecutiveDashboard.tsx`

```typescript
// ❌ ANTES
import { useJiraFilters } from '../hooks/useJiraFilters';
const { data, loading, error } = useJiraFilters();
const processedData = { issues: data?.issues || [] };

// ✅ DEPOIS
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, error, selectedProjects, isReady } = useFilteredProjectData();

if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}

const processedData = { issues };
```

### 2.3 - Quality Metrics
**Arquivo:** `src/pages/QualityMetrics.tsx`

```typescript
// ❌ ANTES
import { useJiraFilters } from '../hooks/useJiraFilters';
const { data, loading, error } = useJiraFilters();
const processedData = { issues: data?.issues || [] };

// ✅ DEPOIS
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, error, selectedProjects, isReady } = useFilteredProjectData();

if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}

const processedData = { issues };
```

### 2.4 - Advanced Analytics
**Arquivo:** `src/pages/AdvancedAnalytics.tsx`

```typescript
// ❌ ANTES
import { useJiraData } from '../hooks/useJiraData';
const { data, loading, refresh } = useJiraData();
const issues = data?.issues || [];

// ✅ DEPOIS
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, selectedProjects, isReady } = useFilteredProjectData();

if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}
```

### 2.5 - Analytics IA
**Arquivo:** `src/pages/Analytics.tsx`

```typescript
// ✅ APLICAR MESMO PADRÃO
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, selectedProjects, isReady } = useFilteredProjectData();

if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}
```

### 2.6 - Relatórios
**Arquivo:** `src/pages/ReportsPage.tsx`

```typescript
// ✅ APLICAR MESMO PADRÃO
import { useFilteredProjectData } from '../hooks/useFilteredProjectData';
const { issues, loading, selectedProjects, isReady } = useFilteredProjectData();

if (!isReady) {
  return <div>Selecione projetos para continuar</div>;
}
```

---

## 📊 FLUXO DE DADOS GARANTIDO

```
Login → Seleção de Projetos → Dashboard/Outras Páginas

┌─────────────────────────────────────────┐
│ projectAccessService.getUserProjects()  │ ← Projetos selecionados
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ useFilteredProjectData()                │ ← Hook universal
│ ├─ Carrega dados via useJiraFilters()   │
│ ├─ Filtra por projetos selecionados     │
│ ├─ Valida cada issue                    │
│ └─ Retorna dados garantidos             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Dashboard / Agile / Executive / etc     │ ← Exibe dados filtrados
└─────────────────────────────────────────┘
```

---

## ✅ GARANTIAS

✅ **Agile Dashboard**: Mostra sprints/tasks/velocity apenas dos projetos selecionados
✅ **Executive Dashboard**: Mostra KPIs apenas dos projetos selecionados
✅ **Quality Metrics**: Mostra métricas apenas dos projetos selecionados
✅ **Analytics IA**: Mostra análises apenas dos projetos selecionados
✅ **Relatórios**: Mostra relatórios apenas dos projetos selecionados
✅ **Validação**: Se usuário tentar acessar projeto não-selecionado, dados são filtrados

---

## 🧪 COMO TESTAR

### Teste 1: Verificar Filtro por Projeto
```
1. Login
2. Selecionar APENAS INFOSECC
3. Abrir Agile Dashboard
4. Console deve mostrar:
   ✅ "useFilteredProjectData: projects: ['INFOSECC']"
   ✅ Nenhum warning "Issue X de projeto não selecionado"
5. Dados exibidos = APENAS INFOSECC
```

### Teste 2: Verificar Múltiplos Projetos
```
1. Login
2. Selecionar INFOSECC + SEGP
3. Abrir Executive Dashboard
4. Console deve mostrar:
   ✅ "useFilteredProjectData: projects: ['INFOSECC', 'SEGP']"
5. Dados agregados de AMBOS os projetos
```

### Teste 3: Verificar Segurança
```
1. Login
2. Selecionar APENAS INFOSECC
3. Abrir Quality Metrics
4. Contar issues exibidos
5. Número deve ser APENAS de INFOSECC
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `useFilteredProjectData.ts`
- [ ] Atualizar `AgileDashboard.tsx`
- [ ] Atualizar `ExecutiveDashboard.tsx`
- [ ] Atualizar `QualityMetrics.tsx`
- [ ] Atualizar `AdvancedAnalytics.tsx`
- [ ] Atualizar `Analytics.tsx`
- [ ] Atualizar `ReportsPage.tsx`
- [ ] Testar cada página
- [ ] Validar números em cada página
- [ ] Verificar console para warnings

---

## 🚨 PROBLEMA CRÍTICO SE NÃO IMPLEMENTADO

❌ Usuário seleciona INFOSECC
❌ Agile Dashboard mostra dados de TODOS os projetos
❌ Executive Dashboard mostra KPIs globais
❌ Analytics mostra análises de todos os dados
❌ **VAZAMENTO DE DADOS** de projetos inacessíveis!

---

## 📝 BENEFÍCIOS

✅ Segurança: Apenas dados dos projetos selecionados
✅ Consistência: Todas as páginas comportam igual
✅ Facilidade: Um único hook para gerenciar filtro
✅ Manutenção: Alterar filtro em um único lugar
✅ Performance: Reutiliza dados já filtrados

---

**IMPLEMENTAR AGORA PARA GARANTIR SEGURANÇA!**

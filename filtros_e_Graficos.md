# Prompt Especializado: Filtros Dinâmicos e Gráficos Otimizados - Dashboard Jira

## Contexto

Criar sistema de filtros avançados totalmente integrado à API do Jira e gráficos otimizados com melhor uso do espaço visual, evitando sobreposição de legendas e garantindo legibilidade em todos os tamanhos de tela.

---

## PARTE 1: SISTEMA DE FILTROS DINÂMICOS

### Objetivo dos Filtros

Permitir que usuários filtrem dados do Jira em tempo real, com cada mudança de filtro disparando nova busca na API e atualizando automaticamente todos os gráficos e métricas do dashboard.

### Arquitetura de Estado

```typescript
interface FilterState {
  projects: string[]; // Ex: ["PROJ", "ALPHA", "BETA"]
  dateRange: {
    start: string | null; // ISO: "2025-01-01"
    end: string | null; // ISO: "2025-12-31"
  };
  sprints: number[]; // IDs numéricos: [123, 124, 125]
  issueTypes: string[]; // Ex: ["Story", "Bug", "Task"]
  statuses: string[]; // Ex: ["To Do", "In Progress", "Done"]
  assignees: string[]; // Account IDs do Jira
  priorities: string[]; // Ex: ["Highest", "High", "Medium"]
}

interface FilterOptions {
  projects: Array<{ key: string; name: string }>;
  sprints: Array<{ id: number; name: string; state: string }>;
  issueTypes: Array<{ name: string; iconUrl: string }>;
  statuses: Array<{ name: string; category: string }>;
  assignees: Array<{
    accountId: string;
    displayName: string;
    avatarUrl: string;
  }>;
  priorities: Array<{ name: string; iconUrl: string }>;
}
```

### Fluxo de Implementação

#### Passo 1: Carregar Opções de Filtros (Montagem do Componente)

```typescript
async function loadFilterOptions(): Promise<FilterOptions> {
  // Fazer chamadas paralelas para carregar todas as opções
  const [projects, issueTypes, statuses, priorities] = await Promise.all([
    fetch(`${JIRA_BASE_URL}/rest/api/3/project`, { headers }),
    fetch(`${JIRA_BASE_URL}/rest/api/3/issuetype`, { headers }),
    fetch(`${JIRA_BASE_URL}/rest/api/3/status`, { headers }),
    fetch(`${JIRA_BASE_URL}/rest/api/3/priority`, { headers }),
  ]);

  // Sprints: buscar do primeiro board ativo
  const boards = await fetch(`${JIRA_BASE_URL}/rest/agile/1.0/board`, {
    headers,
  });
  const firstBoardId = boards.values[0].id;
  const sprints = await fetch(
    `${JIRA_BASE_URL}/rest/agile/1.0/board/${firstBoardId}/sprint`,
    { headers }
  );

  // Assignees: buscar usuários ativos
  const assignees = await fetch(
    `${JIRA_BASE_URL}/rest/api/3/users/search?maxResults=100`,
    { headers }
  );

  return {
    projects: projects.json(),
    issueTypes: issueTypes.json(),
    statuses: statuses.json(),
    priorities: priorities.json(),
    sprints: sprints.values,
    assignees: assignees.json(),
  };
}
```

#### Passo 2: Construir JQL Dinamicamente

```typescript
function buildJQLFromFilters(filters: FilterState): string {
  const conditions: string[] = [];

  // Projetos
  if (filters.projects.length > 0) {
    conditions.push(`project in (${filters.projects.join(',')})`);
  }

  // Período
  if (filters.dateRange.start && filters.dateRange.end) {
    conditions.push(
      `created >= "${filters.dateRange.start}" AND created <= "${filters.dateRange.end}"`
    );
  } else if (filters.dateRange.start) {
    conditions.push(`created >= "${filters.dateRange.start}"`);
  } else if (filters.dateRange.end) {
    conditions.push(`created <= "${filters.dateRange.end}"`);
  }

  // Sprints
  if (filters.sprints.length > 0) {
    conditions.push(`sprint in (${filters.sprints.join(',')})`);
  }

  // Tipos de Issue
  if (filters.issueTypes.length > 0) {
    const escaped = filters.issueTypes.map(t => `"${t}"`).join(',');
    conditions.push(`issuetype in (${escaped})`);
  }

  // Status
  if (filters.statuses.length > 0) {
    const escaped = filters.statuses.map(s => `"${s}"`).join(',');
    conditions.push(`status in (${escaped})`);
  }

  // Assignees
  if (filters.assignees.length > 0) {
    conditions.push(`assignee in (${filters.assignees.join(',')})`);
  }

  // Prioridades
  if (filters.priorities.length > 0) {
    const escaped = filters.priorities.map(p => `"${p}"`).join(',');
    conditions.push(`priority in (${escaped})`);
  }

  // Se não há filtros, retornar query padrão para não trazer tudo
  if (conditions.length === 0) {
    return 'created >= -90d'; // Últimos 90 dias por padrão
  }

  return conditions.join(' AND ');
}
```

#### Passo 3: Buscar Dados Filtrados com Paginação

```typescript
async function fetchFilteredData(filters: FilterState): Promise<any> {
  const jql = buildJQLFromFilters(filters);
  let allIssues: any[] = [];
  let startAt = 0;
  const maxResults = 100;
  let total = 0;

  do {
    const url = new URL(`${JIRA_BASE_URL}/rest/api/3/search`);
    url.searchParams.append('jql', jql);
    url.searchParams.append('startAt', startAt.toString());
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append(
      'fields',
      'summary,status,issuetype,priority,assignee,created,updated,duedate,customfield_10016'
    );

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${btoa(`${EMAIL}:${API_TOKEN}`)}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Jira API Error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    allIssues = [...allIssues, ...data.issues];
    total = data.total;
    startAt += maxResults;

    // Limite de segurança: máximo 1000 issues
    if (allIssues.length >= 1000) break;
  } while (startAt < total);

  return {
    issues: allIssues,
    total: total,
    fetched: allIssues.length,
  };
}
```

#### Passo 4: Hook Customizado com Debounce

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';

function useJiraFilters() {
  const [filters, setFilters] = useState<FilterState>({
    projects: [],
    dateRange: { start: null, end: null },
    sprints: [],
    issueTypes: [],
    statuses: [],
    assignees: [],
    priorities: [],
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar opções de filtros na montagem
  useEffect(() => {
    loadFilterOptions()
      .then(setFilterOptions)
      .catch(err => setError(err.message));
  }, []);

  // Função debounced para buscar dados
  const debouncedFetch = useMemo(
    () =>
      debounce(async (currentFilters: FilterState) => {
        setLoading(true);
        setError(null);

        try {
          const result = await fetchFilteredData(currentFilters);
          setData(result);
        } catch (err: any) {
          setError(err.message);
          setData(null);
        } finally {
          setLoading(false);
        }
      }, 800), // 800ms de debounce
    []
  );

  // Buscar dados sempre que filtros mudarem
  useEffect(() => {
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  // Atualizar filtro individual
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    setFilters({
      projects: [],
      dateRange: { start: null, end: null },
      sprints: [],
      issueTypes: [],
      statuses: [],
      assignees: [],
      priorities: [],
    });
  }, []);

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.projects.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.sprints.length > 0) count++;
    if (filters.issueTypes.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filterOptions,
    data,
    loading,
    error,
    updateFilter,
    clearAllFilters,
    activeFiltersCount,
  };
}
```

### Interface de Filtros - Componente React

```typescript
function FilterBar({
  filters,
  filterOptions,
  updateFilter,
  clearAllFilters,
  activeFiltersCount,
  loading,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header com contador de filtros ativos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFiltersCount}{' '}
              {activeFiltersCount === 1 ? 'ativo' : 'ativos'}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            disabled={loading}
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Linha 1 de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MultiSelectFilter
          label="Projetos"
          placeholder="Selecione projetos"
          options={filterOptions?.projects || []}
          value={filters.projects}
          onChange={val => updateFilter('projects', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500">{opt.key}</span>
              <span>{opt.name}</span>
            </div>
          )}
          disabled={loading}
        />

        <DateRangeFilter
          label="Período"
          value={filters.dateRange}
          onChange={val => updateFilter('dateRange', val)}
          presets={[
            {
              label: 'Hoje',
              value: {
                start: new Date().toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
              },
            },
            {
              label: 'Últimos 7 dias',
              value: { start: addDays(new Date(), -7), end: new Date() },
            },
            {
              label: 'Últimos 30 dias',
              value: { start: addDays(new Date(), -30), end: new Date() },
            },
            {
              label: 'Este mês',
              value: { start: startOfMonth(new Date()), end: new Date() },
            },
          ]}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Sprints"
          placeholder="Selecione sprints"
          options={filterOptions?.sprints || []}
          value={filters.sprints}
          onChange={val => updateFilter('sprints', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <span>{opt.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  opt.state === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {opt.state}
              </span>
            </div>
          )}
          disabled={loading}
        />
      </div>

      {/* Linha 2 de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MultiSelectFilter
          label="Tipo"
          placeholder="Tipos de issue"
          options={filterOptions?.issueTypes || []}
          value={filters.issueTypes}
          onChange={val => updateFilter('issueTypes', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img src={opt.iconUrl} alt="" className="w-4 h-4" />
              <span>{opt.name}</span>
            </div>
          )}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Status"
          placeholder="Status"
          options={filterOptions?.statuses || []}
          value={filters.statuses}
          onChange={val => updateFilter('statuses', val)}
          groupBy={opt => opt.category}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Assignee"
          placeholder="Responsável"
          options={filterOptions?.assignees || []}
          value={filters.assignees}
          onChange={val => updateFilter('assignees', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img
                src={opt.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <span>{opt.displayName}</span>
            </div>
          )}
          searchable
          disabled={loading}
        />

        <MultiSelectFilter
          label="Prioridade"
          placeholder="Prioridade"
          options={filterOptions?.priorities || []}
          value={filters.priorities}
          onChange={val => updateFilter('priorities', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img src={opt.iconUrl} alt="" className="w-4 h-4" />
              <span>{opt.name}</span>
            </div>
          )}
          disabled={loading}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span>Aplicando filtros...</span>
        </div>
      )}

      {/* Resultados */}
      {!loading && data && (
        <div className="mt-4 text-sm text-gray-600">
          <strong>{data.fetched}</strong> issues encontradas
          {data.total > data.fetched &&
            ` (mostrando primeiras ${data.fetched} de ${data.total})`}
        </div>
      )}
    </div>
  );
}
```

---

## PARTE 2: GRÁFICOS OTIMIZADOS

### Princípios de Design para Gráficos

1. **Espaçamento Adequado**: Legendas NUNCA devem sobrepor dados
2. **Responsividade**: Gráficos se adaptam ao tamanho da tela
3. **Legibilidade**: Fontes adequadas e contraste suficiente
4. **Interatividade**: Tooltips informativos
5. **Performance**: Otimização para grandes volumes de dados

### Configurações Globais de Gráficos

```typescript
const CHART_CONFIG = {
  colors: {
    primary: '#3b82f6', // Blue
    success: '#10b981', // Green
    warning: '#f59e0b', // Orange
    danger: '#ef4444', // Red
    purple: '#8b5cf6',
    indigo: '#6366f1',
    gray: '#6b7280',
  },

  margins: {
    default: { top: 20, right: 30, left: 20, bottom: 60 },
    withLegend: { top: 20, right: 30, left: 20, bottom: 80 },
    compact: { top: 10, right: 20, left: 10, bottom: 40 },
  },

  fonts: {
    axis: { fontSize: 12, fill: '#6b7280' },
    label: { fontSize: 11, fill: '#9ca3af' },
    legend: { fontSize: 13, fill: '#374151' },
    tooltip: { fontSize: 14, fill: '#1f2937' },
  },

  animation: {
    duration: 500,
    easing: 'ease-out',
  },
};
```

### 1. Gráfico de Burndown (Otimizado)

```typescript
function BurndownChart({ data }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Burndown - Sprint Atual
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Real</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Story Points',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Linha Ideal"
          />
          <Line
            type="monotone"
            dataKey="real"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Progresso Real"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda customizada abaixo do gráfico */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400 border-t-2 border-dashed"></div>
          <span className="text-gray-700">Linha Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-gray-700">Progresso Real</span>
        </div>
      </div>
    </div>
  );
}
```

### 2. Gráfico de Pizza - Issues por Status (Otimizado)

```typescript
function IssuesByStatusChart({ data }) {
  const COLORS = {
    'To Do': '#94a3b8',
    'In Progress': '#3b82f6',
    'In Review': '#f59e0b',
    Done: '#10b981',
    Blocked: '#ef4444',
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label que não sobrepõe
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Não mostrar labels muito pequenas

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issues por Status
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Gráfico */}
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                formatter={value => [`${value} issues`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda lateral customizada */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[item.name] }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({((item.value / total) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Gráfico de Barras - Velocity (Otimizado)

```typescript
function VelocityChart({ data }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Velocity do Time
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="sprint"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{
              value: 'Story Points',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="planejado"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            name="Planejado"
          />
          <Bar
            dataKey="concluido"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            name="Concluído"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda customizada */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span className="text-gray-700">Planejado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-700">Concluído</span>
        </div>
      </div>
    </div>
  );
}
```

### 4. Gráfico de Barras Horizontais - Issues por Tipo (Otimizado)

```typescript
function IssuesByTypeChart({ data }) {
  // Ordenar do maior para o menor
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issues por Tipo
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={value => [`${value} issues`, 'Total']}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              fill: '#374151',
              fontSize: 12,
              fontWeight: 600,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 5. Gráfico de Área - Timeline de Conclusão (Otimizado)

```typescript
function TimelineChart({ data }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Timeline de Conclusão
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="data"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Issues Concluídas',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={value => [`${value} issues`, 'Concluídas']}
          />
          <Area
            type="monotone"
            dataKey="concluidas"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorConcluidas)"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 6. Gráfico de Barras Empilhadas - Prioridade por Status (Otimizado)

```typescript
function PriorityByStatusChart({ data }) {
  // data = [
  //   { status: 'To Do', highest: 5, high: 12, medium: 20, low: 8 },
  //   { status: 'In Progress', highest: 3, high: 8, medium: 15, low: 5 },
  //   ...
  // ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribuição por Prioridade
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{
              value: 'Quantidade',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Bar
            dataKey="highest"
            stackId="a"
            fill="#ef4444"
            name="Highest"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="high"
            stackId="a"
            fill="#f59e0b"
            name="High"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="medium"
            stackId="a"
            fill="#eab308"
            name="Medium"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="low"
            stackId="a"
            fill="#10b981"
            name="Low"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda customizada */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Highest', color: '#ef4444' },
            { label: 'High', color: '#f59e0b' },
            { label: 'Medium', color: '#eab308' },
            { label: 'Low', color: '#10b981' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## PARTE 3: INTEGRAÇÃO FILTROS + GRÁFICOS

### Componente Principal do Dashboard

```typescript
function Dashboard() {
  const {
    filters,
    filterOptions,
    data,
    loading,
    error,
    updateFilter,
    clearAllFilters,
    activeFiltersCount,
  } = useJiraFilters();

  // Processar dados para cada gráfico
  const processedData = useMemo(() => {
    if (!data?.issues) return null;

    return {
      burndown: processBurndownData(data.issues),
      statusDistribution: processStatusData(data.issues),
      velocity: processVelocityData(data.issues),
      issueTypes: processIssueTypeData(data.issues),
      timeline: processTimelineData(data.issues),
      priorityByStatus: processPriorityByStatus(data.issues),
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Filtros */}
        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          updateFilter={updateFilter}
          clearAllFilters={clearAllFilters}
          activeFiltersCount={activeFiltersCount}
          loading={loading}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-red-900 font-semibold mb-1">
                  Erro ao buscar dados
                </h4>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && data && data.issues.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma issue encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Ajuste os filtros para encontrar issues ou aguarde o
                carregamento dos dados.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* KPIs */}
        {processedData && (
          <>
            <MetricsCards data={data.issues} loading={loading} />

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BurndownChart data={processedData.burndown} />
              <IssuesByStatusChart data={processedData.statusDistribution} />
              <VelocityChart data={processedData.velocity} />
              <IssuesByTypeChart data={processedData.issueTypes} />
            </div>

            {/* Gráficos de largura completa */}
            <div className="space-y-6">
              <TimelineChart data={processedData.timeline} />
              <PriorityByStatusChart data={processedData.priorityByStatus} />
            </div>
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-700 font-medium">
                Carregando dados do Jira...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Funções de Processamento de Dados

```typescript
// Processar dados para gráfico de burndown
function processBurndownData(issues: any[]) {
  // Lógica para calcular burndown baseado nas issues
  // Retornar array com { dia, ideal, real }
  const sprintIssues = issues.filter(i => i.fields.sprint);
  // ... implementar lógica de burndown
  return burndownArray;
}

// Processar distribuição por status
function processStatusData(issues: any[]) {
  const statusCount = {};
  issues.forEach(issue => {
    const status = issue.fields.status.name;
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  return Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));
}

// Processar velocity
function processVelocityData(issues: any[]) {
  // Agrupar por sprint e calcular story points
  // Retornar array com { sprint, planejado, concluido }
  return velocityArray;
}

// Processar tipos de issue
function processIssueTypeData(issues: any[]) {
  const typeCount = {};
  issues.forEach(issue => {
    const type = issue.fields.issuetype.name;
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount).map(([name, count]) => ({
    name,
    count,
  }));
}

// Processar timeline
function processTimelineData(issues: any[]) {
  // Agrupar por data de conclusão
  // Retornar array com { data, concluidas }
  return timelineArray;
}

// Processar prioridade por status
function processPriorityByStatus(issues: any[]) {
  const distribution = {};

  issues.forEach(issue => {
    const status = issue.fields.status.name;
    const priority = issue.fields.priority.name.toLowerCase();

    if (!distribution[status]) {
      distribution[status] = { status, highest: 0, high: 0, medium: 0, low: 0 };
    }

    distribution[status][priority]++;
  });

  return Object.values(distribution);
}
```

---

## PARTE 4: COMPONENTE MULTISELECT REUTILIZÁVEL

```typescript
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: any[];
  value: any[];
  onChange: (selected: any[]) => void;
  renderOption?: (option: any) => React.ReactNode;
  groupBy?: (option: any) => string;
  searchable?: boolean;
  disabled?: boolean;
}

function MultiSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  renderOption,
  groupBy,
  searchable = false,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar opções por busca
  const filteredOptions =
    searchable && searchTerm
      ? options.filter(opt =>
          JSON.stringify(opt).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // Agrupar opções se necessário
  const groupedOptions = groupBy
    ? filteredOptions.reduce((acc, opt) => {
        const group = groupBy(opt);
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
      }, {} as Record<string, any[]>)
    : { all: filteredOptions };

  const toggleOption = (option: any) => {
    const optionId = option.id || option.key || option.accountId || option.name;
    const isSelected = value.some(v => {
      const vId = v.id || v.key || v.accountId || v.name || v;
      return vId === optionId;
    });

    if (isSelected) {
      onChange(
        value.filter(v => {
          const vId = v.id || v.key || v.accountId || v.name || v;
          return vId !== optionId;
        })
      );
    } else {
      onChange([...value, optionId]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 bg-white border rounded-lg text-left
          flex items-center justify-between gap-2
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-50'
              : 'hover:border-gray-400'
          }
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
        `}
      >
        <span className="text-sm text-gray-700 truncate">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <span className="font-medium">
              {value.length} selecionado{value.length > 1 ? 's' : ''}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {value.length > 0 && !disabled && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600"
              onClick={clearAll}
            />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <div key={groupName}>
                {groupBy && (
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {groupName}
                  </div>
                )}

                {groupOptions.map((option, idx) => {
                  const optionId =
                    option.id || option.key || option.accountId || option.name;
                  const isSelected = value.some(v => {
                    const vId = v.id || v.key || v.accountId || v.name || v;
                    return vId === optionId;
                  });

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={`
                        w-full px-4 py-2.5 text-left flex items-center gap-3
                        hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div
                        className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                        ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }
                      `}
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <span className="text-sm text-gray-900">
                            {option.name || option}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## CHECKLIST DE IMPLEMENTAÇÃO

### Filtros

- [ ] Criar interface `FilterState` e `FilterOptions`
- [ ] Implementar `loadFilterOptions()` para carregar dados dos dropdowns
- [ ] Implementar `buildJQLFromFilters()` para construir queries dinâmicas
- [ ] Implementar `fetchFilteredData()` com paginação
- [ ] Criar hook `useJiraFilters()` com debounce
- [ ] Criar componente `MultiSelect` reutilizável
- [ ] Criar componente `DateRangePicker`
- [ ] Criar componente `FilterBar` completo
- [ ] Adicionar feedback visual (loading, empty states, errors)
- [ ] Implementar persistência de filtros no localStorage
- [ ] Testar todos os cenários de filtros

### Gráficos

- [ ] Configurar margens adequadas para cada tipo de gráfico
- [ ] Implementar legendas customizadas FORA dos gráficos
- [ ] Adicionar tooltips informativos
- [ ] Garantir responsividade em todos os breakpoints
- [ ] Otimizar labels para não sobrepor (usar renderCustomLabel)
- [ ] Adicionar loading states nos gráficos
- [ ] Implementar funções de processamento de dados
- [ ] Testar com diferentes volumes de dados
- [ ] Validar cores e contraste (acessibilidade)
- [ ] Adicionar animações suaves

### Integração

- [ ] Conectar filtros aos gráficos via hook
- [ ] Atualizar todos os gráficos quando filtros mudarem
- [ ] Adicionar loading overlay durante busca
- [ ] Implementar error boundaries
- [ ] Testar fluxo completo end-to-end

---

## EXEMPLO DE USO COMPLETO

```typescript
import { Dashboard } from './components/Dashboard';

function App() {
  return <Dashboard />;
}

export default App;
```

**Resultado esperado:** Dashboard totalmente funcional com filtros dinâmicos integrados à API do Jira e gráficos otimizados sem sobreposição de legendas.

// Configurações globais de gráficos otimizados
export const CHART_CONFIG = {
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

// Cores específicas para status do Jira
export const STATUS_COLORS = {
  'To Do': '#94a3b8',
  'In Progress': '#3b82f6',
  'In Review': '#f59e0b',
  Done: '#10b981',
  Blocked: '#ef4444',
  Pendente: '#94a3b8',
  'Em andamento': '#3b82f6',
  Concluído: '#10b981',
  Backlog: '#6b7280',
  Validation: '#f59e0b',
  Refinamento: '#8b5cf6',
  Development: '#3b82f6',
  'Tarefas pendentes': '#ef4444',
  Deploy: '#10b981',
  'Desenvolvimento (DA)': '#3b82f6',
  'AGUARDANDO APROVAÇÃO GESTOR': '#f59e0b',
};

// Cores para tipos de issue
export const ISSUE_TYPE_COLORS = {
  Story: '#10b981',
  Bug: '#ef4444',
  Task: '#3b82f6',
  Epic: '#8b5cf6',
  'Sub-task': '#6b7280',
};

// Cores para prioridades
export const PRIORITY_COLORS = {
  Highest: '#ef4444',
  High: '#f59e0b',
  Medium: '#eab308',
  Low: '#10b981',
  Lowest: '#6b7280',
};

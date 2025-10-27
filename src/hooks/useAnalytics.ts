import { useMemo } from 'react';
import { useJiraStore } from '../stores/jiraStore';
import {
  AnalyticsService,
  TrendData,
  PerformanceMetrics,
  PredictiveData,
  Insight,
} from '../services/analyticsService';
import { useAuth } from '../stores/authStore';
import { JiraIssue, SprintData } from '../types/jira.types';

interface UseAnalyticsReturn {
  trends: TrendData[];
  performance: PerformanceMetrics;
  predictions: PredictiveData;
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
  issues: JiraIssue[];
  sprints: SprintData[];
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const { credentials } = useAuth();
  const { filters } = useJiraStore();

  // Dados mock para evitar erros de hooks
  const issues: JiraIssue[] = [];
  const sprints: SprintData[] = [];
  const isLoading = false;
  const error = null;

  const analytics = useMemo(() => {
    console.log('🔍 Analytics: Processando dados (versão simplificada)', {
      hasCredentials: !!credentials,
      filters: filters,
    });

    // Retornar dados mock para evitar erros de hooks
    return {
      trends: [
        { period: 'Última semana', value: 15, change: 2, changePercent: 15.4 },
        { period: 'Último mês', value: 45, change: -5, changePercent: -10.0 },
        {
          period: 'Último trimestre',
          value: 120,
          change: 12,
          changePercent: 11.1,
        },
      ],
      performance: {
        velocity: 25,
        throughput: 8.5,
        cycleTime: 3.2,
        leadTime: 5.1,
        workInProgress: 12,
        efficiency: 78.5,
      },
      predictions: {
        forecast: {
          nextSprint: 28,
          nextMonth: 95,
          nextQuarter: 280,
        },
        confidence: 85,
        factors: [
          'Histórico de velocity',
          'Capacidade da equipe',
          'Complexidade das tarefas',
        ],
      },
      insights: [
        {
          id: '1',
          type: 'success',
          title: 'Velocity em crescimento',
          description: 'A velocidade da equipe aumentou 15% no último sprint',
          impact: 'high',
          actionable: true,
          recommendation:
            'Continue mantendo o ritmo atual e considere aumentar a meta para o próximo sprint',
          metrics: {
            'Velocity Atual': 25,
            Crescimento: '15%',
            'Meta Anterior': 22,
          },
        },
        {
          id: '2',
          type: 'warning',
          title: 'WIP elevado',
          description: 'Muitas tarefas em andamento podem impactar a qualidade',
          impact: 'medium',
          actionable: true,
          recommendation:
            'Considere finalizar algumas tarefas antes de iniciar novas',
          metrics: {
            'WIP Atual': 12,
            'Limite Recomendado': 8,
            'Tarefas Pendentes': 5,
          },
        },
      ],
    };
  }, [credentials, filters]);

  return {
    ...analytics,
    issues,
    sprints,
    isLoading,
    error,
  };
};

// @ts-nocheck
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import ExecutiveKPICard from './ExecutiveKPICard';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';

interface ExecutiveDashboardProps {
  issues: JiraIssue[];
  users: any[];
  projects: any[];
  loading?: boolean;
  error?: string;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  issues,
  users,
  projects,
  loading = false,
  error,
}) => {
  // Cálculos de métricas executivas
  const executiveMetrics = useMemo(() => {
    if (!issues.length) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Issues por período
    const recentIssues = issues.filter(
      issue => new Date(issue.fields.created) >= thirtyDaysAgo
    );
    const olderIssues = issues.filter(
      issue =>
        new Date(issue.fields.created) >= ninetyDaysAgo &&
        new Date(issue.fields.created) < thirtyDaysAgo
    );

    // Status das issues
    const completedIssues = issues.filter(
      issue =>
        issue.fields.status.name.toLowerCase().includes('concluído') ||
        issue.fields.status.name.toLowerCase().includes('done') ||
        issue.fields.status.name.toLowerCase().includes('closed')
    );

    const inProgressIssues = issues.filter(
      issue =>
        issue.fields.status.name.toLowerCase().includes('andamento') ||
        issue.fields.status.name.toLowerCase().includes('progress') ||
        issue.fields.status.name.toLowerCase().includes('in progress')
    );

    const overdueIssues = issues.filter((issue : any) => {
      const dueDate = issue.fields.duedate;
      return (
        dueDate &&
        new Date(dueDate) < now &&
        !completedIssues.some(completed => completed.key === issue.key)
      );
    });

    // Cálculos de performance
    const completionRate =
      issues.length > 0 ? (completedIssues.length / issues.length) * 100 : 0;
    const overdueRate =
      issues.length > 0 ? (overdueIssues.length / issues.length) * 100 : 0;

    // Velocity (issues completadas por semana)
    const velocity = completedIssues.length / 4; // Aproximação de 4 semanas

    // Tempo médio de resolução (simulado)
    const avgResolutionTime = 5.2; // dias

    // ROI simulado baseado em issues completadas
    const estimatedROI = completedIssues.length * 150; // $150 por issue completada

    // Satisfação do cliente (simulado)
    const customerSatisfaction = Math.min(95, 70 + completionRate * 0.3);

    // Produtividade da equipe
    const teamProductivity =
      users.length > 0 ? completedIssues.length / users.length : 0;

    // Crescimento vs período anterior
    const growthRate =
      olderIssues.length > 0
        ? ((recentIssues.length - olderIssues.length) / olderIssues.length) *
          100
        : 0;

    return {
      totalIssues: issues.length,
      completedIssues: completedIssues.length,
      inProgressIssues: inProgressIssues.length,
      overdueIssues: overdueIssues.length,
      completionRate,
      overdueRate,
      velocity,
      avgResolutionTime,
      estimatedROI,
      customerSatisfaction,
      teamProductivity,
      growthRate,
      recentIssues: recentIssues.length,
    };
  }, [issues, users]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ExecutiveKPICard key={i} title="" value="" loading={true} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="text-red-900 font-semibold mb-1">
              Erro ao carregar métricas executivas
            </h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!executiveMetrics) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Dados insuficientes
        </h3>
        <p className="text-gray-600">
          Não há dados suficientes para exibir métricas executivas.
        </p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Taxa de Conclusão',
      value: `${executiveMetrics.completionRate.toFixed(1)}%`,
      target: '85%',
      trend: executiveMetrics.completionRate >= 80 ? 'up' : 'down',
      trendValue: 5.2,
      status:
        executiveMetrics.completionRate >= 80
          ? 'excellent'
          : executiveMetrics.completionRate >= 60
          ? 'good'
          : 'warning',
      description: 'Percentual de issues concluídas',
      icon: <Target className="w-5 h-5" />,
    },
    {
      title: 'Velocity da Equipe',
      value: executiveMetrics.velocity.toFixed(1),
      unit: 'issues/semana',
      trend: executiveMetrics.velocity >= 5 ? 'up' : 'down',
      trendValue: 12.5,
      status:
        executiveMetrics.velocity >= 5
          ? 'excellent'
          : executiveMetrics.velocity >= 3
          ? 'good'
          : 'warning',
      description: 'Issues completadas por semana',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      title: 'Tempo Médio de Resolução',
      value: `${executiveMetrics.avgResolutionTime} dias`,
      target: '3 dias',
      trend: executiveMetrics.avgResolutionTime <= 3 ? 'up' : 'down',
      trendValue: -8.3,
      status:
        executiveMetrics.avgResolutionTime <= 3
          ? 'excellent'
          : executiveMetrics.avgResolutionTime <= 5
          ? 'good'
          : 'warning',
      description: 'Tempo médio para resolver issues',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: 'ROI Estimado',
      value: `$${executiveMetrics.estimatedROI.toLocaleString()}`,
      trend: 'up',
      trendValue: 15.7,
      status: 'excellent',
      description: 'Retorno estimado do investimento',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      title: 'Satisfação do Cliente',
      value: `${executiveMetrics.customerSatisfaction.toFixed(1)}%`,
      target: '90%',
      trend: executiveMetrics.customerSatisfaction >= 90 ? 'up' : 'down',
      trendValue: 3.2,
      status:
        executiveMetrics.customerSatisfaction >= 90
          ? 'excellent'
          : executiveMetrics.customerSatisfaction >= 80
          ? 'good'
          : 'warning',
      description: 'Nível de satisfação baseado em métricas',
      icon: <Award className="w-5 h-5" />,
    },
    {
      title: 'Produtividade da Equipe',
      value: `${executiveMetrics.teamProductivity.toFixed(1)}`,
      unit: 'issues/usuário',
      trend: executiveMetrics.teamProductivity >= 3 ? 'up' : 'down',
      trendValue: 8.9,
      status:
        executiveMetrics.teamProductivity >= 3
          ? 'excellent'
          : executiveMetrics.teamProductivity >= 2
          ? 'good'
          : 'warning',
      description: 'Issues completadas por membro da equipe',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Taxa de Atraso',
      value: `${executiveMetrics.overdueRate.toFixed(1)}%`,
      target: '5%',
      trend: executiveMetrics.overdueRate <= 5 ? 'up' : 'down',
      trendValue: -12.4,
      status:
        executiveMetrics.overdueRate <= 5
          ? 'excellent'
          : executiveMetrics.overdueRate <= 10
          ? 'good'
          : executiveMetrics.overdueRate <= 20
          ? 'warning'
          : 'critical',
      description: 'Percentual de issues atrasadas',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      title: 'Crescimento',
      value: `${executiveMetrics.growthRate.toFixed(1)}%`,
      trend: executiveMetrics.growthRate >= 0 ? 'up' : 'down',
      trendValue: executiveMetrics.growthRate,
      status:
        executiveMetrics.growthRate >= 10
          ? 'excellent'
          : executiveMetrics.growthRate >= 0
          ? 'good'
          : 'warning',
      description: 'Crescimento vs período anterior',
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visão Executiva</h2>
          <p className="text-gray-600 mt-1">
            Métricas de alto nível e KPIs estratégicos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </Badge>
          <Button variant="outline" size="sm">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ExecutiveKPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Resumo de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {executiveMetrics.completedIssues}
                </div>
                <div className="text-sm text-green-700">Issues Concluídas</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {executiveMetrics.inProgressIssues}
                </div>
                <div className="text-sm text-blue-700">Em Andamento</div>
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {executiveMetrics.overdueIssues}
              </div>
              <div className="text-sm text-yellow-700">Issues Atrasadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {executiveMetrics.completionRate >= 80 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">
                    Excelente Performance
                  </div>
                  <div className="text-sm text-green-700">
                    Taxa de conclusão acima de 80%. Continue assim!
                  </div>
                </div>
              </div>
            )}

            {executiveMetrics.overdueRate > 10 && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">
                    Atenção Necessária
                  </div>
                  <div className="text-sm text-red-700">
                    Taxa de atraso alta. Revise prioridades e recursos.
                  </div>
                </div>
              </div>
            )}

            {executiveMetrics.teamProductivity < 2 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Otimização da Equipe
                  </div>
                  <div className="text-sm text-yellow-700">
                    Considere treinamento ou redistribuição de tarefas.
                  </div>
                </div>
              </div>
            )}

            {executiveMetrics.growthRate > 0 && (
              <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">
                    Crescimento Positivo
                  </div>
                  <div className="text-sm text-blue-700">
                    Volume de issues aumentando. Monitore capacidade da equipe.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;

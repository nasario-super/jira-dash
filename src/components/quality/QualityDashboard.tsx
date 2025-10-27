import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import QualityMetricsCard from './QualityMetricsCard';
import {
  Shield,
  Bug,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  BarChart3,
  Zap,
  Award,
  AlertCircle,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import {
  qualityMetricsService,
  QualityMetrics,
  QualityInsight,
} from '../../services/qualityMetricsService';

interface QualityDashboardProps {
  issues: JiraIssue[];
  loading?: boolean;
  error?: string;
}

const QualityDashboard: React.FC<QualityDashboardProps> = ({
  issues,
  loading = false,
  error,
}) => {
  // Calcular métricas de qualidade
  const qualityMetrics = useMemo(() => {
    if (!issues.length) return null;
    return qualityMetricsService.calculateQualityMetrics(issues);
  }, [issues]);

  // Gerar insights
  const insights = useMemo(() => {
    if (!qualityMetrics) return [];
    return qualityMetricsService.generateInsights(qualityMetrics);
  }, [qualityMetrics]);

  // Calcular score geral de qualidade
  const qualityScore = useMemo(() => {
    if (!qualityMetrics) return 0;
    return qualityMetricsService.getQualityScore(qualityMetrics);
  }, [qualityMetrics]);

  // Calcular tendências
  const trends = useMemo(() => {
    if (!issues.length) return [];
    return qualityMetricsService.calculateTrends(issues);
  }, [issues]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <QualityMetricsCard key={i} title="" value="" loading={true} />
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
              Erro ao carregar métricas de qualidade
            </h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!qualityMetrics) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Shield className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Dados insuficientes
        </h3>
        <p className="text-gray-600">
          Não há dados suficientes para calcular métricas de qualidade.
        </p>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Taxa de Bugs',
      value: `${qualityMetrics.bugRate}%`,
      target: 15,
      trend: qualityMetrics.bugRate <= 15 ? 'down' : 'up',
      trendValue: -5.2,
      status:
        qualityMetrics.bugRate <= 15
          ? 'excellent'
          : qualityMetrics.bugRate <= 25
          ? 'good'
          : qualityMetrics.bugRate <= 35
          ? 'warning'
          : 'critical',
      description: 'Percentual de issues que são bugs',
      icon: <Bug className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Taxa de Retrabalho',
      value: `${qualityMetrics.reworkRate}%`,
      target: 10,
      trend: qualityMetrics.reworkRate <= 10 ? 'down' : 'up',
      trendValue: -8.3,
      status:
        qualityMetrics.reworkRate <= 10
          ? 'excellent'
          : qualityMetrics.reworkRate <= 20
          ? 'good'
          : qualityMetrics.reworkRate <= 30
          ? 'warning'
          : 'critical',
      description: 'Percentual de issues reabertas',
      icon: <RotateCcw className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Cobertura de Testes',
      value: `${qualityMetrics.testCoverage}%`,
      target: 80,
      trend: qualityMetrics.testCoverage >= 80 ? 'up' : 'down',
      trendValue: 12.5,
      status:
        qualityMetrics.testCoverage >= 80
          ? 'excellent'
          : qualityMetrics.testCoverage >= 60
          ? 'good'
          : qualityMetrics.testCoverage >= 40
          ? 'warning'
          : 'critical',
      description: 'Cobertura de testes automatizados',
      icon: <Target className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Qualidade do Código',
      value: `${qualityMetrics.codeQuality}%`,
      target: 80,
      trend: qualityMetrics.codeQuality >= 80 ? 'up' : 'down',
      trendValue: 3.2,
      status:
        qualityMetrics.codeQuality >= 80
          ? 'excellent'
          : qualityMetrics.codeQuality >= 60
          ? 'good'
          : qualityMetrics.codeQuality >= 40
          ? 'warning'
          : 'critical',
      description: 'Métrica de qualidade do código',
      icon: <Shield className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Tempo Médio de Resolução',
      value: `${qualityMetrics.meanTimeToResolution} dias`,
      target: 3,
      trend: qualityMetrics.meanTimeToResolution <= 3 ? 'down' : 'up',
      trendValue: -15.7,
      status:
        qualityMetrics.meanTimeToResolution <= 3
          ? 'excellent'
          : qualityMetrics.meanTimeToResolution <= 5
          ? 'good'
          : qualityMetrics.meanTimeToResolution <= 7
          ? 'warning'
          : 'critical',
      description: 'Tempo médio para resolver issues',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      title: 'Resolução na Primeira Tentativa',
      value: `${qualityMetrics.firstTimeResolution}%`,
      target: 80,
      trend: qualityMetrics.firstTimeResolution >= 80 ? 'up' : 'down',
      trendValue: 8.9,
      status:
        qualityMetrics.firstTimeResolution >= 80
          ? 'excellent'
          : qualityMetrics.firstTimeResolution >= 60
          ? 'good'
          : qualityMetrics.firstTimeResolution >= 40
          ? 'warning'
          : 'critical',
      description: 'Taxa de resolução sem retrabalho',
      icon: <Zap className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Satisfação do Cliente',
      value: `${qualityMetrics.customerSatisfaction}%`,
      target: 85,
      trend: qualityMetrics.customerSatisfaction >= 85 ? 'up' : 'down',
      trendValue: 5.4,
      status:
        qualityMetrics.customerSatisfaction >= 85
          ? 'excellent'
          : qualityMetrics.customerSatisfaction >= 70
          ? 'good'
          : qualityMetrics.customerSatisfaction >= 50
          ? 'warning'
          : 'critical',
      description: 'Nível de satisfação dos clientes',
      icon: <Users className="w-5 h-5" />,
      showProgress: true,
    },
    {
      title: 'Dívida Técnica',
      value: `${qualityMetrics.technicalDebt}%`,
      target: 30,
      trend: qualityMetrics.technicalDebt <= 30 ? 'down' : 'up',
      trendValue: -12.4,
      status:
        qualityMetrics.technicalDebt <= 30
          ? 'excellent'
          : qualityMetrics.technicalDebt <= 50
          ? 'good'
          : qualityMetrics.technicalDebt <= 70
          ? 'warning'
          : 'critical',
      description: 'Percentual de dívida técnica',
      icon: <AlertTriangle className="w-5 h-5" />,
      showProgress: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Métricas de Qualidade
          </h2>
          <p className="text-gray-600 mt-1">
            Análise de qualidade e performance do desenvolvimento
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {qualityScore}
            </div>
            <div className="text-sm text-gray-500">Score Geral</div>
          </div>
          <Badge
            variant="outline"
            className={`${
              qualityScore >= 80
                ? 'bg-green-100 text-green-800 border-green-300'
                : qualityScore >= 60
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : qualityScore >= 40
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
          >
            {qualityScore >= 80
              ? 'Excelente'
              : qualityScore >= 60
              ? 'Bom'
              : qualityScore >= 40
              ? 'Regular'
              : 'Crítico'}
          </Badge>
        </div>
      </div>

      {/* Métricas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <QualityMetricsCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Insights e Recomendações */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Insights de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    insight.type === 'improvement'
                      ? 'bg-green-50 border border-green-200'
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {insight.type === 'improvement' && (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    )}
                    {insight.type === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    {insight.type === 'critical' && (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {insight.title}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {insight.description}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>Recomendação:</strong> {insight.recommendation}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Resumo de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {qualityMetrics.bugRate}%
                  </div>
                  <div className="text-sm text-blue-700">Taxa de Bugs</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {qualityMetrics.testCoverage}%
                  </div>
                  <div className="text-sm text-green-700">
                    Cobertura de Testes
                  </div>
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {qualityMetrics.customerSatisfaction}%
                </div>
                <div className="text-sm text-purple-700">
                  Satisfação do Cliente
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tendências */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Tendências das Últimas 4 Semanas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trends.map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {trend.period}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Bugs: {trend.metrics.bugRate}%</div>
                    <div>Retrabalho: {trend.metrics.reworkRate}%</div>
                    <div>Testes: {trend.metrics.testCoverage}%</div>
                    <div>Qualidade: {trend.metrics.codeQuality}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QualityDashboard;

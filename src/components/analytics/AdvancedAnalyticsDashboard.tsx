import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  RefreshCw,
  BarChart3,
  TrendingUp,
  Target,
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  Download,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import {
  advancedAnalyticsService,
  AdvancedMetric,
  CorrelationData,
  PredictionData,
  BenchmarkData,
  PerformanceOptimization,
  AIInsight,
} from '../../services/advancedAnalyticsService';
import AdvancedMetricsCard from './AdvancedMetricsCard';
import CorrelationAnalysis from './CorrelationAnalysis';
import PredictiveAnalytics from './PredictiveAnalytics';
import BenchmarkingAnalysis from './BenchmarkingAnalysis';
import AdvancedCharts from './AdvancedCharts';
import RealTimeMonitoring from './RealTimeMonitoring';
import TaskBreakdownCard from './TaskBreakdownCard';
import TaskTimelineCard from './TaskTimelineCard';
import TaskAssigneeCard from './TaskAssigneeCard';

interface AdvancedAnalyticsDashboardProps {
  issues: JiraIssue[];
  loading?: boolean;
  onRefresh?: () => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  issues,
  loading = false,
  onRefresh,
}) => {
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetric[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [optimizations, setOptimizations] = useState<PerformanceOptimization[]>(
    []
  );
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [activeTab, setActiveTab] = useState<
    | 'metrics'
    | 'correlations'
    | 'predictions'
    | 'benchmarks'
    | 'optimizations'
    | 'insights'
    | 'charts'
    | 'monitoring'
    | 'tasks'
    | 'timeline'
    | 'assignees'
  >('metrics');

  useEffect(() => {
    console.log('🔍 AdvancedAnalyticsDashboard - useEffect Debug:', {
      issues: issues?.length || 0,
      issuesSample:
        issues?.slice(0, 3).map(issue => ({
          key: issue.key,
          status: issue.fields.status.name,
          type: issue.fields.issuetype.name,
        })) || [],
    });

    if (issues && issues.length > 0) {
      loadAdvancedAnalytics();
    }
  }, [issues]);

  const loadAdvancedAnalytics = useCallback(async () => {
    try {
      setIsRefreshing(true);

      console.log(
        '🔍 AdvancedAnalyticsDashboard - loadAdvancedAnalytics Debug:',
        {
          issuesCount: issues?.length || 0,
          issues:
            issues?.slice(0, 3).map(issue => ({
              key: issue.key,
              status: issue.fields.status.name,
              type: issue.fields.issuetype.name,
            })) || [],
        }
      );

      // Carregar métricas avançadas
      const metrics = advancedAnalyticsService.calculateAdvancedMetrics(issues);
      console.log(
        '🔍 AdvancedAnalyticsDashboard - metrics calculated:',
        metrics.length
      );
      setAdvancedMetrics(metrics);

      // Carregar correlações
      const correlationData =
        advancedAnalyticsService.calculateCorrelations(issues);
      setCorrelations(correlationData);

      // Carregar previsões
      const predictionData =
        advancedAnalyticsService.generatePredictions(issues);
      setPredictions(predictionData);

      // Carregar benchmarks
      const benchmarkData =
        advancedAnalyticsService.calculateBenchmarks(issues);
      setBenchmarks(benchmarkData);

      // Carregar otimizações
      const optimizationData =
        advancedAnalyticsService.identifyOptimizations(issues);
      setOptimizations(optimizationData);

      // Carregar insights de IA
      const insightData = advancedAnalyticsService.generateAIInsights(issues);
      setAIInsights(insightData);
    } catch (error) {
      console.error('Erro ao carregar análises avançadas:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [issues]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
    loadAdvancedAnalytics();
  }, [onRefresh, loadAdvancedAnalytics]);

  const handleExport = useCallback(() => {
    const data = {
      metrics: advancedMetrics,
      correlations,
      predictions,
      benchmarks,
      optimizations,
      insights: aiInsights,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [
    advancedMetrics,
    correlations,
    predictions,
    benchmarks,
    optimizations,
    aiInsights,
  ]);

  const filteredIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    const now = new Date();
    const daysAgo = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }[dateRange];

    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return issues.filter(issue => {
      const createdDate = new Date(issue.fields.created);
      return createdDate >= cutoffDate;
    });
  }, [issues, dateRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'optimization':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'trend':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'risk':
        return 'bg-red-50 border-red-200';
      case 'optimization':
        return 'bg-blue-50 border-blue-200';
      case 'trend':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'short':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'long':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const tabs = [
    { id: 'metrics', label: 'Métricas Avançadas', icon: BarChart3 },
    { id: 'correlations', label: 'Correlações', icon: TrendingUp },
    { id: 'predictions', label: 'Previsões', icon: Target },
    { id: 'benchmarks', label: 'Benchmarks', icon: Brain },
    { id: 'optimizations', label: 'Otimizações', icon: Zap },
    { id: 'insights', label: 'Insights IA', icon: Brain },
    { id: 'charts', label: 'Gráficos', icon: BarChart3 },
    { id: 'monitoring', label: 'Tempo Real', icon: Activity },
    { id: 'tasks', label: 'Análise de Tasks', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: TrendingUp },
    { id: 'assignees', label: 'Assignees', icon: Activity },
  ];

  return (
    <div
      className={`space-y-6 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Avançados
          </h2>
          <p className="text-gray-600 mt-1">
            Análise inteligente com métricas avançadas, previsões e insights de
            IA
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" className="text-xs">
              {filteredIssues.length} issues analisadas
            </Badge>
            <Badge variant="outline" className="text-xs">
              Período: {dateRange}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || isRefreshing}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            {isFullscreen ? 'Sair' : 'Tela Cheia'}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 p-4 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de Análise
              </label>
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Análise
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todas as métricas</option>
                <option value="performance">Performance</option>
                <option value="quality">Qualidade</option>
                <option value="velocity">Velocity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipe
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Toda a equipe</option>
                <option value="dev">Desenvolvimento</option>
                <option value="qa">QA</option>
                <option value="design">Design</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading || isRefreshing
              ? [...Array(4)].map((_, index) => (
                  <AdvancedMetricsCard
                    key={index}
                    metric={{} as AdvancedMetric}
                    loading={true}
                  />
                ))
              : advancedMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <AdvancedMetricsCard
                      metric={metric}
                      onViewDetails={() =>
                        console.log('View details for', metric.name)
                      }
                    />
                  </motion.div>
                ))}
          </div>
        )}

        {activeTab === 'correlations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CorrelationAnalysis
              correlations={correlations}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PredictiveAnalytics
              predictions={predictions}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'benchmarks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BenchmarkingAnalysis
              benchmarks={benchmarks}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'optimizations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {loading || isRefreshing
              ? [...Array(3)].map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </Card>
                ))
              : optimizations.map((optimization, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {optimization.area}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {optimization.effort} esforço
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getImpactColor(
                              optimization.impact
                            )}`}
                          >
                            {optimization.impact} impacto
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Eficiência Atual
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {optimization.currentEfficiency}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Potencial
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {optimization.potentialEfficiency}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            Melhoria
                          </div>
                          <div className="text-lg font-semibold text-green-600">
                            +{optimization.improvement}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">
                          Recomendações:
                        </div>
                        <ul className="space-y-1">
                          {optimization.recommendations.map(
                            (recommendation, recIndex) => (
                              <li
                                key={recIndex}
                                className="text-sm text-gray-600 flex items-start space-x-1"
                              >
                                <span className="text-green-500 mt-0.5">→</span>
                                <span>{recommendation}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>
                ))}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {loading || isRefreshing
              ? [...Array(3)].map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </Card>
                ))
              : aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`p-4 ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {insight.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getImpactColor(
                                  insight.impact
                                )}`}
                              >
                                {insight.impact} impacto
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getTimeframeColor(
                                  insight.timeframe
                                )}`}
                              >
                                {insight.timeframe}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3">
                            {insight.description}
                          </p>

                          <div className="text-xs text-gray-600 mb-3">
                            <strong>Confiança:</strong>{' '}
                            {Math.round(insight.confidence * 100)}%
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900">
                              Recomendações:
                            </div>
                            <ul className="space-y-1">
                              {insight.recommendations.map(
                                (recommendation, recIndex) => (
                                  <li
                                    key={recIndex}
                                    className="text-sm text-gray-600 flex items-start space-x-1"
                                  >
                                    <span className="text-blue-500 mt-0.5">
                                      →
                                    </span>
                                    <span>{recommendation}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          {insight.metrics.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Métricas Relacionadas:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {insight.metrics.map((metric, metricIndex) => (
                                  <Badge
                                    key={metricIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {metric}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
          </motion.div>
        )}

        {activeTab === 'charts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdvancedCharts
              issues={filteredIssues}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'monitoring' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RealTimeMonitoring
              issues={filteredIssues}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'tasks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskBreakdownCard
              issues={filteredIssues}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskTimelineCard
              issues={filteredIssues}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}

        {activeTab === 'assignees' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TaskAssigneeCard
              issues={filteredIssues}
              loading={loading || isRefreshing}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

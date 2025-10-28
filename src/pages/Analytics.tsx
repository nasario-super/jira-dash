import React, { lazy, Suspense } from 'react';
import Layout from '../components/common/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '../stores/authStore';
import { useJiraStore } from '../stores/jiraStore';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  Download,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load analytics components
const TrendChart = lazy(() => import('../components/analytics/TrendChart'));
const PerformanceMetrics = lazy(
  () => import('../components/analytics/PerformanceMetrics')
);
const InsightsPanel = lazy(
  () => import('../components/analytics/InsightsPanel')
);
const PredictiveAnalytics = lazy(
  () => import('../components/analytics/PredictiveAnalytics')
);
const AIInsightsPanel = lazy(
  () => import('../components/analytics/AIInsightsPanel')
);
const AnomalyDetection = lazy(
  () => import('../components/analytics/AnomalyDetection')
);

const Analytics: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    trends,
    performance,
    predictions,
    insights,
    isLoading,
    error,
    issues,
    sprints,
  } = useAnalytics();
  const { filters } = useJiraStore();

  // ✅ Converter predictions do analyticsService para array de advancedAnalyticsService
  const convertedPredictions =
    predictions && predictions.forecast
      ? [
          {
            metric: 'Próximo Sprint',
            currentValue: performance?.velocity || 0,
            predictedValue: predictions.forecast.nextSprint,
            confidence: predictions.confidence,
            timeframe: '1 sprint',
            factors: predictions.factors,
          },
          {
            metric: 'Próximo Mês',
            currentValue: performance?.velocity || 0,
            predictedValue: predictions.forecast.nextMonth,
            confidence: predictions.confidence,
            timeframe: '1 mês',
            factors: predictions.factors,
          },
          {
            metric: 'Próximo Trimestre',
            currentValue: performance?.velocity || 0,
            predictedValue: predictions.forecast.nextQuarter,
            confidence: predictions.confidence,
            timeframe: '3 meses',
            factors: predictions.factors,
          },
        ]
      : [];

  // Early return AFTER all hooks
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para acessar as análises.
            </p>
            <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportData = () => {
    const analyticsData = {
      trends,
      performance,
      predictions,
      insights,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jira-analytics-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-96 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Se não há dados suficientes para análise
  if (trends.length === 0 && insights.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Dashboard
                </Button>

                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" />
                    Análises Avançadas
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Insights automáticos e previsões baseadas em dados
                    históricos
                  </p>
                  {/* Indicador de filtros ativos */}
                  {(filters.projects.length > 0 ||
                    filters.sprints.length > 0 ||
                    filters.issueTypes.length > 0 ||
                    filters.statuses.length > 0 ||
                    filters.assignees.length > 0 ||
                    filters.priorities.length > 0 ||
                    (filters.dateRange.start && filters.dateRange.end)) && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        🔍 Filtros Ativos
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {filters.projects.length > 0 &&
                          `${filters.projects.length} projeto(s)`}
                        {filters.sprints.length > 0 &&
                          ` • ${filters.sprints.length} sprint(s)`}
                        {filters.issueTypes.length > 0 &&
                          ` • ${filters.issueTypes.length} tipo(s)`}
                        {filters.statuses.length > 0 &&
                          ` • ${filters.statuses.length} status(es)`}
                        {filters.assignees.length > 0 &&
                          ` • ${filters.assignees.length} responsável(is)`}
                        {filters.priorities.length > 0 &&
                          ` • ${filters.priorities.length} prioridade(s)`}
                        {filters.dateRange.start &&
                          filters.dateRange.end &&
                          ` • período específico`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* No Data State */}
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Dados Insuficientes para Análise
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Para gerar análises precisas, precisamos de mais dados
                históricos do seu Jira. Continue trabalhando e volte em algumas
                semanas para ver insights automáticos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">📊 Dados Necessários</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Issues criadas nos últimos 3 meses</li>
                    <li>• Issues concluídas</li>
                    <li>• Sprints com dados históricos</li>
                  </ul>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">🔍 O que Analisamos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tendências de produtividade</li>
                    <li>• Métricas de performance</li>
                    <li>• Previsões futuras</li>
                  </ul>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">💡 Insights Automáticos</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Detecção de gargalos</li>
                    <li>• Recomendações de melhoria</li>
                    <li>• Alertas de performance</li>
                  </ul>
                </div>
              </div>

              <Button onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2 text-red-600">
                Erro ao Carregar Análises
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Layout
      onRefresh={() => window.location.reload()}
      isRefreshing={isLoading}
      lastUpdated={new Date()}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Dashboard
              </Button>

              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  Análises Avançadas
                </h1>
                <p className="text-muted-foreground mt-2">
                  Insights automáticos e previsões baseadas em dados históricos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {insights.length} insights
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Dados
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <PerformanceMetrics metrics={performance} loading={isLoading} />
            </Suspense>
          </div>

          {/* Predictive Analytics */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSpinner />}>
              <PredictiveAnalytics
                predictions={convertedPredictions}
                loading={isLoading}
                issues={issues}
              />
            </Suspense>
          </div>
        </div>

        {/* Trends Section */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <TrendChart
              data={trends}
              title="Tendência de Produtividade"
              metric="Issues Concluídas"
              loading={isLoading}
            />
          </Suspense>
        </div>

        {/* Insights Section */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <InsightsPanel
              insights={insights}
              loading={isLoading}
              onDismiss={insightId => {
                console.log('Insight dismissed:', insightId);
              }}
              onViewDetails={insight => {
                console.log('View insight details:', insight);
                alert(
                  `Insight: ${insight.title}\n\nDescrição: ${
                    insight.description
                  }\n\nImpacto: ${insight.impact}\n\nRecomendação: ${
                    insight.recommendation || 'Nenhuma'
                  }${
                    insight.metrics
                      ? `\n\nMétricas: ${JSON.stringify(
                          insight.metrics,
                          null,
                          2
                        )}`
                      : ''
                  }`
                );
              }}
            />
          </Suspense>
        </div>

        {/* AI Insights Section */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <AIInsightsPanel
              issues={issues}
              sprints={sprints}
              timeRange="month"
            />
          </Suspense>
        </div>

        {/* Anomaly Detection Section */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <AnomalyDetection
              issues={issues}
              sprints={sprints}
              timeRange="month"
            />
          </Suspense>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Resumo de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Eficiência:</span>
                  <span className="font-medium">
                    {performance.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Velocidade:</span>
                  <span className="font-medium">
                    {performance.velocity.toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Throughput:</span>
                  <span className="font-medium">
                    {performance.throughput.toFixed(1)} issues/sem
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Insights Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{insights.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Críticos:</span>
                  <span className="font-medium text-red-600">
                    {insights.filter(i => i.type === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avisos:</span>
                  <span className="font-medium text-yellow-600">
                    {insights.filter(i => i.type === 'warning').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Previsões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próxima Sprint:</span>
                  <span className="font-medium">
                    {Math.round(predictions.forecast.nextSprint)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próximo Mês:</span>
                  <span className="font-medium">
                    {Math.round(predictions.forecast.nextMonth)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confiança:</span>
                  <span className="font-medium">
                    {(predictions.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;

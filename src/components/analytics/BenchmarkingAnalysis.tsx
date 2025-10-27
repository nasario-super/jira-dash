import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Trophy,
  BarChart3,
  Award,
  Info,
} from 'lucide-react';
import { BenchmarkData } from '../../services/advancedAnalyticsService';

interface BenchmarkingAnalysisProps {
  benchmarks: BenchmarkData[];
  loading?: boolean;
}

const BenchmarkingAnalysis: React.FC<BenchmarkingAnalysisProps> = ({
  benchmarks,
  loading = false,
}) => {
  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'above':
        return <Award className="w-4 h-4 text-green-600" />;
      case 'average':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'below':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'above':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'average':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'below':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'Top Quartil';
      case 'above':
        return 'Acima da Média';
      case 'average':
        return 'Na Média';
      case 'below':
        return 'Abaixo da Média';
      default:
        return 'N/A';
    }
  };

  const getGapIcon = (gap: number) => {
    if (gap > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (gap < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Target className="w-4 h-4 text-blue-600" />;
  };

  const getGapColor = (gap: number) => {
    if (gap > 0) return 'text-green-600';
    if (gap < 0) return 'text-red-600';
    return 'text-blue-600';
  };

  const getMetricLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      velocity: 'Velocity',
      bugRate: 'Taxa de Bugs',
      resolutionTime: 'Tempo de Resolução',
      teamProductivity: 'Produtividade da Equipe',
      customerSatisfaction: 'Satisfação do Cliente',
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric: string) => {
    const units: { [key: string]: string } = {
      velocity: 'pontos/semana',
      bugRate: '%',
      resolutionTime: 'dias',
      teamProductivity: 'issues/dia',
      customerSatisfaction: '%',
    };
    return units[metric] || '';
  };

  const getGapDescription = (gap: number, metric: string) => {
    const absGap = Math.abs(gap);
    const direction = gap > 0 ? 'acima' : 'abaixo';

    if (metric === 'bugRate' || metric === 'resolutionTime') {
      // Para métricas onde menor é melhor
      const direction = gap < 0 ? 'melhor' : 'pior';
      return `Performance ${direction} que a média da indústria em ${absGap.toFixed(
        1
      )} ${getMetricUnit(metric)}`;
    } else {
      return `Performance ${direction} da média da indústria em ${absGap.toFixed(
        1
      )} ${getMetricUnit(metric)}`;
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (
      recommendation.includes('aumentar') ||
      recommendation.includes('melhorar')
    ) {
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    }
    if (
      recommendation.includes('implementar') ||
      recommendation.includes('automatizar')
    ) {
      return <Target className="w-3 h-3 text-blue-600" />;
    }
    return <Info className="w-3 h-3 text-gray-600" />;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <span>Benchmarking</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Comparação com benchmarks da indústria
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {benchmarks.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum benchmark disponível</p>
          </div>
        ) : (
          benchmarks.map((benchmark, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getPerformanceIcon(benchmark.performance)}
                  <span className="font-medium text-gray-900">
                    {getMetricLabel(benchmark.metric)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getPerformanceColor(
                    benchmark.performance
                  )}`}
                >
                  {getPerformanceLabel(benchmark.performance)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Atual</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {benchmark.currentValue.toFixed(1)}{' '}
                    {getMetricUnit(benchmark.metric)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Média Indústria
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {benchmark.industryAverage.toFixed(1)}{' '}
                    {getMetricUnit(benchmark.metric)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Top Quartil</div>
                  <div className="text-lg font-semibold text-green-600">
                    {benchmark.topQuartile.toFixed(1)}{' '}
                    {getMetricUnit(benchmark.metric)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                {getGapIcon(benchmark.gap)}
                <span
                  className={`text-sm font-medium ${getGapColor(
                    benchmark.gap
                  )}`}
                >
                  {benchmark.gap > 0 ? '+' : ''}
                  {benchmark.gap.toFixed(1)} {getMetricUnit(benchmark.metric)}
                </span>
                <span className="text-xs text-gray-500">vs. média</span>
              </div>

              <div className="text-sm text-gray-700 mb-3">
                {getGapDescription(benchmark.gap, benchmark.metric)}
              </div>

              {/* Recomendações */}
              {benchmark.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    Recomendações:
                  </div>
                  <ul className="space-y-1">
                    {benchmark.recommendations.map(
                      (recommendation, recIndex) => (
                        <li
                          key={recIndex}
                          className="text-xs text-gray-600 flex items-start space-x-1"
                        >
                          {getRecommendationIcon(recommendation)}
                          <span>{recommendation}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Barra de progresso visual */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>0</span>
                  <span>Média: {benchmark.industryAverage.toFixed(1)}</span>
                  <span>Top: {benchmark.topQuartile.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (benchmark.industryAverage /
                          Math.max(
                            benchmark.currentValue,
                            benchmark.topQuartile
                          )) *
                          100
                      )}%`,
                    }}
                  ></div>
                  <div
                    className="h-2 rounded-full bg-green-500 -mt-2"
                    style={{
                      width: `${Math.min(
                        100,
                        (benchmark.topQuartile /
                          Math.max(
                            benchmark.currentValue,
                            benchmark.topQuartile
                          )) *
                          100
                      )}%`,
                    }}
                  ></div>
                  <div
                    className={`h-2 rounded-full -mt-2 ${
                      benchmark.currentValue >= benchmark.topQuartile
                        ? 'bg-yellow-500'
                        : benchmark.currentValue >= benchmark.industryAverage
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (benchmark.currentValue /
                          Math.max(
                            benchmark.currentValue,
                            benchmark.topQuartile
                          )) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <span>Atual: {benchmark.currentValue.toFixed(1)}</span>
                  <span className="text-blue-600">Média</span>
                  <span className="text-green-600">Top Quartil</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default BenchmarkingAnalysis;

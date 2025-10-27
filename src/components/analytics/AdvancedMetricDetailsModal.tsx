import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Download,
  Share2,
  ExternalLink,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { AdvancedMetric } from '../../services/advancedAnalyticsService';

interface AdvancedMetricDetailsModalProps {
  metric: AdvancedMetric;
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedMetricDetailsModal: React.FC<AdvancedMetricDetailsModalProps> = ({
  metric,
  isOpen,
  onClose,
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'average':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'below':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'poor':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'average':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'below':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceDescription = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'Performance excelente, acima dos benchmarks da indústria';
      case 'good':
        return 'Performance boa, próxima aos benchmarks da indústria';
      case 'average':
        return 'Performance média, dentro dos padrões da indústria';
      case 'below':
        return 'Performance abaixo da média, precisa de melhorias';
      case 'poor':
        return 'Performance ruim, requer atenção imediata';
      default:
        return 'Performance não avaliada';
    }
  };

  const getTrendDescription = (trend: string, trendValue: number) => {
    const direction =
      trend === 'up'
        ? 'aumentando'
        : trend === 'down'
        ? 'diminuindo'
        : 'estável';
    const percentage = Math.abs(trendValue);
    return `Métrica ${direction} ${percentage}% em relação ao período anterior`;
  };

  const getBenchmarkComparison = (value: number, benchmark: number) => {
    const difference = value - benchmark;
    const percentage = Math.abs((difference / benchmark) * 100);

    if (difference > 0) {
      return `Acima do benchmark em ${percentage.toFixed(1)}%`;
    } else if (difference < 0) {
      return `Abaixo do benchmark em ${percentage.toFixed(1)}%`;
    } else {
      return 'Exatamente no benchmark';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {metric.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Análise detalhada da métrica
                    </p>
                  </div>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Metric Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {metric.value}
                    </div>
                    <div className="text-sm text-blue-600">{metric.unit}</div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {metric.trendValue > 0 ? '+' : ''}
                      {metric.trendValue}%
                    </div>
                    <div className="text-sm text-green-600">Tendência</div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800">
                      {metric.benchmark}
                    </div>
                    <div className="text-sm text-purple-600">Benchmark</div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getPerformanceIcon(metric.performance)}
                    </div>
                    <div className="text-2xl font-bold text-orange-800 capitalize">
                      {metric.performance}
                    </div>
                    <div className="text-sm text-orange-600">Performance</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Analysis */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    Análise de Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Valor Atual:</span>
                      <span className="font-semibold">
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        Benchmark da Indústria:
                      </span>
                      <span className="font-semibold">
                        {metric.benchmark} {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Comparação:</span>
                      <span className="font-semibold">
                        {getBenchmarkComparison(metric.value, metric.benchmark)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tendência:</span>
                      <span className="font-semibold">
                        {getTrendDescription(metric.trend, metric.trendValue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Performance:</span>
                      <Badge
                        className={getPerformanceColor(metric.performance)}
                      >
                        {metric.performance}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {getPerformanceDescription(metric.performance)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                    Insights
                  </h3>
                  <div className="space-y-2">
                    {metric.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 text-green-600 mr-2" />
                    Recomendações
                  </h3>
                  <div className="space-y-2">
                    {metric.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Detalhes Técnicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Métrica:</strong> {metric.name}
                    </div>
                    <div>
                      <strong>Valor:</strong> {metric.value} {metric.unit}
                    </div>
                    <div>
                      <strong>Tendência:</strong> {metric.trend} (
                      {metric.trendValue}%)
                    </div>
                    <div>
                      <strong>Benchmark:</strong> {metric.benchmark}{' '}
                      {metric.unit}
                    </div>
                    <div>
                      <strong>Performance:</strong> {metric.performance}
                    </div>
                    <div>
                      <strong>Insights:</strong> {metric.insights.length}{' '}
                      encontrados
                    </div>
                    <div>
                      <strong>Recomendações:</strong>{' '}
                      {metric.recommendations.length} sugeridas
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      {metric.performance === 'excellent' ||
                      metric.performance === 'good'
                        ? 'Saudável'
                        : 'Requer Atenção'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedMetricDetailsModal;








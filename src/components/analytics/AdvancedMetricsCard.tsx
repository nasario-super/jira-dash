import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { AdvancedMetric } from '../../services/advancedAnalyticsService';
import AdvancedMetricDetailsModal from './AdvancedMetricDetailsModal';

interface AdvancedMetricsCardProps {
  metric: AdvancedMetric;
  loading?: boolean;
  onViewDetails?: () => void;
}

const AdvancedMetricsCard: React.FC<AdvancedMetricsCardProps> = ({
  metric,
  loading = false,
  onViewDetails,
}) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
  };
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'average':
        return <Info className="w-4 h-4 text-yellow-600" />;
      case 'below':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
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

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bom';
      case 'average':
        return 'Médio';
      case 'below':
        return 'Abaixo';
      case 'poor':
        return 'Ruim';
      default:
        return 'N/A';
    }
  };

  const getTrendArrow = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3" />;
      case 'down':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <ArrowRight className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {metric.name}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getPerformanceIcon(metric.performance)}
            <Badge
              variant="outline"
              className={`text-xs ${getPerformanceColor(metric.performance)}`}
            >
              {getPerformanceLabel(metric.performance)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valor principal */}
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {metric.value}
          </span>
          <span className="text-sm text-gray-500">{metric.unit}</span>
        </div>

        {/* Benchmark */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Benchmark:</span>
          <span className="text-sm font-medium text-gray-900">
            {metric.benchmark} {metric.unit}
          </span>
        </div>

        {/* Trend */}
        <div className="flex items-center space-x-2">
          {getTrendIcon(metric.trend)}
          <div className="flex items-center space-x-1">
            {getTrendArrow(metric.trend)}
            <span
              className={`text-sm font-medium ${getTrendColor(metric.trend)}`}
            >
              {metric.trendValue > 0 ? '+' : ''}
              {metric.trendValue}%
            </span>
            <span className="text-xs text-gray-500">vs. anterior</span>
          </div>
        </div>

        {/* Insights */}
        {metric.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Insights:</h4>
            <ul className="space-y-1">
              {metric.insights.slice(0, 2).map((insight, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-600 flex items-start space-x-1"
                >
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendações */}
        {metric.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              Recomendações:
            </h4>
            <ul className="space-y-1">
              {metric.recommendations
                .slice(0, 2)
                .map((recommendation, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-600 flex items-start space-x-1"
                  >
                    <span className="text-green-500 mt-0.5">→</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Botão de detalhes */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalhes</span>
          </Button>
        </div>
      </CardContent>

      {/* Modal de Detalhes */}
      <AdvancedMetricDetailsModal
        metric={metric}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />
    </Card>
  );
};

export default AdvancedMetricsCard;

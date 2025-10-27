import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
  AlertTriangle,
  Info,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { CorrelationData } from '../../services/advancedAnalyticsService';
import CorrelationDetailsModal from './CorrelationDetailsModal';

interface CorrelationAnalysisProps {
  correlations: CorrelationData[];
  loading?: boolean;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({
  correlations,
  loading = false,
}) => {
  const [selectedCorrelation, setSelectedCorrelation] =
    useState<CorrelationData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (correlation: CorrelationData) => {
    setSelectedCorrelation(correlation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedCorrelation(null);
  };

  const getCorrelationIcon = (correlation: number) => {
    if (Math.abs(correlation) < 0.3)
      return <Minus className="w-4 h-4 text-gray-600" />;
    if (correlation > 0)
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs < 0.3) return 'text-gray-600';
    if (abs < 0.7) return 'text-yellow-600';
    return correlation > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'strong':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'moderate':
        return <BarChart3 className="w-4 h-4 text-yellow-600" />;
      case 'weak':
        return <Info className="w-4 h-4 text-gray-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'weak':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'Forte';
      case 'moderate':
        return 'Moderada';
      case 'weak':
        return 'Fraca';
      default:
        return 'N/A';
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 0.8) return 'text-green-600';
    if (significance >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignificanceIcon = (significance: number) => {
    if (significance >= 0.8)
      return <Target className="w-4 h-4 text-green-600" />;
    if (significance >= 0.6)
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const getMetricLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      velocity: 'Velocity',
      bugRate: 'Taxa de Bugs',
      reworkRate: 'Taxa de Retrabalho',
      resolutionTime: 'Tempo de Resolução',
      teamSize: 'Tamanho da Equipe',
      complexity: 'Complexidade',
      priority: 'Prioridade',
    };
    return labels[metric] || metric;
  };

  const getCorrelationDescription = (
    correlation: number,
    metric1: string,
    metric2: string
  ) => {
    const abs = Math.abs(correlation);
    const direction = correlation > 0 ? 'positiva' : 'negativa';

    if (abs < 0.3) {
      return `Correlação fraca entre ${getMetricLabel(
        metric1
      )} e ${getMetricLabel(metric2)}`;
    } else if (abs < 0.7) {
      return `Correlação moderada ${direction} entre ${getMetricLabel(
        metric1
      )} e ${getMetricLabel(metric2)}`;
    } else {
      return `Correlação forte ${direction} entre ${getMetricLabel(
        metric1
      )} e ${getMetricLabel(metric2)}`;
    }
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
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Análise de Correlação</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Identificação de relações entre métricas de performance
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {correlations.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma correlação encontrada</p>
          </div>
        ) : (
          correlations.map((correlation, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCorrelationIcon(correlation.correlation)}
                  <span className="font-medium text-gray-900">
                    {getMetricLabel(correlation.metric1)} ↔{' '}
                    {getMetricLabel(correlation.metric2)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStrengthIcon(correlation.strength)}
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStrengthColor(
                      correlation.strength
                    )}`}
                  >
                    {getStrengthLabel(correlation.strength)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Correlação</div>
                  <div
                    className={`text-lg font-semibold ${getCorrelationColor(
                      correlation.correlation
                    )}`}
                  >
                    {correlation.correlation > 0 ? '+' : ''}
                    {correlation.correlation}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Significância
                  </div>
                  <div className="flex items-center space-x-1">
                    {getSignificanceIcon(correlation.significance)}
                    <span
                      className={`text-lg font-semibold ${getSignificanceColor(
                        correlation.significance
                      )}`}
                    >
                      {Math.round(correlation.significance * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-700">
                {getCorrelationDescription(
                  correlation.correlation,
                  correlation.metric1,
                  correlation.metric2
                )}
              </div>

              {/* Barra de progresso visual */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>-1.0</span>
                  <span>0.0</span>
                  <span>+1.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Math.abs(correlation.correlation) >= 0.7
                        ? 'bg-green-500'
                        : Math.abs(correlation.correlation) >= 0.3
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    style={{
                      width: `${Math.abs(correlation.correlation) * 100}%`,
                      marginLeft:
                        correlation.correlation < 0
                          ? `${(1 - Math.abs(correlation.correlation)) * 100}%`
                          : '0%',
                    }}
                  ></div>
                </div>
              </div>

              {/* Botão Ver Detalhes */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(correlation)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Detalhes</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Modal de Detalhes */}
      {selectedCorrelation && (
        <CorrelationDetailsModal
          correlation={selectedCorrelation}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
        />
      )}
    </Card>
  );
};

export default CorrelationAnalysis;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  BarChart3,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { PredictionData } from '../../services/advancedAnalyticsService';
import PredictionDetailsModal from './PredictionDetailsModal';
import { advancedAnalyticsService } from '../../services/advancedAnalyticsService';

interface PredictiveAnalyticsProps {
  predictions: PredictionData[];
  loading?: boolean;
  issues?: any[]; // Para análise de qualidade dos dados
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  predictions,
  loading = false,
  issues = [],
}) => {
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Analisar qualidade dos dados para o guia de melhoria
  const getDataQuality = () => {
    if (!issues || issues.length === 0) {
      return {
        hasEnoughData: false,
        dataCompleteness: 0,
        timeSpan: 0,
        dataConsistency: 0,
        confidenceMultiplier: 0.3,
      };
    }

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(
      issue =>
        issue.fields.status.name.toLowerCase().includes('done') ||
        issue.fields.status.name.toLowerCase().includes('closed')
    );

    const dataCompleteness = Math.min(totalIssues / 50, 1);
    const now = new Date();
    const oldestIssue = issues.reduce((oldest, issue) => {
      const created = new Date(issue.fields.created);
      return created < oldest ? created : oldest;
    }, now);
    const timeSpan =
      (now.getTime() - oldestIssue.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const dataConsistency = Math.min(
      resolvedIssues.length / Math.max(totalIssues * 0.3, 1),
      1
    );
    const hasEnoughData =
      totalIssues >= 10 && timeSpan >= 1 && dataConsistency >= 0.3;

    let confidenceMultiplier = 0.3;
    if (hasEnoughData) confidenceMultiplier += 0.4;
    if (dataCompleteness > 0.5) confidenceMultiplier += 0.2;
    if (timeSpan > 3) confidenceMultiplier += 0.1;

    return {
      hasEnoughData,
      dataCompleteness,
      timeSpan,
      dataConsistency,
      confidenceMultiplier: Math.min(confidenceMultiplier, 1),
    };
  };

  const handleViewDetails = (prediction: PredictionData) => {
    setSelectedPrediction(prediction);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedPrediction(null);
  };
  const getPredictionIcon = (currentValue: number, predictedValue: number) => {
    const change = ((predictedValue - currentValue) / currentValue) * 100;
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Target className="w-4 h-4 text-blue-600" />;
  };

  const getPredictionColor = (currentValue: number, predictedValue: number) => {
    const change = ((predictedValue - currentValue) / currentValue) * 100;
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-blue-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8)
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (confidence >= 0.6)
      return <Target className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8)
      return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.6)
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  const getMetricLabel = (metric: string) => {
    const labels: { [key: string]: string } = {
      velocity: 'Velocity',
      bugRate: 'Taxa de Bugs',
      resolutionTime: 'Tempo de Resolução',
      teamProductivity: 'Produtividade da Equipe',
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric: string) => {
    const units: { [key: string]: string } = {
      velocity: 'pontos/semana',
      bugRate: '%',
      resolutionTime: 'dias',
      teamProductivity: 'issues/dia',
    };
    return units[metric] || '';
  };

  const getPredictionDescription = (
    metric: string,
    currentValue: number,
    predictedValue: number
  ) => {
    const change = ((predictedValue - currentValue) / currentValue) * 100;
    const direction = change > 0 ? 'aumento' : 'redução';
    const magnitude = Math.abs(change);

    let description = '';
    if (metric === 'velocity') {
      description =
        change > 0
          ? `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% na velocity da equipe`
          : `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% na velocity da equipe`;
    } else if (metric === 'bugRate') {
      description =
        change > 0
          ? `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% na taxa de bugs`
          : `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% na taxa de bugs`;
    } else if (metric === 'resolutionTime') {
      description =
        change > 0
          ? `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% no tempo de resolução`
          : `Previsão de ${direction} de ${magnitude.toFixed(
              1
            )}% no tempo de resolução`;
    } else {
      description = `Previsão de ${direction} de ${magnitude.toFixed(
        1
      )}% na ${getMetricLabel(metric).toLowerCase()}`;
    }

    return description;
  };

  const getFactorIcon = (factor: string) => {
    if (factor.includes('equipe') || factor.includes('team'))
      return <Info className="w-3 h-3" />;
    if (factor.includes('processo') || factor.includes('process'))
      return <BarChart3 className="w-3 h-3" />;
    if (factor.includes('qualidade') || factor.includes('quality'))
      return <CheckCircle className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
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
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Analytics Preditivos</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Previsões baseadas em dados históricos e tendências
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {!predictions || predictions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma previsão disponível</p>
          </div>
        ) : (
          (predictions || []).map((prediction, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getPredictionIcon(
                    prediction.currentValue,
                    prediction.predictedValue
                  )}
                  <span className="font-medium text-gray-900">
                    {getMetricLabel(prediction.metric)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConfidenceIcon(prediction.confidence)}
                  <Badge
                    variant="outline"
                    className={`text-xs ${getConfidenceColor(
                      prediction.confidence
                    )}`}
                  >
                    {getConfidenceLabel(prediction.confidence)} Confiança
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Valor Atual</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {prediction.currentValue.toFixed(1)}{' '}
                    {getMetricUnit(prediction.metric)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Previsão</div>
                  <div
                    className={`text-lg font-semibold ${getPredictionColor(
                      prediction.currentValue,
                      prediction.predictedValue
                    )}`}
                  >
                    {prediction.predictedValue.toFixed(1)}{' '}
                    {getMetricUnit(prediction.metric)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-3">
                {getPredictionDescription(
                  prediction.metric,
                  prediction.currentValue,
                  prediction.predictedValue
                )}
              </div>

              <div className="text-xs text-gray-500 mb-3">
                <strong>Período:</strong> {prediction.timeframe}
              </div>

              {/* Fatores de influência */}
              {prediction.factors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    Fatores de Influência:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.factors.map((factor, factorIndex) => (
                      <div
                        key={factorIndex}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                      >
                        {getFactorIcon(factor)}
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de progresso visual */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Atual: {prediction.currentValue.toFixed(1)}</span>
                  <span>Previsão: {prediction.predictedValue.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      prediction.predictedValue > prediction.currentValue
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (prediction.predictedValue /
                          Math.max(
                            prediction.currentValue,
                            prediction.predictedValue
                          )) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Botão Ver Detalhes */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(prediction)}
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
      {selectedPrediction && (
        <PredictionDetailsModal
          prediction={selectedPrediction}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          dataQuality={getDataQuality()}
        />
      )}
    </Card>
  );
};

export default PredictiveAnalytics;

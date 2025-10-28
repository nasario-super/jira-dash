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
  BarChart3,
  Target,
  AlertTriangle,
  Info,
  ExternalLink,
  Download,
  Share2,
} from 'lucide-react';
import { CorrelationData } from '../../services/advancedAnalyticsService';

interface CorrelationDetailsModalProps {
  correlation: CorrelationData;
  isOpen: boolean;
  onClose: () => void;
}

const CorrelationDetailsModal: React.FC<CorrelationDetailsModalProps> = ({
  correlation,
  isOpen,
  onClose,
}) => {
  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.7)
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (correlation < -0.7)
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return 'text-green-600 bg-green-50';
    if (correlation < -0.7) return 'text-red-600 bg-red-50';
    if (correlation > 0.3) return 'text-blue-600 bg-blue-50';
    if (correlation < -0.3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getCorrelationDescription = (correlation: number) => {
    if (correlation > 0.8) return 'Correlação muito forte positiva';
    if (correlation > 0.6) return 'Correlação forte positiva';
    if (correlation > 0.4) return 'Correlação moderada positiva';
    if (correlation > 0.2) return 'Correlação fraca positiva';
    if (correlation > -0.2) return 'Correlação muito fraca';
    if (correlation > -0.4) return 'Correlação fraca negativa';
    if (correlation > -0.6) return 'Correlação moderada negativa';
    if (correlation > -0.8) return 'Correlação forte negativa';
    return 'Correlação muito forte negativa';
  };

  const getSignificanceDescription = (significance: number) => {
    if (significance > 0.95) return 'Altamente significativa';
    if (significance > 0.9) return 'Muito significativa';
    if (significance > 0.8) return 'Significativa';
    if (significance > 0.7) return 'Moderadamente significativa';
    return 'Pouco significativa';
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

  const getInsights = (correlation: CorrelationData) => {
    const insights = [];

    if (correlation.correlation > 0.7) {
      insights.push(
        `Quando ${correlation.metric1} aumenta, ${correlation.metric2} tende a aumentar também`
      );
      insights.push(
        'Esta é uma relação positiva forte que pode ser explorada para melhorias'
      );
    } else if (correlation.correlation < -0.7) {
      insights.push(
        `Quando ${correlation.metric1} aumenta, ${correlation.metric2} tende a diminuir`
      );
      insights.push('Esta é uma relação negativa forte que requer atenção');
    } else if (Math.abs(correlation.correlation) < 0.3) {
      insights.push('Pouca ou nenhuma relação linear entre essas métricas');
      insights.push('Considere analisar outros fatores que possam influenciar');
    } else {
      insights.push('Relação moderada entre as métricas');
      insights.push('Pode haver outros fatores influenciando essa relação');
    }

    if (correlation.significance > 0.9) {
      insights.push('Esta correlação é estatisticamente significativa');
    } else {
      insights.push(
        'Esta correlação pode não ser estatisticamente significativa'
      );
    }

    return insights;
  };

  const getRecommendations = (correlation: CorrelationData) => {
    const recommendations = [];

    if (correlation.correlation > 0.7) {
      recommendations.push(
        `Foque em melhorar ${correlation.metric1} para impactar positivamente ${correlation.metric2}`
      );
      recommendations.push(
        'Considere implementar métricas de monitoramento para ambas as variáveis'
      );
    } else if (correlation.correlation < -0.7) {
      recommendations.push(
        `Atenção: melhorar ${correlation.metric1} pode impactar negativamente ${correlation.metric2}`
      );
      recommendations.push(
        'Analise se esta relação é desejada ou se precisa ser ajustada'
      );
    } else {
      recommendations.push(
        'Investigue outros fatores que possam influenciar essas métricas'
      );
      recommendations.push(
        'Considere análises mais detalhadas com segmentação de dados'
      );
    }

    if (correlation.significance < 0.8) {
      recommendations.push(
        'Colete mais dados para confirmar a significância estatística'
      );
    }

    return recommendations;
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
                      Análise de Correlação Detalhada
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {correlation.metric1} ↔ {correlation.metric2}
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
              {/* Correlation Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getCorrelationIcon(correlation.correlation)}
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {correlation.correlation.toFixed(3)}
                    </div>
                    <div className="text-sm text-blue-600">
                      Coeficiente de Correlação
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {(correlation.significance * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Significância</div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800 capitalize">
                      {correlation.strength}
                    </div>
                    <div className="text-sm text-purple-600">
                      Força da Correlação
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Descrição da Correlação
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Relação:</strong>{' '}
                      {getCorrelationDescription(correlation.correlation)}
                    </p>
                    <p className="text-gray-700">
                      <strong>Significância:</strong>{' '}
                      {getSignificanceDescription(correlation.significance)}
                    </p>
                    <p className="text-gray-700">
                      <strong>Interpretação:</strong>{' '}
                      {Math.abs(correlation.correlation) > 0.7
                        ? 'Esta correlação indica uma relação linear forte entre as métricas'
                        : 'Esta correlação indica uma relação linear moderada entre as métricas'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    Insights
                  </h3>
                  <div className="space-y-2">
                    {getInsights(correlation).map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
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
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    Recomendações
                  </h3>
                  <div className="space-y-2">
                    {getRecommendations(correlation).map(
                      (recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">{recommendation}</p>
                        </div>
                      )
                    )}
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
                      <strong>Métrica 1:</strong> {correlation.metric1}
                    </div>
                    <div>
                      <strong>Métrica 2:</strong> {correlation.metric2}
                    </div>
                    <div>
                      <strong>Coeficiente:</strong>{' '}
                      {correlation.correlation.toFixed(6)}
                    </div>
                    <div>
                      <strong>Significância:</strong>{' '}
                      {correlation.significance.toFixed(6)}
                    </div>
                    <div>
                      <strong>Força:</strong> {correlation.strength}
                    </div>
                    <div>
                      <strong>Interpretação:</strong>{' '}
                      {Math.abs(correlation.correlation) > 0.5
                        ? 'Forte'
                        : 'Moderada'}
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

export default CorrelationDetailsModal;









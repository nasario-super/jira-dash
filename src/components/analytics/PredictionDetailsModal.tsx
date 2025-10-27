import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  BarChart3,
  Download,
  Share2,
  Lightbulb,
  Zap,
  Clock,
} from 'lucide-react';
import { PredictionData } from '../../services/advancedAnalyticsService';
import ConfidenceImprovementGuide from './ConfidenceImprovementGuide';

interface PredictionDetailsModalProps {
  prediction: PredictionData;
  isOpen: boolean;
  onClose: () => void;
  dataQuality?: {
    hasEnoughData: boolean;
    dataCompleteness: number;
    timeSpan: number;
    dataConsistency: number;
    confidenceMultiplier: number;
  };
}

const PredictionDetailsModal: React.FC<PredictionDetailsModalProps> = ({
  prediction,
  isOpen,
  onClose,
  dataQuality,
}) => {
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9)
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (confidence >= 0.8) return <Target className="w-5 h-5 text-blue-600" />;
    if (confidence >= 0.7) return <Info className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9)
      return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.8) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (confidence >= 0.7)
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceDescription = (confidence: number) => {
    if (confidence >= 0.9) return 'Previsão altamente confiável';
    if (confidence >= 0.8) return 'Previsão muito confiável';
    if (confidence >= 0.7) return 'Previsão moderadamente confiável';
    return 'Previsão com baixa confiabilidade';
  };

  const getChangeIcon = (current: number, predicted: number) => {
    if (predicted > current)
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (predicted < current)
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Target className="w-5 h-5 text-gray-600" />;
  };

  const getChangeDescription = (current: number, predicted: number) => {
    const change = predicted - current;
    const percentage = Math.abs((change / current) * 100);

    if (change > 0) {
      return `Aumento previsto de ${percentage.toFixed(1)}%`;
    } else if (change < 0) {
      return `Diminuição prevista de ${percentage.toFixed(1)}%`;
    } else {
      return 'Sem mudança prevista';
    }
  };

  const getTimeframeIcon = (timeframe: string) => {
    if (timeframe.includes('semana'))
      return <Calendar className="w-5 h-5 text-blue-600" />;
    if (timeframe.includes('mês'))
      return <Calendar className="w-5 h-5 text-green-600" />;
    if (timeframe.includes('dia'))
      return <Clock className="w-5 h-5 text-purple-600" />;
    return <Calendar className="w-5 h-5 text-gray-600" />;
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
                      Previsão: {prediction.metric}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Análise preditiva detalhada
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
              {/* Prediction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">
                      {prediction.currentValue}
                    </div>
                    <div className="text-sm text-blue-600">Valor Atual</div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getChangeIcon(
                        prediction.currentValue,
                        prediction.predictedValue
                      )}
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {prediction.predictedValue}
                    </div>
                    <div className="text-sm text-green-600">Valor Previsto</div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getConfidenceIcon(prediction.confidence)}
                    </div>
                    <div className="text-2xl font-bold text-purple-800">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-600">Confiança</div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTimeframeIcon(prediction.timeframe)}
                    </div>
                    <div className="text-2xl font-bold text-orange-800">
                      {prediction.timeframe}
                    </div>
                    <div className="text-sm text-orange-600">Prazo</div>
                  </CardContent>
                </Card>
              </div>

              {/* Change Analysis */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    Análise da Mudança
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Valor Atual:</span>
                      <span className="font-semibold">
                        {prediction.currentValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Valor Previsto:</span>
                      <span className="font-semibold">
                        {prediction.predictedValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Mudança:</span>
                      <span className="font-semibold">
                        {getChangeDescription(
                          prediction.currentValue,
                          prediction.predictedValue
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Confiança:</span>
                      <Badge
                        className={getConfidenceColor(prediction.confidence)}
                      >
                        {getConfidenceDescription(prediction.confidence)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Prazo:</span>
                      <span className="font-semibold">
                        {prediction.timeframe}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Factors */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
                    Fatores Considerados
                  </h3>
                  <div className="space-y-2">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{factor}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Confidence Analysis */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 text-green-600 mr-2" />
                    Análise de Confiança
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Nível de Confiança:</span>
                      <span className="font-semibold">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Interpretação:</span>
                      <span className="font-semibold">
                        {getConfidenceDescription(prediction.confidence)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          prediction.confidence >= 0.9
                            ? 'bg-green-500'
                            : prediction.confidence >= 0.8
                            ? 'bg-blue-500'
                            : prediction.confidence >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {prediction.confidence >= 0.9
                        ? 'Esta previsão tem alta confiabilidade baseada em dados históricos consistentes.'
                        : prediction.confidence >= 0.8
                        ? 'Esta previsão tem boa confiabilidade, mas pode ser afetada por fatores externos.'
                        : prediction.confidence >= 0.7
                        ? 'Esta previsão tem confiabilidade moderada. Considere fatores adicionais.'
                        : 'Esta previsão tem baixa confiabilidade. Use com cautela e monitore de perto.'}
                    </div>
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
                    {prediction.confidence >= 0.8 ? (
                      <>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">
                            Use esta previsão para planejamento estratégico
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">
                            Monitore os fatores identificados para validar a
                            previsão
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">
                            Use esta previsão como orientação geral, não como
                            decisão definitiva
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">
                            Colete mais dados para melhorar a confiabilidade
                          </p>
                        </div>
                      </>
                    )}
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">
                        Revise esta previsão regularmente conforme novos dados
                        se tornam disponíveis
                      </p>
                    </div>
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
                      <strong>Métrica:</strong> {prediction.metric}
                    </div>
                    <div>
                      <strong>Valor Atual:</strong> {prediction.currentValue}
                    </div>
                    <div>
                      <strong>Valor Previsto:</strong>{' '}
                      {prediction.predictedValue}
                    </div>
                    <div>
                      <strong>Confiança:</strong>{' '}
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <div>
                      <strong>Prazo:</strong> {prediction.timeframe}
                    </div>
                    <div>
                      <strong>Fatores:</strong> {prediction.factors.length}{' '}
                      considerados
                    </div>
                    <div>
                      <strong>Mudança:</strong>{' '}
                      {getChangeDescription(
                        prediction.currentValue,
                        prediction.predictedValue
                      )}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      {prediction.confidence >= 0.8
                        ? 'Alta Confiabilidade'
                        : 'Baixa Confiabilidade'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence Improvement Guide */}
              {dataQuality && prediction.confidence < 0.8 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      Como Melhorar a Confiança desta Previsão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ConfidenceImprovementGuide
                      currentConfidence={prediction.confidence}
                      dataQuality={dataQuality}
                    />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictionDetailsModal;

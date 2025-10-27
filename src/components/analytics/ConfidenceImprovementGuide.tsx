import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Zap,
  Clock,
  Database,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  ArrowRight,
  Star,
  Award,
} from 'lucide-react';

interface ConfidenceImprovementGuideProps {
  currentConfidence: number;
  dataQuality: {
    hasEnoughData: boolean;
    dataCompleteness: number;
    timeSpan: number;
    dataConsistency: number;
    confidenceMultiplier: number;
  };
}

const ConfidenceImprovementGuide: React.FC<ConfidenceImprovementGuideProps> = ({
  currentConfidence,
  dataQuality,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed' | 'advanced'>(
    'quick'
  );

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9)
      return { level: 'Excelente', color: 'text-green-600', icon: Star };
    if (confidence >= 0.8)
      return { level: 'Muito Boa', color: 'text-blue-600', icon: Award };
    if (confidence >= 0.7)
      return { level: 'Boa', color: 'text-yellow-600', icon: CheckCircle };
    if (confidence >= 0.5)
      return {
        level: 'Moderada',
        color: 'text-orange-600',
        icon: AlertTriangle,
      };
    return { level: 'Baixa', color: 'text-red-600', icon: AlertTriangle };
  };

  const getQuickWins = () => [
    {
      title: 'Adicione mais Issues',
      description: 'Colete pelo menos 50 issues para melhorar a confiança',
      impact: 'Alto',
      effort: 'Baixo',
      icon: Database,
      action: 'Importe dados históricos do Jira',
    },
    {
      title: 'Complete Dados Faltantes',
      description: 'Preencha campos obrigatórios como assignee, due date, etc.',
      impact: 'Alto',
      effort: 'Médio',
      icon: Settings,
      action: 'Configure campos obrigatórios',
    },
    {
      title: 'Use Período Mais Longo',
      description: 'Analise dados de pelo menos 3 meses',
      impact: 'Médio',
      effort: 'Baixo',
      icon: Clock,
      action: 'Ajuste filtro de data',
    },
  ];

  const getDetailedImprovements = () => [
    {
      category: 'Dados Históricos',
      items: [
        {
          title: 'Volume de Dados',
          description: 'Mínimo de 100 issues para confiança alta',
          current: `${Math.round(dataQuality.dataCompleteness * 100)}%`,
          target: '100%',
          icon: Database,
        },
        {
          title: 'Período Temporal',
          description: 'Pelo menos 6 meses de dados históricos',
          current: `${Math.round(dataQuality.timeSpan)} meses`,
          target: '6+ meses',
          icon: Clock,
        },
        {
          title: 'Consistência',
          description: 'Dados completos e consistentes',
          current: `${Math.round(dataQuality.dataConsistency * 100)}%`,
          target: '80%+',
          icon: CheckCircle,
        },
      ],
    },
    {
      category: 'Qualidade dos Dados',
      items: [
        {
          title: 'Campos Obrigatórios',
          description: 'Status, assignee, created, updated preenchidos',
          current:
            dataQuality.dataConsistency > 0.5 ? 'Bom' : 'Precisa melhorar',
          target: '100% preenchido',
          icon: Settings,
        },
        {
          title: 'Padronização',
          description: 'Nomes de status e tipos padronizados',
          current: 'Variável',
          target: 'Padronizado',
          icon: Target,
        },
        {
          title: 'Atualizações Regulares',
          description: 'Dados atualizados diariamente',
          current: 'Manual',
          target: 'Automático',
          icon: Zap,
        },
      ],
    },
    {
      category: 'Análise Avançada',
      items: [
        {
          title: 'Segmentação',
          description: 'Análise por projeto, equipe, tipo de issue',
          current: 'Geral',
          target: 'Segmentada',
          icon: BarChart3,
        },
        {
          title: 'Tendências',
          description: 'Identificação de padrões sazonais',
          current: 'Básica',
          target: 'Avançada',
          icon: TrendingUp,
        },
        {
          title: 'Correlações',
          description: 'Análise de relações entre métricas',
          current: 'Limitada',
          target: 'Completa',
          icon: Target,
        },
      ],
    },
  ];

  const getAdvancedStrategies = () => [
    {
      title: 'Machine Learning',
      description: 'Implemente algoritmos de ML para previsões mais precisas',
      benefits: [
        'Precisão 95%+',
        'Detecção de padrões complexos',
        'Previsões automáticas',
      ],
      requirements: [
        'Dados históricos extensos',
        'Equipe técnica',
        'Infraestrutura adequada',
      ],
      icon: Brain,
    },
    {
      title: 'Integração Externa',
      description: 'Conecte com ferramentas de desenvolvimento e CI/CD',
      benefits: ['Dados em tempo real', 'Contexto completo', 'Automação'],
      requirements: [
        'APIs disponíveis',
        'Permissões adequadas',
        'Configuração',
      ],
      icon: Zap,
    },
    {
      title: 'Análise Preditiva Avançada',
      description: 'Use técnicas estatísticas avançadas e modelos preditivos',
      benefits: [
        'Confiança 90%+',
        'Insights profundos',
        'Recomendações precisas',
      ],
      requirements: [
        'Conhecimento estatístico',
        'Ferramentas especializadas',
        'Dados de qualidade',
      ],
      icon: Target,
    },
  ];

  const confidenceLevel = getConfidenceLevel(currentConfidence);
  const ConfidenceIcon = confidenceLevel.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            <span>Guia para Melhorar Confiança das Previsões</span>
            <Badge className={`${confidenceLevel.color} bg-white`}>
              <ConfidenceIcon className="w-4 h-4 mr-1" />
              {confidenceLevel.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(currentConfidence * 100)}%
              </div>
              <div className="text-sm text-gray-600">Confiança Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(dataQuality.confidenceMultiplier * 100)}%
              </div>
              <div className="text-sm text-gray-600">Potencial de Melhoria</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (currentConfidence +
                    (1 - currentConfidence) *
                      dataQuality.confidenceMultiplier) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-gray-600">Confiança Projetada</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'quick' ? 'default' : 'outline'}
              onClick={() => setActiveTab('quick')}
              className="flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Quick Wins</span>
            </Button>
            <Button
              variant={activeTab === 'detailed' ? 'default' : 'outline'}
              onClick={() => setActiveTab('detailed')}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Melhorias Detalhadas</span>
            </Button>
            <Button
              variant={activeTab === 'advanced' ? 'default' : 'outline'}
              onClick={() => setActiveTab('advanced')}
              className="flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Estratégias Avançadas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      {activeTab === 'quick' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 text-yellow-600 mr-2" />
            Quick Wins - Melhorias Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getQuickWins().map((win, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <win.icon className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {win.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {win.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-green-600">
                            Impacto: {win.impact}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600">
                            Esforço: {win.effort}
                          </Badge>
                        </div>
                        <Button size="sm" className="w-full">
                          {win.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Detailed Improvements */}
      {activeTab === 'detailed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            Melhorias Detalhadas por Categoria
          </h3>
          {getDetailedImprovements().map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Atual: {item.current}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          Meta: {item.target}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Advanced Strategies */}
      {activeTab === 'advanced' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-5 h-5 text-purple-600 mr-2" />
            Estratégias Avançadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAdvancedStrategies().map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <strategy.icon className="w-6 h-6 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {strategy.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {strategy.description}
                        </p>

                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-green-600 mb-1">
                            Benefícios:
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {strategy.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-orange-600 mb-1">
                            Requisitos:
                          </h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {strategy.requirements.map((req, i) => (
                              <li key={i} className="flex items-center">
                                <Info className="w-3 h-3 mr-1" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button size="sm" variant="outline" className="w-full">
                          Saiba Mais
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Plan */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Plano de Ação Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">
                1. Implemente Quick Wins (1-2 semanas)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm">
                2. Execute melhorias detalhadas (1-2 meses)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-sm">
                3. Considere estratégias avançadas (3-6 meses)
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Resultado esperado:</strong> Confiança das previsões
              aumentará de{' '}
              <strong>{Math.round(currentConfidence * 100)}%</strong> para{' '}
              <strong>
                {Math.round(
                  (currentConfidence +
                    (1 - currentConfidence) *
                      dataQuality.confidenceMultiplier) *
                    100
                )}
                %
              </strong>{' '}
              seguindo este plano.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfidenceImprovementGuide;








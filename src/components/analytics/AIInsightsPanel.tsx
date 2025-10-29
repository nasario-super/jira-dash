// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AIInsight } from '../../services/aiInsightsService';
import { JiraIssue, SprintData } from '../../types/jira.types';

interface AIInsightsPanelProps {
  issues: JiraIssue[];
  sprints: SprintData[];
  timeRange: 'week' | 'month' | 'quarter';
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  issues,
  sprints,
  timeRange,
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'impact'>(
    'priority'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadInsights();
  }, [issues, sprints, timeRange]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      console.log('🔍 AIInsightsPanel - loadInsights Debug:', {
        issuesCount: issues.length,
        sprintsCount: sprints.length,
        timeRange,
        issuesSample: issues.slice(0, 3).map((issue : any) => ({
          key: issue.key,
          status: issue.fields.status.name,
          type: issue.fields.issuetype.name,
        })),
        sprintsSample: sprints.slice(0, 3).map((sprint : any) => ({
          id: sprint.id,
          name: sprint.name,
          state: sprint.state,
        })),
      });

      const { default: AIInsightsService } = await import(
        '../../services/aiInsightsService'
      );
      const service = AIInsightsService.getInstance();
      const generatedInsights = await service.generateInsights(
        issues,
        sprints,
        timeRange
      );

      console.log('🔍 AIInsightsPanel - generatedInsights:', {
        insightsCount: generatedInsights.length,
        insightsSample: generatedInsights.slice(0, 3).map((insight : any) => ({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          confidence: insight.confidence,
        })),
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="w-5 h-5" />;
      case 'trend':
        return <TrendingDown className="w-5 h-5" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5" />;
      case 'risk':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'text-blue-600';
      case 'trend':
        return 'text-purple-600';
      case 'anomaly':
        return 'text-red-600';
      case 'recommendation':
        return 'text-green-600';
      case 'risk':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredInsights = insights.filter((insight : any) => {
    if (filter === 'all') return true;
    return insight.type === filter;
  });

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    let aValue: number, bValue: number;

    switch (sortBy) {
      case 'priority':
        aValue = a.priority;
        bValue = b.priority;
        break;
      case 'confidence':
        aValue = a.confidence;
        bValue = b.confidence;
        break;
      case 'impact':
        const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aValue = impactOrder[a.impact as keyof typeof impactOrder] || 0;
        bValue = impactOrder[b.impact as keyof typeof impactOrder] || 0;
        break;
      default:
        aValue = a.priority;
        bValue = b.priority;
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const insightStats = {
    total: insights.length,
    critical: insights.filter((i : any) => i.impact === 'critical').length,
    high: insights.filter((i : any) => i.impact === 'high').length,
    medium: insights.filter((i : any) => i.impact === 'medium').length,
    low: insights.filter((i : any) => i.impact === 'low').length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando dados com IA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
            <Badge variant="secondary" className="ml-2">
              {insightStats.total}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {insightStats.critical}
            </div>
            <div className="text-xs text-gray-500">Crítico</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {insightStats.high}
            </div>
            <div className="text-xs text-gray-500">Alto</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {insightStats.medium}
            </div>
            <div className="text-xs text-gray-500">Médio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {insightStats.low}
            </div>
            <div className="text-xs text-gray-500">Baixo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {insightStats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters and Sort */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Todos</option>
              <option value="performance">Performance</option>
              <option value="trend">Tendências</option>
              <option value="anomaly">Anomalias</option>
              <option value="recommendation">Recomendações</option>
              <option value="risk">Riscos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="priority">Prioridade</option>
              <option value="confidence">Confiança</option>
              <option value="impact">Impacto</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
              }
            >
              {sortOrder === 'desc' ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {sortedInsights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum insight encontrado para os dados atuais.</p>
              <p className="text-sm">
                Tente ajustar os filtros ou aguarde mais dados.
              </p>
            </div>
          ) : (
            sortedInsights.map((insight : any) => (
              <div
                key={insight.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${getTypeColor(
                        insight.type
                      )} bg-opacity-10`}
                    >
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline">{insight.category}</Badge>
                        <span className="text-sm text-gray-500">
                          Prioridade: {insight.priority}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Confiança</div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={insight.confidence}
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{insight.description}</p>

                {/* Metrics */}
                {Object.keys(insight.metrics).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Métricas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(insight.metrics).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}:{' '}
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {insight.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Recomendações:
                    </h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    {new Date(insight.timestamp).toLocaleString('pt-BR')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('📊 Detalhes do insight:', insight);
                      alert(
                        `Insight: ${insight.title}\n\nDescrição: ${insight.description}\n\nConfiança: ${insight.confidence}%\n\nImpacto: ${insight.impact}`
                      );
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;

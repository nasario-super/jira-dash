import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { Insight } from '../../services/analyticsService';

interface InsightsPanelProps {
  insights: Insight[];
  loading?: boolean;
  onDismiss?: (insightId: string) => void;
  onViewDetails?: (insight: Insight) => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  loading = false,
  onDismiss,
  onViewDetails,
}) => {
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(
    new Set()
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
    onDismiss?.(insightId);
  };

  const visibleInsights = insights.filter(
    insight => !dismissedInsights.has(insight.id)
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum insight disponível no momento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os insights são gerados automaticamente com base nos dados
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Insights Automáticos
          <Badge variant="secondary" className="ml-auto">
            {visibleInsights.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {visibleInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${getInsightColor(
                  insight.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getImpactColor(
                            insight.impact
                          )}`}
                        >
                          {insight.impact}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(insight.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>

                    <div className="bg-background/50 p-3 rounded border">
                      <p className="text-xs font-medium text-foreground mb-1">
                        💡 Recomendação:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insight.recommendation}
                      </p>
                    </div>

                    {insight.metrics &&
                      Object.keys(insight.metrics).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(insight.metrics || {}).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs"
                              >
                                {key}:{' '}
                                {typeof value === 'number'
                                  ? value.toFixed(1)
                                  : value}
                              </Badge>
                            )
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(insight.timestamp).toLocaleString('pt-BR')}
                      </span>

                      {onViewDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(insight)}
                          className="text-xs h-6 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {dismissedInsights.size > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissedInsights(new Set())}
              className="text-xs"
            >
              Restaurar Insights Dispensados ({dismissedInsights.size})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;

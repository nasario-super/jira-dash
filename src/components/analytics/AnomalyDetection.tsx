import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { JiraIssue, SprintData } from '../../types/jira.types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface AnomalyDetectionProps {
  issues: JiraIssue[];
  sprints: SprintData[];
  timeRange: 'week' | 'month' | 'quarter';
}

interface AnomalyData {
  id: string;
  type: 'spike' | 'drop' | 'pattern_break' | 'outlier';
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  description: string;
  context: Record<string, any>;
  chartData: Array<{
    date: string;
    value: number;
    expected: number;
    anomaly?: boolean;
  }>;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  issues,
  sprints,
  timeRange,
}) => {
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    detectAnomalies();
  }, [issues, sprints, timeRange]);

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const detectedAnomalies = await performAnomalyDetection(
        issues,
        timeRange
      );
      setAnomalies(detectedAnomalies);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAnomalyDetection = async (
    issues: JiraIssue[],
    timeRange: string
  ): Promise<AnomalyData[]> => {
    const anomalies: AnomalyData[] = [];

    // Get time series data
    const timeSeriesData = getTimeSeriesData(issues, timeRange);

    // Detect velocity anomalies
    const velocityAnomalies = detectVelocityAnomalies(timeSeriesData);
    anomalies.push(...velocityAnomalies);

    // Detect completion anomalies
    const completionAnomalies = detectCompletionAnomalies(timeSeriesData);
    anomalies.push(...completionAnomalies);

    // Detect bug rate anomalies
    const bugAnomalies = detectBugAnomalies(timeSeriesData);
    anomalies.push(...bugAnomalies);

    // Detect cycle time anomalies
    const cycleTimeAnomalies = detectCycleTimeAnomalies(timeSeriesData);
    anomalies.push(...cycleTimeAnomalies);

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (
        severityOrder[b.severity as keyof typeof severityOrder] -
        severityOrder[a.severity as keyof typeof severityOrder]
      );
    });
  };

  const getTimeSeriesData = (issues: JiraIssue[], timeRange: string) => {
    const now = new Date();
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data: Array<{
      date: string;
      velocity: number;
      completion: number;
      bugRate: number;
      cycleTime: number;
      issueCount: number;
    }> = [];

    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created.toDateString() === date.toDateString();
      });

      const completed = dayIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      );

      const bugs = dayIssues.filter(
        issue => issue.fields.issuetype.name === 'Bug'
      );

      data.push({
        date: date.toISOString().split('T')[0],
        velocity: calculateVelocity(dayIssues),
        completion:
          dayIssues.length > 0 ? completed.length / dayIssues.length : 0,
        bugRate: dayIssues.length > 0 ? bugs.length / dayIssues.length : 0,
        cycleTime: calculateCycleTime(dayIssues),
        issueCount: dayIssues.length,
      });
    }

    return data;
  };

  const detectVelocityAnomalies = (data: any[]): AnomalyData[] => {
    const anomalies: AnomalyData[] = [];
    const velocities = data.map(d => d.velocity);
    const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const stdDev = Math.sqrt(
      velocities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        velocities.length
    );

    data.forEach((point, index) => {
      if (Math.abs(point.velocity - mean) > 2 * stdDev) {
        const deviation = ((point.velocity - mean) / mean) * 100;
        const severity =
          Math.abs(deviation) > 100
            ? 'critical'
            : Math.abs(deviation) > 50
            ? 'high'
            : Math.abs(deviation) > 25
            ? 'medium'
            : 'low';

        anomalies.push({
          id: `velocity-${index}`,
          type: point.velocity > mean ? 'spike' : 'drop',
          metric: 'velocity',
          severity,
          detectedAt: new Date(point.date),
          value: point.velocity,
          expectedValue: mean,
          deviation,
          description: `Velocidade ${
            point.velocity > mean ? 'aumentou' : 'diminuiu'
          } ${Math.abs(deviation).toFixed(1)}% em relação à média`,
          context: { mean, stdDev, index },
          chartData: data.map(d => ({
            date: d.date,
            value: d.velocity,
            expected: mean,
            anomaly: d === point,
          })),
        });
      }
    });

    return anomalies;
  };

  const detectCompletionAnomalies = (data: any[]): AnomalyData[] => {
    const anomalies: AnomalyData[] = [];
    const completions = data.map(d => d.completion);
    const mean = completions.reduce((a, b) => a + b, 0) / completions.length;
    const stdDev = Math.sqrt(
      completions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        completions.length
    );

    data.forEach((point, index) => {
      if (Math.abs(point.completion - mean) > 2 * stdDev) {
        const deviation = ((point.completion - mean) / mean) * 100;
        const severity =
          Math.abs(deviation) > 100
            ? 'critical'
            : Math.abs(deviation) > 50
            ? 'high'
            : Math.abs(deviation) > 25
            ? 'medium'
            : 'low';

        anomalies.push({
          id: `completion-${index}`,
          type: point.completion > mean ? 'spike' : 'drop',
          metric: 'completion',
          severity,
          detectedAt: new Date(point.date),
          value: point.completion,
          expectedValue: mean,
          deviation,
          description: `Taxa de conclusão ${
            point.completion > mean ? 'aumentou' : 'diminuiu'
          } ${Math.abs(deviation).toFixed(1)}% em relação à média`,
          context: { mean, stdDev, index },
          chartData: data.map(d => ({
            date: d.date,
            value: d.completion,
            expected: mean,
            anomaly: d === point,
          })),
        });
      }
    });

    return anomalies;
  };

  const detectBugAnomalies = (data: any[]): AnomalyData[] => {
    const anomalies: AnomalyData[] = [];
    const bugRates = data.map(d => d.bugRate);
    const mean = bugRates.reduce((a, b) => a + b, 0) / bugRates.length;
    const stdDev = Math.sqrt(
      bugRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bugRates.length
    );

    data.forEach((point, index) => {
      if (Math.abs(point.bugRate - mean) > 2 * stdDev) {
        const deviation = ((point.bugRate - mean) / mean) * 100;
        const severity =
          Math.abs(deviation) > 100
            ? 'critical'
            : Math.abs(deviation) > 50
            ? 'high'
            : Math.abs(deviation) > 25
            ? 'medium'
            : 'low';

        anomalies.push({
          id: `bug-${index}`,
          type: point.bugRate > mean ? 'spike' : 'drop',
          metric: 'bugRate',
          severity,
          detectedAt: new Date(point.date),
          value: point.bugRate,
          expectedValue: mean,
          deviation,
          description: `Taxa de bugs ${
            point.bugRate > mean ? 'aumentou' : 'diminuiu'
          } ${Math.abs(deviation).toFixed(1)}% em relação à média`,
          context: { mean, stdDev, index },
          chartData: data.map(d => ({
            date: d.date,
            value: d.bugRate,
            expected: mean,
            anomaly: d === point,
          })),
        });
      }
    });

    return anomalies;
  };

  const detectCycleTimeAnomalies = (data: any[]): AnomalyData[] => {
    const anomalies: AnomalyData[] = [];
    const cycleTimes = data.map(d => d.cycleTime);
    const mean = cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length;
    const stdDev = Math.sqrt(
      cycleTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        cycleTimes.length
    );

    data.forEach((point, index) => {
      if (Math.abs(point.cycleTime - mean) > 2 * stdDev) {
        const deviation = ((point.cycleTime - mean) / mean) * 100;
        const severity =
          Math.abs(deviation) > 100
            ? 'critical'
            : Math.abs(deviation) > 50
            ? 'high'
            : Math.abs(deviation) > 25
            ? 'medium'
            : 'low';

        anomalies.push({
          id: `cycle-${index}`,
          type: point.cycleTime > mean ? 'spike' : 'drop',
          metric: 'cycleTime',
          severity,
          detectedAt: new Date(point.date),
          value: point.cycleTime,
          expectedValue: mean,
          deviation,
          description: `Tempo de ciclo ${
            point.cycleTime > mean ? 'aumentou' : 'diminuiu'
          } ${Math.abs(deviation).toFixed(1)}% em relação à média`,
          context: { mean, stdDev, index },
          chartData: data.map(d => ({
            date: d.date,
            value: d.cycleTime,
            expected: mean,
            anomaly: d === point,
          })),
        });
      }
    });

    return anomalies;
  };

  const calculateVelocity = (issues: JiraIssue[]): number => {
    const completed = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    return completed.reduce((sum, issue) => {
      const type = issue.fields.issuetype.name;
      const points =
        type === 'Story' ? 3 : type === 'Task' ? 2 : type === 'Bug' ? 1 : 5;
      return sum + points;
    }, 0);
  };

  const calculateCycleTime = (issues: JiraIssue[]): number => {
    const completed = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    if (completed.length === 0) return 0;

    const totalCycleTime = completed.reduce((sum, issue) => {
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      return sum + (updated.getTime() - created.getTime());
    }, 0);

    return totalCycleTime / completed.length / (1000 * 60 * 60 * 24);
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'drop':
        return <TrendingDown className="w-5 h-5 text-blue-500" />;
      case 'pattern_break':
        return <Activity className="w-5 h-5 text-orange-500" />;
      case 'outlier':
        return <Zap className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const filteredAnomalies = anomalies.filter(anomaly => {
    const metricMatch =
      selectedMetric === 'all' || anomaly.metric === selectedMetric;
    const severityMatch =
      selectedSeverity === 'all' || anomaly.severity === selectedSeverity;
    return metricMatch && severityMatch;
  });

  const anomalyStats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Detecção de Anomalias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando padrões e detectando anomalias...</span>
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
            <Shield className="w-5 h-5" />
            Detecção de Anomalias
            <Badge variant="secondary" className="ml-2">
              {anomalyStats.total}
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={detectAnomalies}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Reanalisar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {anomalyStats.critical}
            </div>
            <div className="text-xs text-gray-500">Crítico</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {anomalyStats.high}
            </div>
            <div className="text-xs text-gray-500">Alto</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {anomalyStats.medium}
            </div>
            <div className="text-xs text-gray-500">Médio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {anomalyStats.low}
            </div>
            <div className="text-xs text-gray-500">Baixo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {anomalyStats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <select
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Todas as Métricas</option>
              <option value="velocity">Velocidade</option>
              <option value="completion">Conclusão</option>
              <option value="bugRate">Taxa de Bugs</option>
              <option value="cycleTime">Tempo de Ciclo</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Todas as Severidades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Médio</option>
              <option value="low">Baixo</option>
            </select>
          </div>
        </div>

        {/* Anomalies List */}
        <div className="space-y-6">
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma anomalia detectada nos dados atuais.</p>
              <p className="text-sm">
                O sistema está funcionando dentro dos padrões esperados.
              </p>
            </div>
          ) : (
            filteredAnomalies.map(anomaly => (
              <div key={anomaly.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getAnomalyIcon(anomaly.type)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        Anomalia em {anomaly.metric}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="outline">{anomaly.type}</Badge>
                        <span className="text-sm text-gray-500">
                          Desvio: {anomaly.deviation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">Valor Atual</div>
                    <div className="text-lg font-bold">
                      {anomaly.value.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Esperado: {anomaly.expectedValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{anomaly.description}</p>

                {/* Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={anomaly.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString('pt-BR')
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={value =>
                          new Date(value).toLocaleDateString('pt-BR')
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Valor Real"
                      />
                      <Line
                        type="monotone"
                        dataKey="expected"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Valor Esperado"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Detectado em: {anomaly.detectedAt.toLocaleString('pt-BR')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('🔍 Detalhes da anomalia:', anomaly);
                      alert(
                        `Anomalia: ${anomaly.type}\n\nMétrica: ${
                          anomaly.metric
                        }\n\nSeveridade: ${anomaly.severity}\n\nDescrição: ${
                          anomaly.description
                        }\n\nValor Detectado: ${
                          anomaly.value
                        }\n\nValor Esperado: ${
                          anomaly.expectedValue
                        }\n\nDesvio: ${anomaly.deviation.toFixed(2)}%`
                      );
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Investigar
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

export default AnomalyDetection;

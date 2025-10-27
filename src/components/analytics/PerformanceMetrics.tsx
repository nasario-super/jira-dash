import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { PerformanceMetrics as PerformanceMetricsType } from '../../services/analyticsService';

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
  loading?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  loading = false,
}) => {
  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'velocity':
        return <Zap className="w-4 h-4" />;
      case 'throughput':
        return <BarChart3 className="w-4 h-4" />;
      case 'cycleTime':
        return <Clock className="w-4 h-4" />;
      case 'leadTime':
        return <Activity className="w-4 h-4" />;
      case 'workInProgress':
        return <Target className="w-4 h-4" />;
      case 'efficiency':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'velocity':
        return 'Velocidade';
      case 'throughput':
        return 'Throughput';
      case 'cycleTime':
        return 'Tempo de Ciclo';
      case 'leadTime':
        return 'Lead Time';
      case 'workInProgress':
        return 'Work in Progress';
      case 'efficiency':
        return 'Eficiência';
      default:
        return key;
    }
  };

  const getMetricUnit = (key: string) => {
    switch (key) {
      case 'velocity':
        return 'pts/sprint';
      case 'throughput':
        return 'issues/semana';
      case 'cycleTime':
        return 'dias';
      case 'leadTime':
        return 'dias';
      case 'workInProgress':
        return 'issues';
      case 'efficiency':
        return '%';
      default:
        return '';
    }
  };

  const getMetricStatus = (key: string, value: number) => {
    switch (key) {
      case 'efficiency':
        if (value >= 70)
          return {
            status: 'success',
            icon: <CheckCircle className="w-3 h-3" />,
          };
        if (value >= 50)
          return {
            status: 'warning',
            icon: <AlertTriangle className="w-3 h-3" />,
          };
        return { status: 'error', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'workInProgress':
        if (value <= 5)
          return {
            status: 'success',
            icon: <CheckCircle className="w-3 h-3" />,
          };
        if (value <= 10)
          return {
            status: 'warning',
            icon: <AlertTriangle className="w-3 h-3" />,
          };
        return { status: 'error', icon: <AlertTriangle className="w-3 h-3" /> };
      case 'cycleTime':
        if (value <= 7)
          return {
            status: 'success',
            icon: <CheckCircle className="w-3 h-3" />,
          };
        if (value <= 14)
          return {
            status: 'warning',
            icon: <AlertTriangle className="w-3 h-3" />,
          };
        return { status: 'error', icon: <AlertTriangle className="w-3 h-3" /> };
      default:
        return { status: 'info', icon: <BarChart3 className="w-3 h-3" /> };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  const formatValue = (key: string, value: number) => {
    switch (key) {
      case 'efficiency':
        return `${value.toFixed(1)}%`;
      case 'cycleTime':
      case 'leadTime':
        return `${value.toFixed(1)} dias`;
      case 'velocity':
        return `${value.toFixed(1)} pts`;
      case 'throughput':
        return `${value.toFixed(1)} issues`;
      case 'workInProgress':
        return `${Math.round(value)} issues`;
      default:
        return value.toFixed(1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricEntries = Object.entries(metrics);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Métricas de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metricEntries.map(([key, value]) => {
            const status = getMetricStatus(key, value);
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(key)}
                  <span className="text-sm font-medium">
                    {getMetricLabel(key)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(status.status)}`}
                  >
                    {status.icon}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {formatValue(key, value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getMetricUnit(key)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Resumo de Performance
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Velocidade Média:
                  </span>
                  <span className="font-medium">
                    {formatValue('velocity', metrics.velocity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Throughput Semanal:
                  </span>
                  <span className="font-medium">
                    {formatValue('throughput', metrics.throughput)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tempo Médio de Ciclo:
                  </span>
                  <span className="font-medium">
                    {formatValue('cycleTime', metrics.cycleTime)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">
                Indicadores de Qualidade
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eficiência:</span>
                  <span className="font-medium">
                    {formatValue('efficiency', metrics.efficiency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Work in Progress:
                  </span>
                  <span className="font-medium">
                    {formatValue('workInProgress', metrics.workInProgress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Time:</span>
                  <span className="font-medium">
                    {formatValue('leadTime', metrics.leadTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;














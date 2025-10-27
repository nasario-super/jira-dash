import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  RefreshCw,
  Bell,
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Filter,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';

interface RealTimeMonitoringProps {
  issues: JiraIssue[];
  loading?: boolean;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'quality' | 'team' | 'system';
  action?: string;
}

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastUpdate: Date;
}

const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({
  issues,
  loading = false,
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alertFilters, setAlertFilters] = useState({
    severity: 'all' as 'all' | 'low' | 'medium' | 'high' | 'critical',
    category: 'all' as 'all' | 'performance' | 'quality' | 'team' | 'system',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        updateMetrics();
        checkForAlerts();
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring, issues]);

  const updateMetrics = useCallback(() => {
    if (!issues || issues.length === 0) return;

    // Calcular métricas reais baseadas nas issues
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    const inProgressIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'In Progress'
    );

    const bugIssues = issues.filter(issue =>
      issue.fields.issuetype.name.toLowerCase().includes('bug')
    );

    const newMetrics: Metric[] = [
      {
        name: 'Velocity Atual',
        value: Math.round(completedIssues.length / 4), // 4 semanas
        unit: 'pontos/semana',
        trend: completedIssues.length > issues.length * 0.2 ? 'up' : 'down',
        status:
          completedIssues.length > issues.length * 0.3 ? 'good' : 'warning',
        lastUpdate: new Date(),
      },
      {
        name: 'Issues Ativas',
        value: inProgressIssues.length,
        unit: 'issues',
        trend: inProgressIssues.length > issues.length * 0.3 ? 'up' : 'down',
        status:
          inProgressIssues.length < issues.length * 0.5 ? 'good' : 'warning',
        lastUpdate: new Date(),
      },
      {
        name: 'Taxa de Bugs',
        value: Math.round((bugIssues.length / issues.length) * 100),
        unit: '%',
        trend: bugIssues.length > issues.length * 0.2 ? 'up' : 'down',
        status: bugIssues.length < issues.length * 0.15 ? 'good' : 'critical',
        lastUpdate: new Date(),
      },
      {
        name: 'Tempo Médio',
        value: Math.round(Math.random() * 5 + 2), // Simulado por enquanto
        unit: 'dias',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        status: Math.random() > 0.3 ? 'good' : 'warning',
        lastUpdate: new Date(),
      },
    ];

    setMetrics(newMetrics);
  }, [issues]);

  const checkForAlerts = () => {
    // Simulate alert generation
    if (Math.random() > 0.7) {
      const alertTypes = [
        {
          type: 'warning' as const,
          title: 'Velocity Baixa',
          message: 'A velocity da equipe está abaixo do esperado',
          severity: 'medium' as const,
          category: 'performance' as const,
        },
        {
          type: 'error' as const,
          title: 'Taxa de Bugs Crítica',
          message: 'A taxa de bugs excedeu o limite crítico',
          severity: 'high' as const,
          category: 'quality' as const,
        },
        {
          type: 'info' as const,
          title: 'Sprint Próximo do Fim',
          message: 'Restam 2 dias para o fim do sprint',
          severity: 'low' as const,
          category: 'team' as const,
        },
        {
          type: 'success' as const,
          title: 'Meta Atingida',
          message: 'A equipe atingiu a meta de velocity',
          severity: 'low' as const,
          category: 'performance' as const,
        },
      ];

      const randomAlert =
        alertTypes[Math.floor(Math.random() * alertTypes.length)];

      const newAlert: Alert = {
        id: Date.now().toString(),
        ...randomAlert,
        timestamp: new Date(),
      };

      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only last 10 alerts
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <Zap className="w-3 h-3 text-green-600" />;
      case 'down':
        return <Zap className="w-3 h-3 text-red-600 rotate-180" />;
      default:
        return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const handleExportData = useCallback(() => {
    const data = {
      metrics,
      alerts,
      issues: issues?.length || 0,
      exportDate: new Date().toISOString(),
      monitoringStatus: isMonitoring,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, alerts, issues, isMonitoring]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const severityMatch =
        alertFilters.severity === 'all' ||
        alert.severity === alertFilters.severity;
      const categoryMatch =
        alertFilters.category === 'all' ||
        alert.category === alertFilters.category;
      return severityMatch && categoryMatch;
    });
  }, [alerts, alertFilters]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-16 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`space-y-6 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''
      }`}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Monitoramento em Tempo Real</span>
              <Badge variant="outline" className="text-xs">
                {issues?.length || 0} issues
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={isMonitoring ? 'bg-green-100 text-green-800' : ''}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Status: {isMonitoring ? 'Ativo' : 'Pausado'}</span>
              <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
              <Badge variant="outline" className="text-xs">
                {alerts.length} alertas
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAlertFilters(prev => ({ ...prev, severity: 'all' }))
                }
                className={alertFilters.severity === 'all' ? 'bg-blue-100' : ''}
              >
                Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAlertFilters(prev => ({ ...prev, severity: 'high' }))
                }
                className={alertFilters.severity === 'high' ? 'bg-red-100' : ''}
              >
                Críticos
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {metric.name}
                </h3>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <Badge
                    variant="outline"
                    className={`text-xs ${getSeverityColor(metric.status)}`}
                  >
                    {metric.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span
                  className={`text-2xl font-bold ${getStatusColor(
                    metric.status
                  )}`}
                >
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Atualizado: {metric.lastUpdate.toLocaleTimeString()}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>Alertas em Tempo Real</span>
              <Badge variant="outline" className="text-xs">
                {alerts.length}
              </Badge>
            </CardTitle>
            {alerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                Limpar Todos
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {alerts.length === 0
                    ? 'Nenhum alerta ativo'
                    : 'Nenhum alerta corresponde aos filtros'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={`p-4 ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">
                              {alert.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSeverityColor(
                                  alert.severity
                                )}`}
                              >
                                {alert.severity}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dismissAlert(alert.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <Square className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-2">
                            {alert.message}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{alert.category}</span>
                            <span>{alert.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMonitoring;

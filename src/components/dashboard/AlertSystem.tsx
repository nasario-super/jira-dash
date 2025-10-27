import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Users,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  Bell,
  BellOff,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'risk' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: Date;
  dismissed?: boolean;
  actionRequired?: boolean;
}

interface AlertSystemProps {
  issues: any[];
  users: any[];
  sprints: any[];
}

const AlertSystem: React.FC<AlertSystemProps> = ({
  issues,
  users,
  sprints,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Gerar alertas baseados nos dados
  const alerts = useMemo(() => {
    if (!alertsEnabled) return [];

    const generatedAlerts: Alert[] = [];
    const now = new Date();

    // 1. Issues atrasadas
    const overdueIssues = issues.filter(issue => {
      const dueDate = issue.fields.duedate;
      return dueDate && new Date(dueDate) < now;
    });

    if (overdueIssues.length > 0) {
      generatedAlerts.push({
        id: 'overdue-issues',
        type: 'risk',
        title: 'Issues Atrasadas',
        description: `${overdueIssues.length} issues estão atrasadas e requerem atenção imediata.`,
        severity: overdueIssues.length > 5 ? 'high' : 'medium',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 2. Baixa velocity da equipe
    const completedIssues = issues.filter(issue => {
      const status = issue.fields.status.name.toLowerCase();
      return status.includes('concluído') || status.includes('done');
    });

    const activeUsers = users.filter(user => user.totalIssues > 0);
    const avgVelocity = activeUsers.reduce((sum, user) => sum + user.velocity, 0) / Math.max(activeUsers.length, 1);

    if (avgVelocity < 10) {
      generatedAlerts.push({
        id: 'low-velocity',
        type: 'warning',
        title: 'Velocity Baixa',
        description: `A velocity média da equipe (${avgVelocity.toFixed(1)}) está abaixo do esperado.`,
        severity: 'medium',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 3. Usuários sobrecarregados
    const overloadedUsers = users.filter(user => user.totalIssues > 10);
    if (overloadedUsers.length > 0) {
      generatedAlerts.push({
        id: 'overloaded-users',
        type: 'warning',
        title: 'Usuários Sobrecarregados',
        description: `${overloadedUsers.length} usuário(s) têm mais de 10 issues atribuídas.`,
        severity: 'medium',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 4. Issues sem assignee
    const unassignedIssues = issues.filter(issue => !issue.fields.assignee);
    if (unassignedIssues.length > 5) {
      generatedAlerts.push({
        id: 'unassigned-issues',
        type: 'info',
        title: 'Issues Sem Responsável',
        description: `${unassignedIssues.length} issues não possuem responsável atribuído.`,
        severity: 'low',
        createdAt: now,
        actionRequired: false,
      });
    }

    // 5. Alta taxa de bugs
    const bugIssues = issues.filter(issue => 
      issue.fields.issuetype.name.toLowerCase().includes('bug')
    );
    const bugRate = (bugIssues.length / Math.max(issues.length, 1)) * 100;

    if (bugRate > 20) {
      generatedAlerts.push({
        id: 'high-bug-rate',
        type: 'risk',
        title: 'Alta Taxa de Bugs',
        description: `${bugRate.toFixed(1)}% das issues são bugs. Considere revisar o processo de QA.`,
        severity: 'high',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 6. Equipe com boa performance
    const highPerformers = users.filter(user => user.efficiency > 85);
    if (highPerformers.length >= users.length * 0.7) {
      generatedAlerts.push({
        id: 'good-performance',
        type: 'success',
        title: 'Excelente Performance',
        description: `${highPerformers.length} usuários estão com eficiência acima de 85%.`,
        severity: 'low',
        createdAt: now,
        actionRequired: false,
      });
    }

    return generatedAlerts.filter(alert => !dismissedAlerts.has(alert.id));
  }, [issues, users, sprints, dismissedAlerts, alertsEnabled]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'warning': return <Clock className="w-5 h-5" />;
      case 'info': return <AlertCircle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'risk': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(alert => alert.severity === 'medium');
  const lowPriorityAlerts = alerts.filter(alert => alert.severity === 'low');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Alertas</h2>
          <p className="text-gray-600">Monitoramento em tempo real dos riscos e oportunidades</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            {alertsEnabled ? (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Alertas Ativos
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Alertas Pausados
              </>
            )}
          </Button>
          <Badge variant="outline" className="text-sm">
            {alerts.length} Alertas Ativos
          </Badge>
        </div>
      </div>

      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {highPriorityAlerts.length}
            </div>
            <div className="text-sm text-red-700">Alto Risco</div>
            <div className="text-xs text-red-600">Requer ação imediata</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {mediumPriorityAlerts.length}
            </div>
            <div className="text-sm text-yellow-700">Atenção</div>
            <div className="text-xs text-yellow-600">Monitorar de perto</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {lowPriorityAlerts.length}
            </div>
            <div className="text-sm text-blue-700">Informação</div>
            <div className="text-xs text-blue-600">Para conhecimento</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`${getAlertColor(alert.type)} hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'risk' ? 'bg-red-100 text-red-600' :
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        alert.type === 'info' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Ação Necessária
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        <div className="text-xs text-gray-500">
                          {alert.createdAt.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Tudo Certo!
              </h3>
              <p className="text-green-700">
                Nenhum alerta ativo no momento. A equipe está funcionando bem.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertSystem;

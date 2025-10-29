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
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Gerar alertas baseados nos dados
  const alerts = useMemo(() => {
    if (!alertsEnabled) return [];

    const generatedAlerts: Alert[] = [];
    const now = new Date();

    // 1. Issues atrasadas
    const overdueIssues = issues.filter((issue : any) => {
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
    const completedIssues = issues.filter((issue : any) => {
      const status = issue.fields.status.name.toLowerCase();
      return status.includes('concluído') || status.includes('done');
    });

    const activeUsers = users.filter((user : any) => user.totalIssues > 0);
    const avgVelocity =
      activeUsers.reduce((sum, user) => sum + user.velocity, 0) /
      Math.max(activeUsers.length, 1);

    if (avgVelocity < 10) {
      generatedAlerts.push({
        id: 'low-velocity',
        type: 'warning',
        title: 'Velocity Baixa',
        description: `A velocity média da equipe (${avgVelocity.toFixed(
          1
        )}) está abaixo do esperado.`,
        severity: 'medium',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 3. Usuários sobrecarregados
    const overloadedUsers = users.filter((user : any) => user.totalIssues > 10);
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
    const unassignedIssues = issues.filter((issue : any) => !issue.fields.assignee);
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
    const bugIssues = issues.filter((issue : any) =>
      issue.fields.issuetype.name.toLowerCase().includes('bug')
    );
    const bugRate = (bugIssues.length / Math.max(issues.length, 1)) * 100;

    if (bugRate > 20) {
      generatedAlerts.push({
        id: 'high-bug-rate',
        type: 'risk',
        title: 'Alta Taxa de Bugs',
        description: `${bugRate.toFixed(
          1
        )}% das issues são bugs. Considere revisar o processo de QA.`,
        severity: 'high',
        createdAt: now,
        actionRequired: true,
      });
    }

    // 6. Equipe com boa performance
    const highPerformers = users.filter((user : any) => user.efficiency > 85);
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

    return generatedAlerts.filter((alert : any) => !dismissedAlerts.has(alert.id));
  }, [issues, users, sprints, dismissedAlerts, alertsEnabled]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // ✅ FUNÇÃO: Obter issues relacionadas ao alerta
  const getRelatedIssues = (alertId: string) => {
    const now = new Date();

    switch (alertId) {
      case 'overdue-issues':
        return issues.filter((issue : any) => {
          const dueDate = issue.fields.duedate;
          return dueDate && new Date(dueDate) < now;
        });

      case 'unassigned-issues':
        return issues.filter((issue : any) => !issue.fields.assignee);

      case 'high-bug-rate':
        return issues.filter((issue : any) =>
          issue.fields.issuetype.name.toLowerCase().includes('bug')
        );

      default:
        return [];
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <Clock className="w-5 h-5" />;
      case 'info':
        return <AlertCircle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'risk':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const highPriorityAlerts = alerts.filter((alert : any) => alert.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(
    alert => alert.severity === 'medium'
  );
  const lowPriorityAlerts = alerts.filter((alert : any) => alert.severity === 'low');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sistema de Alertas
          </h2>
          <p className="text-gray-600">
            Monitoramento em tempo real dos riscos e oportunidades
          </p>
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
              <Card
                className={`${getAlertColor(
                  alert.type
                )} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedAlert(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          alert.type === 'risk'
                            ? 'bg-red-100 text-red-600'
                            : alert.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-600'
                            : alert.type === 'info'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {alert.title}
                          </h3>
                          <Badge
                            className={`text-xs ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Ação Necessária
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {alert.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          {alert.createdAt.toLocaleString('pt-BR')}
                          {' • '}
                          <span className="text-blue-600 font-medium">
                            Clique para detalhes
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
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

      {/* Modal de Detalhes do Alerta */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAlert(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div
                className={`px-6 py-4 flex items-start justify-between border-b ${
                  selectedAlert.type === 'risk'
                    ? 'bg-red-50 border-red-200'
                    : selectedAlert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : selectedAlert.type === 'info'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`p-3 rounded-lg ${
                      selectedAlert.type === 'risk'
                        ? 'bg-red-100 text-red-600'
                        : selectedAlert.type === 'warning'
                        ? 'bg-yellow-100 text-yellow-600'
                        : selectedAlert.type === 'info'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {getAlertIcon(selectedAlert.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedAlert.title}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge
                        className={`text-xs ${getSeverityColor(
                          selectedAlert.severity
                        )}`}
                      >
                        {selectedAlert.severity}
                      </Badge>
                      {selectedAlert.actionRequired && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-orange-100"
                        >
                          ⚠️ Ação Necessária
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Descrição */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detalhes</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedAlert.description}
                  </p>
                </div>

                {/* Issues Relacionadas */}
                {selectedAlert.id !== 'low-velocity' &&
                  selectedAlert.id !== 'good-performance' &&
                  selectedAlert.id !== 'overloaded-users' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Issues Relacionadas (
                        {getRelatedIssues(selectedAlert.id).length})
                      </h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {getRelatedIssues(selectedAlert.id).length > 0 ? (
                          getRelatedIssues(selectedAlert.id)
                            .slice(0, 20)
                            .map((issue, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="font-mono text-sm font-bold text-blue-600">
                                    {issue.key}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.fields.status.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                                  {issue.fields.summary}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {issue.fields.assignee && (
                                    <span>
                                      👤 {issue.fields.assignee.displayName}
                                    </span>
                                  )}
                                  {issue.fields.duedate && (
                                    <span>
                                      📅{' '}
                                      {new Date(
                                        issue.fields.duedate
                                      ).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>Nenhuma issue relacionada</p>
                          </div>
                        )}
                        {getRelatedIssues(selectedAlert.id).length > 20 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            +{getRelatedIssues(selectedAlert.id).length - 20}{' '}
                            mais
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Informações */}
                <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>
                    Criado em: {selectedAlert.createdAt.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertSystem;

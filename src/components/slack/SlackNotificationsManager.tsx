import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { motion } from 'framer-motion';
import {
  Slack,
  Bell,
  AlertCircle,
  CheckCircle,
  Settings,
  TestTube,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Play,
  Pause,
  Trash2,
  Hash,
  Clock,
} from 'lucide-react';
import { slackService } from '../../services/slackService';

interface NotificationSettings {
  alerts: boolean;
  reports: boolean;
  dailyMetrics: boolean;
  sprintUpdates: boolean;
  issueOverdue: boolean;
  velocityLow: boolean;
  teamOverloaded: boolean;
}

const SlackNotificationsManager: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<NotificationSettings>({
    alerts: true,
    reports: true,
    dailyMetrics: true,
    sprintUpdates: false,
    issueOverdue: true,
    velocityLow: true,
    teamOverloaded: true,
  });

  useEffect(() => {
    checkConfiguration();
    loadSettings();
  }, []);

  const checkConfiguration = () => {
    const configured = slackService.isConfigured();
    setIsConfigured(configured);
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('slackNotificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('slackNotificationSettings', JSON.stringify(newSettings));
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('idle');

    try {
      const success = await slackService.testConnection();
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await slackService.sendMessage('🧪 Esta é uma notificação de teste do Jira Dashboard!');
      alert('Notificação de teste enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      alert('Erro ao enviar notificação de teste.');
    }
  };

  const handleDisableSlack = () => {
    if (window.confirm('Tem certeza que deseja desabilitar as notificações do Slack?')) {
      slackService.disable();
      setIsConfigured(false);
    }
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Slack className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Slack não configurado
          </h3>
          <p className="text-gray-600 mb-4">
            Configure o Slack para receber notificações automáticas.
          </p>
          <Button onClick={() => window.location.reload()}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Slack
          </Button>
        </CardContent>
      </Card>
    );
  }

  const notificationTypes = [
    {
      key: 'alerts' as keyof NotificationSettings,
      title: 'Alertas Gerais',
      description: 'Notificações de alertas e problemas críticos',
      icon: AlertCircle,
      color: 'text-red-500',
    },
    {
      key: 'reports' as keyof NotificationSettings,
      title: 'Relatórios',
      description: 'Notificação quando relatórios são gerados',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      key: 'dailyMetrics' as keyof NotificationSettings,
      title: 'Métricas Diárias',
      description: 'Resumo diário de performance da equipe',
      icon: BarChart3,
      color: 'text-green-500',
    },
    {
      key: 'sprintUpdates' as keyof NotificationSettings,
      title: 'Updates de Sprint',
      description: 'Progresso e status dos sprints',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      key: 'issueOverdue' as keyof NotificationSettings,
      title: 'Issues Atrasadas',
      description: 'Alertas para issues que passaram do prazo',
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      key: 'velocityLow' as keyof NotificationSettings,
      title: 'Velocity Baixa',
      description: 'Alertas quando a velocity da equipe está baixa',
      icon: BarChart3,
      color: 'text-yellow-500',
    },
    {
      key: 'teamOverloaded' as keyof NotificationSettings,
      title: 'Equipe Sobrecarregada',
      description: 'Alertas quando membros da equipe têm muitas issues',
      icon: Users,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Slack className="w-5 h-5 mr-2 text-purple-600" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Slack Conectado</div>
                <div className="text-sm text-gray-500">Notificações ativas</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar
                  </>
                )}
              </Button>
              {testResult === 'success' && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  OK
                </Badge>
              )}
              {testResult === 'error' && (
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Erro
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Tipos de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{type.title}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings[type.key]}
                    onCheckedChange={(checked) => handleSettingChange(type.key, checked)}
                  />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Teste de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-yellow-600" />
            Teste de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Envie uma notificação de teste para verificar se tudo está funcionando corretamente.
            </p>
            <Button
              onClick={handleSendTestNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Gerenciar configurações do Slack
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Settings className="w-4 h-4 mr-2" />
                Reconfigurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisableSlack}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Desabilitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlackNotificationsManager;

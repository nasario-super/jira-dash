import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import {
  X,
  Slack,
  CheckCircle,
  AlertCircle,
  Settings,
  TestTube,
  Bell,
  Users,
  Hash,
  Smile,
  Link,
} from 'lucide-react';
import { slackService, SlackConfig } from '../../services/slackService';

interface SlackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SlackConfig) => void;
}

const SlackConfigModal: React.FC<SlackConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<SlackConfig>({
    webhookUrl: '',
    channel: '#jira-dashboard',
    username: 'Jira Bot',
    iconEmoji: ':robot_face:',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carregar configuração existente
      const existingConfig = slackService.loadConfig();
      if (existingConfig) {
        setConfig(existingConfig);
        setIsEnabled(true);
      }
    }
  }, [isOpen]);

  const handleConfigChange = (key: keyof SlackConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('idle');

    try {
      // Configurar temporariamente para teste
      slackService.configure(config);
      const success = await slackService.testConnection();
      
      setTestResult(success ? 'success' : 'error');
      
      if (!success) {
        // Desabilitar se o teste falhou
        slackService.disable();
        setIsEnabled(false);
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!config.webhookUrl.trim()) {
      alert('Por favor, insira a URL do webhook do Slack.');
      return;
    }

    if (!config.channel.trim()) {
      alert('Por favor, insira o canal do Slack.');
      return;
    }

    onSave(config);
    onClose();
  };

  const handleEnableToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled) {
      slackService.disable();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Slack className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configuração do Slack</h2>
                <p className="text-sm text-gray-500">Configure notificações automáticas</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Notificações Slack</div>
                  <div className="text-sm text-gray-500">
                    {isEnabled ? 'Configurado e ativo' : 'Desabilitado'}
                  </div>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleEnableToggle}
              />
            </div>

            {isEnabled && (
              <>
                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Link className="w-4 h-4 inline mr-1" />
                    URL do Webhook
                  </label>
                  <Input
                    value={config.webhookUrl}
                    onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtenha a URL do webhook nas configurações do seu app Slack
                  </p>
                </div>

                {/* Canal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Canal
                  </label>
                  <Input
                    value={config.channel}
                    onChange={(e) => handleConfigChange('channel', e.target.value)}
                    placeholder="#jira-dashboard"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nome do canal onde as notificações serão enviadas
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Nome do Bot
                  </label>
                  <Input
                    value={config.username}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    placeholder="Jira Bot"
                  />
                </div>

                {/* Emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Smile className="w-4 h-4 inline mr-1" />
                    Emoji do Bot
                  </label>
                  <Input
                    value={config.iconEmoji}
                    onChange={(e) => handleConfigChange('iconEmoji', e.target.value)}
                    placeholder=":robot_face:"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Emoji que aparecerá nas mensagens do bot
                  </p>
                </div>

                {/* Teste de Conexão */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TestTube className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Teste de Conexão</span>
                    </div>
                    {testResult === 'success' && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conectado
                      </Badge>
                    )}
                    {testResult === 'error' && (
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Teste a conexão enviando uma mensagem de teste para o canal configurado.
                  </p>
                  
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting || !config.webhookUrl.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>

                {/* Tipos de Notificação */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Notificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Alertas Críticos</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Issues atrasadas, problemas de performance
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bell className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Relatórios</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Notificação quando relatórios são gerados
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Métricas Diárias</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Resumo diário de performance da equipe
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Settings className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Updates de Sprint</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Progresso e status dos sprints
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-gray-500">
                {isEnabled ? 'Notificações ativas' : 'Notificações desabilitadas'}
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                {isEnabled && (
                  <Button onClick={handleSave}>
                    Salvar Configuração
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SlackConfigModal;

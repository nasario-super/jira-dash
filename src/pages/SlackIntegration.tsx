import React, { useState } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraFilters } from '../hooks/useJiraFilters';
import Layout from '../components/common/Layout';
import SlackConfigModal from '../components/slack/SlackConfigModal';
import SlackNotificationsManager from '../components/slack/SlackNotificationsManager';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import {
  Slack,
  Bell,
  Settings,
  TestTube,
  Users,
  BarChart3,
  Home,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Hash,
  Clock,
  FileText,
} from 'lucide-react';
import { slackService, SlackConfig } from '../services/slackService';

const SlackIntegrationPage: React.FC = () => {
  const { isAuthenticated, credentials } = useAuth();
  const { data, loading, error } = useJiraFilters();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Early return se não autenticado
  if (!isAuthenticated || !credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSaveConfig = (config: SlackConfig) => {
    slackService.configure(config);
    setIsConfigured(true);
    alert('Configuração do Slack salva com sucesso!');
  };

  const handleTestConnection = async () => {
    try {
      const success = await slackService.testConnection();
      if (success) {
        alert('Conexão com Slack testada com sucesso!');
      } else {
        alert('Erro ao conectar com Slack. Verifique a configuração.');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      alert('Erro ao testar conexão com Slack.');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await slackService.sendMessage(
        '🧪 Esta é uma notificação de teste do Jira Dashboard!'
      );
      alert('Notificação de teste enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação de teste.');
    }
  };

  // Verificar se o Slack está configurado
  React.useEffect(() => {
    setIsConfigured(slackService.isConfigured());
  }, []);

  return (
    <Layout
      onRefresh={handleRefresh}
      isRefreshing={loading || isRefreshing}
      lastUpdated={new Date()}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Integração Slack
              </h1>
              <p className="text-gray-600 mt-1">
                Configure notificações automáticas para sua equipe
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard Principal
              </Button>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-red-900 font-semibold mb-1">
                  Erro ao buscar dados
                </h4>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Carregando dados...
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto buscamos os dados do Jira.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Status da Integração */}
            <div className="mb-8">
              <Card
                className={
                  isConfigured
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isConfigured ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <Slack
                          className={`w-5 h-5 ${
                            isConfigured ? 'text-green-600' : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isConfigured
                            ? 'Slack Integrado'
                            : 'Slack Não Configurado'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isConfigured
                            ? 'Notificações automáticas estão ativas'
                            : 'Configure o Slack para receber notificações automáticas'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isConfigured ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setIsConfigModalOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isConfigured ? 'Reconfigurar' : 'Configurar'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {isConfigured
                      ? 'Atualizar configurações do Slack'
                      : 'Configure webhook e canal do Slack'}
                  </p>
                  <Button size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    {isConfigured ? 'Reconfigurar' : 'Configurar'}
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleTestConnection}
              >
                <CardContent className="p-6 text-center">
                  <TestTube className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Testar Conexão
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Verifique se a conexão com Slack está funcionando
                  </p>
                  <Button size="sm" disabled={!isConfigured}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleSendTestNotification}
              >
                <CardContent className="p-6 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Notificação de Teste
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Envie uma mensagem de teste para o canal
                  </p>
                  <Button size="sm" disabled={!isConfigured}>
                    <Bell className="w-4 h-4 mr-2" />
                    Enviar Teste
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tipos de Notificação */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tipos de Notificação
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Alertas Críticos
                    </h4>
                    <p className="text-sm text-gray-600">
                      Issues atrasadas, problemas de performance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Relatórios
                    </h4>
                    <p className="text-sm text-gray-600">
                      Notificação quando relatórios são gerados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Métricas Diárias
                    </h4>
                    <p className="text-sm text-gray-600">
                      Resumo diário de performance da equipe
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Updates de Sprint
                    </h4>
                    <p className="text-sm text-gray-600">
                      Progresso e status dos sprints
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Gerenciador de Notificações */}
            {isConfigured && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SlackNotificationsManager />
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modal de Configuração */}
      <SlackConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </Layout>
  );
};

export default SlackIntegrationPage;

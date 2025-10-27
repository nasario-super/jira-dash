import React, { useState } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraFilters } from '../hooks/useJiraFilters';
import Layout from '../components/common/Layout';
import ExecutiveDashboard from '../components/executive/ExecutiveDashboard';
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
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Home,
  Download,
  Settings,
  RefreshCw,
} from 'lucide-react';

const ExecutiveDashboardPage: React.FC = () => {
  const { isAuthenticated, credentials } = useAuth();
  const { data, loading, error } = useJiraFilters();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    // Simular refresh
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleExport = () => {
    // Implementar exportação de relatório
    console.log('Exportando relatório executivo...');
  };

  // Processar dados para o dashboard executivo
  const processedData = {
    issues: data?.issues || [],
    users: [], // Será processado pelo componente
    projects: [], // Será processado pelo componente
  };

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
                Executive Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Visão estratégica e métricas de alto nível
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
                onClick={handleExport}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
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
              <BarChart3 className="text-red-600 flex-shrink-0" size={20} />
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
                Carregando métricas executivas...
              </h3>
              <p className="text-gray-600">
                Aguarde enquanto processamos os dados do Jira.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ExecutiveDashboard
              issues={processedData.issues}
              users={processedData.users}
              projects={processedData.projects}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && (!data || data.issues.length === 0) && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-gray-600 mb-4">
                Não há dados suficientes para exibir métricas executivas.
              </p>
              <Button onClick={() => (window.location.href = '/')}>
                Voltar ao Dashboard Principal
              </Button>
            </div>
          </div>
        )}

        {/* Footer com informações adicionais */}
        {!loading && data && data.issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Última atualização: {new Date().toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Total de issues: {data.issues.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Período: Últimos 90 dias
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ExecutiveDashboardPage;

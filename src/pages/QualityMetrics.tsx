import React, { useState } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraFilters } from '../hooks/useJiraFilters';
import Layout from '../components/common/Layout';
import QualityDashboard from '../components/quality/QualityDashboard';
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
  Shield,
  Bug,
  RotateCcw,
  Target,
  TrendingUp,
  AlertTriangle,
  Home,
  RefreshCw,
  BarChart3,
  Activity,
  Users,
  Clock,
  Award,
} from 'lucide-react';

const QualityMetricsPage: React.FC = () => {
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
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Processar dados para o dashboard de qualidade
  const processedData = {
    issues: data?.issues || [],
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
                Métricas de Qualidade
              </h1>
              <p className="text-gray-600 mt-1">
                Análise de qualidade e performance do desenvolvimento
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
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
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
                Carregando métricas de qualidade...
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
            <QualityDashboard
              issues={processedData.issues}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && (!data || data.issues.length === 0) && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Shield className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-gray-600 mb-4">
                Não há dados suficientes para calcular métricas de qualidade.
              </p>
              <Button onClick={() => (window.location.href = '/')}>
                Voltar ao Dashboard Principal
              </Button>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
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
                  <Activity className="w-5 h-5 mr-2" />
                  Sobre as Métricas de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Bug className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-gray-900">
                        Taxa de Bugs
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Percentual de issues que são identificadas como bugs ou
                      defeitos.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-gray-900">
                        Taxa de Retrabalho
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Percentual de issues que foram reabertas após serem
                      marcadas como concluídas.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        Cobertura de Testes
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Percentual de código coberto por testes automatizados.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">
                        Qualidade do Código
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Métrica baseada em padrões de código, complexidade e
                      manutenibilidade.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-gray-900">
                        Tempo de Resolução
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tempo médio para resolver issues, indicando eficiência da
                      equipe.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      <span className="font-medium text-gray-900">
                        Satisfação do Cliente
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Nível de satisfação baseado na qualidade e tempo de
                      entrega.
                    </p>
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

export default QualityMetricsPage;

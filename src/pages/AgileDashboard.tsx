// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraFilters } from '../hooks/useJiraFilters';
import Layout from '../components/common/Layout';
import DailyScrumDashboard from '../components/dashboard/DailyScrumDashboard';
import VelocityTracking from '../components/dashboard/VelocityTracking';
import AlertSystem from '../components/dashboard/AlertSystem';
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
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  Home,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

const AgileDashboard: React.FC = () => {
  const { isAuthenticated, credentials } = useAuth();
  const { data, loading, error } = useJiraFilters();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'daily' | 'velocity' | 'alerts'
  >('overview');

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

  // Processar dados para os componentes
  const issues = data?.issues || [];

  // Calcular métricas de negócio
  const metrics = useMemo(() => {
    const total = issues.length;

    // ✅ FUNÇÃO AUXILIAR: Detectar status com múltiplas estratégias
    const isCompleted = (issue: any) => {
      const status = issue.fields.status;
      return (
        // Estratégia 1: StatusCategory
        status?.statusCategory?.name === 'Done' ||
        status?.statusCategory?.key === 'done' ||
        // Estratégia 2: Status.name (português)
        status?.name === 'Concluído' ||
        status?.name === 'Fechado' ||
        status?.name === 'Resolvido' ||
        // Estratégia 3: Status.name (inglês)
        status?.name === 'Done' ||
        // Estratégia 4: Status.id (Jira padrão usa 10000+)
        status?.id === '10000' || // Comum em Jira
        status?.id === '10001'
      );
    };

    const isInProgress = (issue: any) => {
      const status = issue.fields.status;
      return (
        status?.statusCategory?.name === 'In Progress' ||
        status?.statusCategory?.key === 'indeterminate' ||
        status?.name === 'Em Andamento' ||
        status?.name === 'Em Progresso' ||
        status?.name === 'In Progress' ||
        status?.name === 'Em desenvolvimento'
      );
    };

    const completed = issues.filter(isCompleted).length;
    const inProgress = issues.filter(isInProgress).length;

    const blocked = issues.filter(
      i =>
        i.fields.status.name?.toLowerCase().includes('blocked') ||
        i.fields.status.name?.toLowerCase().includes('impediment') ||
        i.fields.status.name?.toLowerCase().includes('bloqueado')
    ).length;

    const overdue = issues.filter(
      i =>
        i.fields.duedate &&
        new Date(i.fields.duedate) < new Date() &&
        !isCompleted(i) // Usar função auxiliar
    ).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const health = overdue > total * 0.1 || blocked > 0 ? 'warning' : 'healthy';

    // ✅ LOG DE DEBUG
    if (issues.length > 0) {
      console.log('📊 Métricas Agile:', {
        total,
        completed,
        inProgress,
        blocked,
        overdue,
        completionRate: Math.round(completionRate),
        statusExemplos: issues.slice(0, 3).map((i : any) => ({
          key: i.key,
          status: i.fields.status.name,
          statusCategory: i.fields.status.statusCategory?.name,
          isCompleted: isCompleted(i),
          isInProgress: isInProgress(i),
        })),
      });
    }

    return {
      total,
      completed,
      inProgress,
      blocked,
      overdue,
      completionRate,
      health,
      trend:
        completed > total * 0.6
          ? 'up'
          : completed > total * 0.3
          ? 'stable'
          : 'down',
    };
  }, [issues]);

  const processedData = {
    issues,
    users: [],
    sprints: [],
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3, color: 'blue' },
    { id: 'daily', label: 'Daily Scrum', icon: Calendar, color: 'blue' },
    { id: 'velocity', label: 'Velocity', icon: TrendingUp, color: 'green' },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle, color: 'red' },
  ];

  return (
    <Layout
      onRefresh={() => window.location.reload()}
      isRefreshing={loading}
      lastUpdated={new Date()}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Agile Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Ferramentas avançadas para gestão ágil, Dailys e métricas de
                equipe
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
              <Badge
                variant="outline"
                className={`text-sm ${
                  metrics.health === 'warning'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {metrics.health === 'warning' ? (
                  <AlertCircle className="w-4 h-4 mr-1" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                )}
                {metrics.health === 'warning' ? 'Atenção' : 'Saudável'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Issues</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {metrics.total}
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-blue-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Concluídas</p>
                    <p className="text-3xl font-bold text-green-600">
                      {metrics.completed}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(metrics.completionRate)}%
                    </p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 text-green-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Progresso</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {metrics.inProgress}
                    </p>
                  </div>
                  <Zap className="w-12 h-12 text-blue-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bloqueadas</p>
                    <p className="text-3xl font-bold text-red-600">
                      {metrics.blocked}
                    </p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Atraso</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {metrics.overdue}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-orange-100" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
                  onClick={() => window.location.reload()}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Carregando Agile Dashboard...
              </h3>
              <p className="text-gray-600">
                Processando dados de issues e sprints
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-2 flex gap-2">
              {tabs.map((tab : any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Health Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Status de Saúde do Sprint</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progresso Geral
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {Math.round(metrics.completionRate)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                              style={{ width: `${metrics.completionRate}%` }}
                            ></div>
                          </div>
                        </div>

                        {metrics.overdue > 0 && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-orange-700">
                              <AlertCircle className="w-5 h-5" />
                              <span>
                                {metrics.overdue} issue
                                {metrics.overdue !== 1 ? 's' : ''} em atraso
                              </span>
                            </div>
                          </div>
                        )}

                        {metrics.blocked > 0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-red-700">
                              <AlertTriangle className="w-5 h-5" />
                              <span>
                                {metrics.blocked} issue
                                {metrics.blocked !== 1 ? 's' : ''} bloqueada
                                {metrics.blocked !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'daily' && (
                <DailyScrumDashboard
                  issues={processedData.issues}
                  users={processedData.users}
                  sprints={processedData.sprints}
                />
              )}

              {activeTab === 'velocity' && (
                <VelocityTracking
                  issues={processedData.issues}
                  users={processedData.users}
                  sprints={processedData.sprints}
                />
              )}

              {activeTab === 'alerts' && (
                <AlertSystem
                  issues={processedData.issues}
                  users={processedData.users}
                  sprints={processedData.sprints}
                />
              )}
            </motion.div>
          </>
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
                Não há dados suficientes para exibir o Agile Dashboard.
              </p>
              <Button onClick={() => (window.location.href = '/')}>
                Voltar ao Dashboard Principal
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgileDashboard;

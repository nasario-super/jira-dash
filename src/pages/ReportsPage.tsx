import React, { useState } from 'react';
import { useAuth } from '../stores/authStore';
import { useJiraFilters } from '../hooks/useJiraFilters';
import Layout from '../components/common/Layout';
import ReportConfigModal from '../components/reports/ReportConfigModal';
import ScheduledReportsManager from '../components/reports/ScheduledReportsManager';
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
  FileText,
  Table,
  Download,
  Calendar,
  Settings,
  BarChart3,
  Home,
  RefreshCw,
  Plus,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  reportService,
  ReportData,
  ReportConfig,
} from '../services/reportService';

const ReportsPage: React.FC = () => {
  const { isAuthenticated, credentials } = useAuth();
  const { data, loading, error } = useJiraFilters();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'scheduled'>('create');

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

  const handleExport = async (config: ReportConfig) => {
    if (!data) {
      alert('Nenhum dado disponível para exportar.');
      return;
    }

    try {
      // Preparar dados do relatório
      const reportData: ReportData = {
        issues: data.issues || [],
        users: [], // Será processado pelo serviço
        projects: [], // Será processado pelo serviço
        metrics: {
          totalIssues: data.issues?.length || 0,
          completedIssues:
            data.issues?.filter(
              issue =>
                issue.fields.status.name.toLowerCase().includes('concluído') ||
                issue.fields.status.name.toLowerCase().includes('done') ||
                issue.fields.status.name.toLowerCase().includes('closed')
            ).length || 0,
          inProgressIssues:
            data.issues?.filter(
              issue =>
                issue.fields.status.name.toLowerCase().includes('andamento') ||
                issue.fields.status.name.toLowerCase().includes('progress')
            ).length || 0,
          overdueIssues:
            data.issues?.filter(issue => {
              const dueDate = issue.fields.duedate;
              return dueDate && new Date(dueDate) < new Date();
            }).length || 0,
          completionRate: 0, // Será calculado
          avgResolutionTime: 5.2, // Simulado
          teamProductivity: 0, // Será calculado
        },
        period: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 dias atrás
          end: new Date(),
        },
      };

      // Calcular métricas
      if (reportData.issues.length > 0) {
        reportData.metrics.completionRate =
          (reportData.metrics.completedIssues /
            reportData.metrics.totalIssues) *
          100;
        reportData.metrics.teamProductivity =
          reportData.metrics.completedIssues / 4; // Aproximação
      }

      // Exportar baseado no formato
      switch (config.format) {
        case 'pdf':
          await reportService.exportToPDF(reportData, config);
          break;
        case 'excel':
          await reportService.exportToExcel(reportData, config);
          break;
        case 'csv':
          await reportService.exportToCSV(reportData, config);
          break;
      }

      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  const handleSchedule = (config: ReportConfig, schedule: any) => {
    try {
      reportService.scheduleReport(config, schedule);
      alert('Relatório agendado com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      alert('Erro ao agendar relatório. Tente novamente.');
    }
  };

  const tabs = [
    { id: 'create', label: 'Criar Relatório', icon: Plus },
    { id: 'scheduled', label: 'Relatórios Agendados', icon: Calendar },
  ];

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
                Sistema de Relatórios
              </h1>
              <p className="text-gray-600 mt-1">
                Exporte dados e configure relatórios automáticos
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
        {!loading && data && (
          <>
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'create' && (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setIsConfigModalOpen(true)}
                    >
                      <CardContent className="p-6 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Relatório PDF
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Relatório visual com gráficos e métricas
                        </p>
                        <Button size="sm">Criar Relatório</Button>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setIsConfigModalOpen(true)}
                    >
                      <CardContent className="p-6 text-center">
                        <Table className="w-12 h-12 mx-auto mb-4 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Planilha Excel
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Dados detalhados em formato de planilha
                        </p>
                        <Button size="sm">Criar Relatório</Button>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setIsConfigModalOpen(true)}
                    >
                      <CardContent className="p-6 text-center">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Relatório Agendado
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Configure relatórios automáticos
                        </p>
                        <Button size="sm">Agendar</Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estatísticas Rápidas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.issues?.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total de Issues
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.issues?.filter(
                            issue =>
                              issue.fields.status.name
                                .toLowerCase()
                                .includes('concluído') ||
                              issue.fields.status.name
                                .toLowerCase()
                                .includes('done')
                          ).length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Concluídas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {data.issues?.filter(
                            issue =>
                              issue.fields.status.name
                                .toLowerCase()
                                .includes('andamento') ||
                              issue.fields.status.name
                                .toLowerCase()
                                .includes('progress')
                          ).length || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          Em Andamento
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {data.issues?.filter(issue => {
                            const dueDate = issue.fields.duedate;
                            return dueDate && new Date(dueDate) < new Date();
                          }).length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Atrasadas</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'scheduled' && <ScheduledReportsManager />}
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
                Não há dados suficientes para gerar relatórios.
              </p>
              <Button onClick={() => (window.location.href = '/')}>
                Voltar ao Dashboard Principal
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configuração */}
      <ReportConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onExport={handleExport}
        onSchedule={handleSchedule}
      />
    </Layout>
  );
};

export default ReportsPage;

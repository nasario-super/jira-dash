// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useAuth } from '../../stores/authStore';
import { useJiraFilters } from '../../hooks/useJiraFilters';
import { useProjectAccess } from '../../hooks/useProjectAccess';
import { useSecureJiraData } from '../../hooks/useSecureJiraData';
import Layout from '../common/Layout';
import { FilterBar } from './FilterBar';
import MetricsCard from './MetricsCard';
import UserCard from './UserCard';
import ProjectCard from './ProjectCard';
import AdvancedMetricsCard from './AdvancedMetricsCard';
import UserDetailModal from './UserDetailModal';
import UserProjectAccess from '../common/UserProjectAccess';
import DataFilteringDiagnostic from '../common/DataFilteringDiagnostic';
import ProjectFilteringDebug from '../common/ProjectFilteringDebug';
import AutomaticProjectDiscovery from '../common/AutomaticProjectDiscovery';
import { ProjectAccessTestPanel } from './ProjectAccessTestPanel';
import { ProjectConfiguration } from './ProjectConfiguration';
import { BurndownChart } from '../charts/BurndownChart';
import { IssuesByStatusChart } from '../charts/IssuesByStatusChart';
import { VelocityChart } from '../charts/VelocityChart';
import { IssuesByTypeChart } from '../charts/IssuesByTypeChart';
import {
  processBurndownData,
  processStatusData,
  processVelocityData,
  processIssueTypeData,
  processTimelineData,
  processPriorityByStatus,
} from '../../services/dataProcessing';
import {
  AlertCircle,
  Users,
  FolderOpen,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

const OptimizedDashboard: React.FC = () => {
  console.log('🚀 OptimizedDashboard rendering...');

  const { isAuthenticated, credentials } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  console.log('🔍 Auth state:', {
    isAuthenticated,
    hasCredentials: !!credentials,
  });

  // Early returns BEFORE any other hooks
  if (!isAuthenticated || !credentials) {
    console.log('❌ Not authenticated or no credentials');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const {
    filters,
    filterOptions,
    updateFilter,
    clearAllFilters,
    activeFiltersCount,
    hasActiveFilters,
  } = useJiraFilters();

  const { data, loading, error, isSecure, accessInfo } = useSecureJiraData();

  // Hook para descoberta automática de projetos (desabilitado)
  // const { isDiscovering, discoveryInfo, forceRediscovery } = useProjectAccess();
  const isDiscovering = false;
  const discoveryInfo = null;
  const forceRediscovery = () => {
    console.log(
      '🔐 OptimizedDashboard - Force rediscovery disabled, user must select projects manually'
    );
  };

  console.log('🔍 useJiraFilters state:', {
    filters,
    filterOptions: filterOptions ? 'loaded' : 'not loaded',
    data: data ? `${data.issues?.length || 0} issues` : 'no data',
    loading,
    error,
    activeFiltersCount,
    hasActiveFilters,
  });

  // Processar dados para cada gráfico
  const processedData = useMemo(() => {
    if (!data?.issues) return null;

    console.log('🔄 Processing data for charts:', {
      issuesCount: data.issues.length,
      hasActiveFilters,
    });

    // Processar dados de usuários
    const userStats = data.issues.reduce((acc: any, issue: any) => {
      const assignee = issue.fields.assignee;
      if (!assignee) return acc;

      const userId = assignee.accountId;
      if (!acc[userId]) {
        acc[userId] = {
          name: assignee.displayName,
          email: assignee.emailAddress,
          avatar: assignee.avatarUrls?.['24x24'],
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          overdueIssues: 0,
        };
      }

      acc[userId].totalIssues++;
      const status = issue.fields.status.name.toLowerCase();
      if (
        status.includes('concluído') ||
        status.includes('done') ||
        status.includes('closed')
      ) {
        acc[userId].completedIssues++;
      } else if (status.includes('andamento') || status.includes('progress')) {
        acc[userId].inProgressIssues++;
      }

      // Verificar se está atrasada (simplificado)
      const dueDate = issue.fields.duedate;
      if (dueDate && new Date(dueDate) < new Date()) {
        acc[userId].overdueIssues++;
      }

      return acc;
    }, {});

    // Processar dados de projetos
    const projectStats = data.issues.reduce((acc: any, issue: any) => {
      const project = issue.fields.project;
      const projectKey = project.key;

      if (!acc[projectKey]) {
        acc[projectKey] = {
          key: projectKey,
          name: project.name,
          description: project.description,
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          overdueIssues: 0,
          teamSize: 0,
          lastActivity: new Date(issue.fields.updated).toLocaleDateString(
            'pt-BR'
          ),
        };
      }

      acc[projectKey].totalIssues++;
      const status = issue.fields.status.name.toLowerCase();
      if (
        status.includes('concluído') ||
        status.includes('done') ||
        status.includes('closed')
      ) {
        acc[projectKey].completedIssues++;
      } else if (status.includes('andamento') || status.includes('progress')) {
        acc[projectKey].inProgressIssues++;
      }

      // Verificar se está atrasada
      const dueDate = issue.fields.duedate;
      if (dueDate && new Date(dueDate) < new Date()) {
        acc[projectKey].overdueIssues++;
      }

      return acc;
    }, {});

    // Calcular métricas de performance para usuários
    const usersWithMetrics = Object.values(userStats).map((user: any) => ({
      ...user,
      velocity: Math.floor(Math.random() * 20) + 10, // Mock velocity
      efficiency: Math.floor(Math.random() * 30) + 70, // Mock efficiency
    }));

    // Calcular métricas de saúde para projetos
    const projectsWithHealth = Object.values(projectStats).map(
      (project: any) => {
        const completionRate =
          project.totalIssues > 0
            ? (project.completedIssues / project.totalIssues) * 100
            : 0;
        const overdueRate =
          project.totalIssues > 0
            ? (project.overdueIssues / project.totalIssues) * 100
            : 0;

        let health = 'excellent';
        if (overdueRate > 20) health = 'critical';
        else if (overdueRate > 10) health = 'warning';
        else if (completionRate < 50) health = 'good';

        return {
          ...project,
          health,
          teamSize: Math.floor(Math.random() * 8) + 2, // Mock team size
        };
      }
    );

    return {
      burndown: processBurndownData(data.issues),
      statusDistribution: processStatusData(data.issues),
      velocity: processVelocityData(data.issues),
      issueTypes: processIssueTypeData(data.issues),
      timeline: processTimelineData(data.issues),
      priorityByStatus: processPriorityByStatus(data.issues),
      users: usersWithMetrics,
      projects: projectsWithHealth,
    };
  }, [data, hasActiveFilters]);

  return (
    <Layout
      onRefresh={() => window.location.reload()}
      isRefreshing={loading}
      lastUpdated={new Date()}
    >
      <div className="max-w-7xl mx-auto">
        {/* Barra de Filtros */}
        <FilterBar
          filters={filters}
          filterOptions={filterOptions}
          updateFilter={updateFilter}
          clearAllFilters={clearAllFilters}
          activeFiltersCount={activeFiltersCount}
          loading={loading}
        />

        {/* Indicador de Segurança */}
        {data && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              isSecure
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isSecure ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <h3
                className={`font-semibold ${
                  isSecure ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {isSecure ? '🔒 Dados Seguros' : '⚠️ Dados Não Filtrados'}
              </h3>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isSecure
                ? `Apenas dados dos projetos acessíveis estão sendo exibidos (${accessInfo.userProjects.join(
                    ', '
                  )})`
                : 'Dados de projetos inacessíveis podem estar sendo exibidos'}
            </div>
            {!isSecure && (
              <div className="mt-2 text-sm text-red-700">
                <strong>Problema detectado:</strong> O sistema não conseguiu
                filtrar adequadamente os dados por acesso do usuário.
              </div>
            )}
          </div>
        )}

        {/* Configuração de Projetos */}
        <ProjectConfiguration />

        {/* Acesso do Usuário aos Projetos */}
        {data && data.issues && (
          <div className="mb-6 space-y-4">
            <UserProjectAccess issues={data.issues} />
            <DataFilteringDiagnostic issues={data.issues} />
            <ProjectFilteringDebug issues={data.issues} />
            <ProjectAccessTestPanel issues={data.issues} />
            <AutomaticProjectDiscovery
              discoveryInfo={discoveryInfo}
              isDiscovering={isDiscovering}
              onForceRediscovery={forceRediscovery}
            />
          </div>
        )}

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
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && data && data.issues.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma issue encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Ajuste os filtros para encontrar issues ou aguarde o
                carregamento dos dados.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !data && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Carregando dados...
              </h3>
              <p className="text-gray-600 mb-4">
                Aguarde enquanto buscamos os dados do Jira.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            </div>
          </div>
        )}

        {/* KPIs Avançados */}
        {processedData && data && (
          <>
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AdvancedMetricsCard
                title="Total Issues"
                value={data.issues.length}
                icon={<CheckCircle className="w-5 h-5" />}
                color="blue"
                description="Total de issues no sistema"
                subMetrics={[
                  {
                    label: 'Concluídas',
                    value:
                      processedData.statusDistribution.find(s =>
                        s.name.includes('Concluído')
                      )?.value || 0,
                    color: '#10b981',
                  },
                  {
                    label: 'Em Andamento',
                    value:
                      processedData.statusDistribution.find(s =>
                        s.name.includes('andamento')
                      )?.value || 0,
                    color: '#f59e0b',
                  },
                ]}
                loading={loading}
              />

              <AdvancedMetricsCard
                title="Projetos Ativos"
                value={processedData.projects.length}
                icon={<FolderOpen className="w-5 h-5" />}
                color="green"
                description="Projetos com atividade recente"
                subMetrics={[
                  {
                    label: 'Excelente',
                    value: processedData.projects.filter(
                      (p: any) => p.health === 'excellent'
                    ).length,
                    color: '#10b981',
                  },
                  {
                    label: 'Atenção',
                    value: processedData.projects.filter(
                      (p: any) => p.health === 'warning'
                    ).length,
                    color: '#f59e0b',
                  },
                ]}
                loading={loading}
              />

              <AdvancedMetricsCard
                title="Usuários Ativos"
                value={processedData.users.length}
                icon={<Users className="w-5 h-5" />}
                color="purple"
                description="Membros da equipe com issues"
                subMetrics={[
                  {
                    label: 'Alta Performance',
                    value: processedData.users.filter(
                      (u: any) => u.efficiency > 80
                    ).length,
                    color: '#8b5cf6',
                  },
                  {
                    label: 'Média Performance',
                    value: processedData.users.filter(
                      (u: any) => u.efficiency <= 80
                    ).length,
                    color: '#6b7280',
                  },
                ]}
                loading={loading}
              />

              <AdvancedMetricsCard
                title="Filtros Ativos"
                value={activeFiltersCount}
                icon={<TrendingUp className="w-5 h-5" />}
                color="indigo"
                description="Filtros aplicados no momento"
                loading={loading}
              />
            </div>

            {/* Cards de Usuários */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Performance da Equipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedData.users.map((user: any, index: number) => (
                  <UserCard
                    key={user.email || index}
                    user={user}
                    loading={loading}
                    onClick={() => handleUserClick(user)}
                  />
                ))}
              </div>
            </div>

            {/* Cards de Projetos */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                Status dos Projetos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedData.projects.map((project: any, index: number) => (
                  <ProjectCard
                    key={project.key || index}
                    project={project}
                    loading={loading}
                  />
                ))}
              </div>
            </div>

            {/* Grid de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <BurndownChart data={processedData.burndown} />
              <IssuesByStatusChart data={processedData.statusDistribution} />
              <VelocityChart data={processedData.velocity} />
              <IssuesByTypeChart data={processedData.issueTypes} />
            </div>

            {/* Gráficos de largura completa */}
            <div className="space-y-6">
              {/* Timeline Chart - implementar se necessário */}
              {/* PriorityByStatus Chart - implementar se necessário */}
            </div>
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-700 font-medium">
                Carregando dados do Jira...
              </p>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Usuário */}
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            issues={data?.issues || []}
            isOpen={isUserModalOpen}
            onClose={handleCloseUserModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default OptimizedDashboard;

import React, { useState } from 'react';
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
} from 'lucide-react';

const AgileDashboard: React.FC = () => {
  const { isAuthenticated, credentials } = useAuth();
  const { data, loading, error } = useJiraFilters();
  const [activeTab, setActiveTab] = useState<'daily' | 'velocity' | 'alerts'>(
    'daily'
  );

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
  const processedData = {
    issues: data?.issues || [],
    users: [], // Será processado pelos componentes individuais
    sprints: [], // Será processado pelos componentes individuais
  };

  const tabs = [
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
                Ferramentas avançadas para gestão ágil e Dailys
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
              <Badge variant="outline" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                {processedData.issues.length} Issues
              </Badge>
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
                            ? `border-${tab.color}-500 text-${tab.color}-600`
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

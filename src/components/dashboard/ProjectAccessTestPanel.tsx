import React, { useState, useEffect } from 'react';
import { JiraIssue } from '../../types/jira.types';
import { projectAccessService } from '../../services/projectAccessService';
import { useJiraApi } from '../../hooks/useJiraApi';
import { EnhancedProjectAccessValidation } from './EnhancedProjectAccessValidation';

interface ProjectAccessTestPanelProps {
  issues: JiraIssue[];
}

export const ProjectAccessTestPanel: React.FC<ProjectAccessTestPanelProps> = ({
  issues,
}) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [discoveryInfo, setDiscoveryInfo] = useState<any>(null);
  const jiraApi = useJiraApi();

  const runAccessTests = async () => {
    setIsTesting(true);

    try {
      console.log('🧪 Starting Project Access Tests...');

      // Test 1: Verificar inicialização do serviço
      const isInitialized = projectAccessService.isInitialized();
      const userEmail = projectAccessService.getUserEmail();
      const userProjects = projectAccessService.getUserProjects();
      const discoveryInfo = projectAccessService.getDiscoveryInfo();

      // Test 2: Verificar filtragem de issues
      const filteredIssues =
        projectAccessService.filterIssuesByUserAccess(issues);

      // Test 3: Análise de projetos
      const allProjectKeys = [
        ...new Set(issues.map((issue : any) => issue.fields.project.key)),
      ];
      const accessibleProjects = allProjectKeys.filter((key : any) =>
        projectAccessService.hasAccessToProject(key)
      );
      const inaccessibleProjects = allProjectKeys.filter(
        key => !projectAccessService.hasAccessToProject(key)
      );

      // Test 4: Validação de dados
      const validation = projectAccessService.validateDataFiltering(issues);

      // Test 5: Estatísticas de acesso
      const accessStats = projectAccessService.getAccessStats(issues);

      const results = {
        serviceStatus: {
          isInitialized,
          userEmail,
          userProjects,
          discoveryInfo,
        },
        filtering: {
          originalCount: issues.length,
          filteredCount: filteredIssues.length,
          removedCount: issues.length - filteredIssues.length,
        },
        projects: {
          all: allProjectKeys,
          accessible: accessibleProjects,
          inaccessible: inaccessibleProjects,
        },
        validation,
        accessStats,
        timestamp: new Date().toISOString(),
      };

      setTestResults(results);
      setDiscoveryInfo(discoveryInfo);

      console.log('🧪 Project Access Tests completed:', results);
    } catch (error) {
      console.error('❌ Error running access tests:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const forceRediscovery = async () => {
    try {
      console.log('🔄 Forcing project rediscovery...');
      await projectAccessService.forceRediscovery(
        'anderson.nasario@superlogica.com',
        jiraApi
      );
      await runAccessTests();
    } catch (error) {
      console.error('❌ Error forcing rediscovery:', error);
    }
  };

  useEffect(() => {
    if (issues && issues.length > 0) {
      runAccessTests();
    }
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🧪 Painel de Teste de Acesso a Projetos
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={runAccessTests}
              disabled={isTesting}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isTesting ? 'Testando...' : 'Executar Testes'}
            </button>
            <button
              onClick={forceRediscovery}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
            >
              Forçar Redescoberta
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Este painel testa e valida o sistema de controle de acesso a projetos.
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          {/* Status do Serviço */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              🔧 Status do Serviço
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inicializado:</span>
                  <span
                    className={`text-sm font-medium ${
                      testResults.serviceStatus.isInitialized
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {testResults.serviceStatus.isInitialized
                      ? '✅ Sim'
                      : '❌ Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">
                    {testResults.serviceStatus.userEmail || 'Não definido'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projetos:</span>
                  <span className="text-sm font-medium">
                    {testResults.serviceStatus.userProjects.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Projetos Configurados:
                </div>
                <div className="flex flex-wrap gap-1">
                  {testResults.serviceStatus.userProjects.map(
                    (project: string) => (
                      <span
                        key={project}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {project}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resultados da Filtragem */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              📊 Resultados da Filtragem
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {testResults.filtering.originalCount}
                </div>
                <div className="text-sm text-gray-600">Total de Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filtering.filteredCount}
                </div>
                <div className="text-sm text-gray-600">Issues Acessíveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filtering.removedCount}
                </div>
                <div className="text-sm text-gray-600">Issues Filtradas</div>
              </div>
            </div>
          </div>

          {/* Análise de Projetos */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              🏗️ Análise de Projetos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-700 mb-2">
                  ✅ Projetos Acessíveis
                </h5>
                <div className="space-y-1">
                  {testResults.projects.accessible.length > 0 ? (
                    testResults.projects.accessible.map((project: string) => (
                      <div
                        key={project}
                        className="flex justify-between items-center bg-green-50 px-2 py-1 rounded"
                      >
                        <span className="text-sm font-medium">{project}</span>
                        <span className="text-xs text-green-600">
                          {
                            issues.filter(
                              issue => issue.fields.project.key === project
                            ).length
                          }{' '}
                          issues
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      Nenhum projeto acessível
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-red-700 mb-2">
                  ❌ Projetos Inacessíveis
                </h5>
                <div className="space-y-1">
                  {testResults.projects.inaccessible.length > 0 ? (
                    testResults.projects.inaccessible.map((project: string) => (
                      <div
                        key={project}
                        className="flex justify-between items-center bg-red-50 px-2 py-1 rounded"
                      >
                        <span className="text-sm font-medium">{project}</span>
                        <span className="text-xs text-red-600">
                          {
                            issues.filter(
                              issue => issue.fields.project.key === project
                            ).length
                          }{' '}
                          issues
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      Nenhum projeto inacessível
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Descoberta */}
          {discoveryInfo && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                🔍 Informações da Descoberta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Método:</span>
                    <span className="text-sm font-medium">
                      {discoveryInfo.discoveryMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Encontrados:
                    </span>
                    <span className="text-sm font-medium">
                      {discoveryInfo.totalProjectsFound}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Acessíveis:</span>
                    <span className="text-sm font-medium">
                      {discoveryInfo.accessibleProjectsCount}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Timestamp:</div>
                  <div className="text-sm font-medium">
                    {new Date(
                      discoveryInfo.discoveryTimestamp
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validação Avançada */}
          <EnhancedProjectAccessValidation issues={issues} />
        </div>
      )}
    </div>
  );
};








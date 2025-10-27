import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Bug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Users,
  FolderOpen,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { projectAccessService } from '../../services/projectAccessService';
import { JiraIssue } from '../../types/jira.types';

interface ProjectFilteringDebugProps {
  issues: JiraIssue[];
  className?: string;
}

const ProjectFilteringDebug: React.FC<ProjectFilteringDebugProps> = ({
  issues,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    serviceStatus: {
      isInitialized: false,
      userEmail: null as string | null,
      userProjects: [] as string[],
    },
    filteringResults: {
      originalCount: 0,
      filteredCount: 0,
      filteredOutCount: 0,
    },
    projectAnalysis: {
      allProjects: [] as string[],
      accessibleProjects: [] as string[],
      inaccessibleProjects: [] as string[],
    },
    issuesByProject: {} as Record<string, number>,
    usersByProject: {} as Record<string, string[]>,
  });

  useEffect(() => {
    if (issues.length > 0) {
      // Status do serviço
      const serviceStatus = {
        isInitialized: projectAccessService.isInitialized(),
        userEmail: projectAccessService.getUserEmail(),
        userProjects: projectAccessService.getUserProjects(),
      };

      // Resultados da filtragem
      const filteredIssues =
        projectAccessService.filterIssuesByUserAccess(issues);
      const filteringResults = {
        originalCount: issues.length,
        filteredCount: filteredIssues.length,
        filteredOutCount: issues.length - filteredIssues.length,
      };

      // Análise de projetos
      const allProjectKeys = [
        ...new Set(issues.map(issue => issue.fields.project.key)),
      ];
      const accessibleProjects = allProjectKeys.filter(key =>
        projectAccessService.hasAccessToProject(key)
      );
      const inaccessibleProjects = allProjectKeys.filter(
        key => !projectAccessService.hasAccessToProject(key)
      );

      const projectAnalysis = {
        allProjects: allProjectKeys,
        accessibleProjects,
        inaccessibleProjects,
      };

      // Contar issues por projeto
      const issuesByProject = issues.reduce((acc, issue) => {
        const projectKey = issue.fields.project.key;
        acc[projectKey] = (acc[projectKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Analisar usuários por projeto
      const usersByProject = issues.reduce((acc, issue) => {
        const projectKey = issue.fields.project.key;
        const assignee = issue.fields.assignee;
        if (assignee && assignee.displayName) {
          if (!acc[projectKey]) acc[projectKey] = [];
          if (!acc[projectKey].includes(assignee.displayName)) {
            acc[projectKey].push(assignee.displayName);
          }
        }
        return acc;
      }, {} as Record<string, string[]>);

      setDebugInfo({
        serviceStatus,
        filteringResults,
        projectAnalysis,
        issuesByProject,
        usersByProject,
      });

      console.log('🐛 ProjectFilteringDebug - Complete Analysis:', {
        serviceStatus,
        filteringResults,
        projectAnalysis,
        issuesByProject,
        usersByProject,
      });
    }
  }, [issues]);

  const getServiceStatus = () => {
    if (!debugInfo.serviceStatus.isInitialized) {
      return {
        status: 'not-initialized',
        color: 'text-red-600',
        icon: XCircle,
      };
    }

    if (debugInfo.serviceStatus.userProjects.length === 0) {
      return {
        status: 'no-projects',
        color: 'text-yellow-600',
        icon: AlertTriangle,
      };
    }

    return { status: 'ready', color: 'text-green-600', icon: CheckCircle };
  };

  const getFilteringStatus = () => {
    if (debugInfo.filteringResults.originalCount === 0) {
      return { status: 'no-data', color: 'text-gray-600', icon: Info };
    }

    if (debugInfo.filteringResults.filteredOutCount === 0) {
      return {
        status: 'no-filtering',
        color: 'text-yellow-600',
        icon: AlertTriangle,
      };
    }

    if (debugInfo.filteringResults.filteredCount === 0) {
      return { status: 'all-filtered', color: 'text-red-600', icon: XCircle };
    }

    return {
      status: 'filtering-working',
      color: 'text-green-600',
      icon: CheckCircle,
    };
  };

  const serviceStatus = getServiceStatus();
  const filteringStatus = getFilteringStatus();
  const ServiceIcon = serviceStatus.icon;
  const FilteringIcon = filteringStatus.icon;

  return (
    <Card className={`${className} ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bug className="w-5 h-5 text-purple-600" />
            <span>Debug de Filtragem de Projetos</span>
            <div className="flex space-x-2">
              <Badge className={`${serviceStatus.color} bg-white`}>
                <ServiceIcon className="w-3 h-3 mr-1" />
                Serviço:{' '}
                {serviceStatus.status === 'ready'
                  ? 'OK'
                  : serviceStatus.status === 'no-projects'
                  ? 'Sem Projetos'
                  : 'Não Inicializado'}
              </Badge>
              <Badge className={`${filteringStatus.color} bg-white`}>
                <FilteringIcon className="w-3 h-3 mr-1" />
                Filtragem:{' '}
                {filteringStatus.status === 'filtering-working'
                  ? 'OK'
                  : filteringStatus.status === 'no-filtering'
                  ? 'Não Aplicada'
                  : filteringStatus.status === 'all-filtered'
                  ? 'Tudo Filtrado'
                  : 'Sem Dados'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {debugInfo.filteringResults.filteredCount}/
              {debugInfo.filteringResults.originalCount} issues
            </span>
            {isExpanded ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent className="space-y-6">
            {/* Status do Serviço */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Status do Serviço de Acesso
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {debugInfo.serviceStatus.isInitialized ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-blue-600">Inicializado</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {debugInfo.serviceStatus.userEmail || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-600">Usuário</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {debugInfo.serviceStatus.userProjects.length}
                  </div>
                  <div className="text-sm text-blue-600">
                    Projetos Configurados
                  </div>
                </div>
              </div>
              {debugInfo.serviceStatus.userProjects.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-blue-600 font-medium">
                    Projetos Acessíveis:
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {debugInfo.serviceStatus.userProjects.map(project => (
                      <Badge
                        key={project}
                        className="bg-blue-100 text-blue-800"
                      >
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resultados da Filtragem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {debugInfo.filteringResults.originalCount}
                </div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {debugInfo.filteringResults.filteredCount}
                </div>
                <div className="text-sm text-green-600">Issues Acessíveis</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {debugInfo.filteringResults.filteredOutCount}
                </div>
                <div className="text-sm text-red-600">Issues Filtradas</div>
              </div>
            </div>

            {/* Análise por Projeto */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FolderOpen className="w-4 h-4 mr-2" />
                Análise Detalhada por Projeto
              </h4>
              <div className="space-y-3">
                {Object.entries(debugInfo.issuesByProject).map(
                  ([projectKey, issueCount]) => {
                    const hasAccess =
                      projectAccessService.hasAccessToProject(projectKey);
                    const users = debugInfo.usersByProject[projectKey] || [];

                    return (
                      <div
                        key={projectKey}
                        className={`p-4 rounded-lg border ${
                          hasAccess
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-lg">
                            {projectKey}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                hasAccess
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {hasAccess ? '✅ Acessível' : '❌ Inacessível'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {issueCount} issues
                            </span>
                          </div>
                        </div>
                        {users.length > 0 && (
                          <div className="text-sm text-gray-500">
                            <div className="font-medium mb-1">
                              Usuários ({users.length}):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {users.map(user => (
                                <Badge
                                  key={user}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {user}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Resumo dos Problemas */}
            {debugInfo.filteringResults.filteredOutCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Problemas Identificados
                </h4>
                <ul className="space-y-1">
                  <li className="text-sm text-yellow-700">
                    • {debugInfo.filteringResults.filteredOutCount} issues de
                    projetos inacessíveis sendo exibidas
                  </li>
                  <li className="text-sm text-yellow-700">
                    • Projetos inacessíveis:{' '}
                    {debugInfo.projectAnalysis.inaccessibleProjects.join(', ')}
                  </li>
                  <li className="text-sm text-yellow-700">
                    • Projetos acessíveis esperados:{' '}
                    {debugInfo.serviceStatus.userProjects.join(', ')}
                  </li>
                </ul>
              </div>
            )}

            {/* Ações de Debug */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log(
                    '🐛 ProjectFilteringDebug - Manual Debug:',
                    debugInfo
                  );
                }}
              >
                <Bug className="w-4 h-4 mr-2" />
                Log Debug
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar
              </Button>
            </div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default ProjectFilteringDebug;








import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Database,
  Users,
  FolderOpen,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { projectAccessService } from '../../services/projectAccessService';
import { JiraIssue } from '../../types/jira.types';

interface DataFilteringDiagnosticProps {
  issues: JiraIssue[];
  className?: string;
}

const DataFilteringDiagnostic: React.FC<DataFilteringDiagnosticProps> = ({
  issues,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState({
    validation: null as any,
    userProjects: [] as string[],
    allProjects: [] as string[],
    issuesByProject: {} as Record<string, number>,
    usersByProject: {} as Record<string, string[]>,
  });

  useEffect(() => {
    if (issues.length > 0) {
      const validation = projectAccessService.validateDataFiltering(issues);
      const userProjects = projectAccessService.getUserProjects();

      // Analisar projetos presentes nos dados
      const allProjectKeys = [
        ...new Set(issues.map(issue => issue.fields.project.key)),
      ];

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

      setDiagnosticData({
        validation,
        userProjects,
        allProjects: allProjectKeys,
        issuesByProject,
        usersByProject,
      });

      console.log('🔍 DataFilteringDiagnostic - Detailed Analysis:', {
        validation,
        userProjects,
        allProjects: allProjectKeys,
        issuesByProject,
        usersByProject,
      });
    }
  }, [issues]);

  const getValidationStatus = () => {
    if (!diagnosticData.validation)
      return { status: 'unknown', color: 'text-gray-600', icon: Info };

    if (diagnosticData.validation.isValid) {
      return { status: 'valid', color: 'text-green-600', icon: CheckCircle };
    }

    return { status: 'invalid', color: 'text-red-600', icon: XCircle };
  };

  const validationStatus = getValidationStatus();
  const StatusIcon = validationStatus.icon;

  return (
    <Card className={`${className} ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Diagnóstico de Filtragem de Dados</span>
            <Badge className={`${validationStatus.color} bg-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {validationStatus.status === 'valid'
                ? 'Válido'
                : validationStatus.status === 'invalid'
                ? 'Inconsistente'
                : 'Analisando'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {diagnosticData.validation?.issues?.accessible || 0}/
              {diagnosticData.validation?.issues?.total || 0} issues
            </span>
            {isExpanded ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && diagnosticData.validation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent className="space-y-6">
            {/* Status de Validação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {diagnosticData.validation.issues.total}
                </div>
                <div className="text-sm text-blue-600">Total Issues</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {diagnosticData.validation.issues.accessible}
                </div>
                <div className="text-sm text-green-600">Acessíveis</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {diagnosticData.validation.issues.inaccessible}
                </div>
                <div className="text-sm text-red-600">Inacessíveis</div>
              </div>
            </div>

            {/* Projetos Acessíveis vs Inacessíveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Projetos Acessíveis (
                  {diagnosticData.validation.projects.accessible.length})
                </h4>
                <div className="space-y-2">
                  {diagnosticData.validation.projects.accessible.map(
                    projectKey => (
                      <div
                        key={projectKey}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{projectKey}</span>
                          <div className="text-sm text-gray-600">
                            {diagnosticData.issuesByProject[projectKey] || 0}{' '}
                            issues
                          </div>
                        </div>
                        {diagnosticData.usersByProject[projectKey] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Usuários:{' '}
                            {diagnosticData.usersByProject[projectKey].length}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Projetos Inacessíveis (
                  {diagnosticData.validation.projects.inaccessible.length})
                </h4>
                <div className="space-y-2">
                  {diagnosticData.validation.projects.inaccessible.map(
                    projectKey => (
                      <div
                        key={projectKey}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{projectKey}</span>
                          <div className="text-sm text-gray-600">
                            {diagnosticData.issuesByProject[projectKey] || 0}{' '}
                            issues
                          </div>
                        </div>
                        {diagnosticData.usersByProject[projectKey] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Usuários:{' '}
                            {diagnosticData.usersByProject[projectKey].length}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Recomendações */}
            {diagnosticData.validation.recommendations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Recomendações de Correção
                </h4>
                <ul className="space-y-1">
                  {diagnosticData.validation.recommendations.map(
                    (recommendation, index) => (
                      <li
                        key={index}
                        className="text-sm text-yellow-700 flex items-start"
                      >
                        <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Análise Detalhada por Projeto */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análise Detalhada por Projeto
              </h4>
              <div className="space-y-3">
                {Object.entries(diagnosticData.issuesByProject).map(
                  ([projectKey, issueCount]) => {
                    const hasAccess =
                      projectAccessService.hasAccessToProject(projectKey);
                    const users =
                      diagnosticData.usersByProject[projectKey] || [];

                    return (
                      <div
                        key={projectKey}
                        className={`p-3 rounded-lg border ${
                          hasAccess
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{projectKey}</span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                hasAccess
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {hasAccess ? 'Acessível' : 'Inacessível'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {issueCount} issues
                            </span>
                          </div>
                        </div>
                        {users.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Usuários: {users.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Informações de Configuração */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Configuração Atual
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Usuário:</span>
                  <span className="font-medium">
                    {projectAccessService.getUserEmail()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projetos Configurados:</span>
                  <span className="font-medium">
                    {diagnosticData.userProjects.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projetos Encontrados:</span>
                  <span className="font-medium">
                    {diagnosticData.allProjects.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge
                    className={
                      diagnosticData.validation.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {diagnosticData.validation.isValid
                      ? 'Filtragem Correta'
                      : 'Filtragem Incorreta'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default DataFilteringDiagnostic;









import React, { useState, useEffect } from 'react';
import { JiraIssue } from '../../types/jira.types';
import { projectAccessService } from '../../services/projectAccessService';

interface EnhancedProjectAccessValidationProps {
  issues: JiraIssue[];
}

interface ValidationResult {
  isValid: boolean;
  issues: {
    total: number;
    accessible: number;
    inaccessible: number;
  };
  projects: {
    accessible: string[];
    inaccessible: string[];
    all: string[];
  };
  recommendations: string[];
  criticalIssues: string[];
}

export const EnhancedProjectAccessValidation: React.FC<
  EnhancedProjectAccessValidationProps
> = ({ issues }) => {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (issues && issues.length > 0) {
      validateAccess();
    }
  }, [issues]);

  const validateAccess = async () => {
    setIsValidating(true);

    try {
      // Análise completa dos dados
      const allProjectKeys = [
        ...new Set(issues.map((issue : any) => issue.fields.project.key)),
      ];
      const accessibleProjectKeys = allProjectKeys.filter((key : any) =>
        projectAccessService.hasAccessToProject(key)
      );
      const inaccessibleProjectKeys = allProjectKeys.filter(
        key => !projectAccessService.hasAccessToProject(key)
      );

      // Contagem de issues por projeto
      const issuesByProject = issues.reduce((acc, issue) => {
        const projectKey = issue.fields.project.key;
        acc[projectKey] = (acc[projectKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Issues acessíveis vs inacessíveis
      const accessibleIssues = issues.filter((issue : any) =>
        projectAccessService.hasAccessToProject(issue.fields.project.key)
      );
      const inaccessibleIssues = issues.filter(
        issue =>
          !projectAccessService.hasAccessToProject(issue.fields.project.key)
      );

      // Análise crítica
      const criticalIssues: string[] = [];
      const recommendations: string[] = [];

      // Verificar se há projetos inacessíveis sendo exibidos
      if (inaccessibleProjectKeys.length > 0) {
        criticalIssues.push(
          `Projetos inacessíveis sendo exibidos: ${inaccessibleProjectKeys.join(
            ', '
          )}`
        );
        recommendations.push(
          `Remover dados dos projetos: ${inaccessibleProjectKeys.join(', ')}`
        );
      }

      // Verificar se todos os projetos acessíveis estão sendo exibidos
      const userProjects = projectAccessService.getUserProjects();
      const missingProjects = userProjects.filter(
        key => !accessibleProjectKeys.includes(key)
      );
      if (missingProjects.length > 0) {
        criticalIssues.push(
          `Projetos acessíveis não encontrados: ${missingProjects.join(', ')}`
        );
        recommendations.push(
          `Verificar se os projetos ${missingProjects.join(', ')} têm issues`
        );
      }

      // Verificar consistência de dados
      if (inaccessibleIssues.length > 0) {
        criticalIssues.push(
          `${inaccessibleIssues.length} issues de projetos inacessíveis`
        );
        recommendations.push(
          `Filtrar ${inaccessibleIssues.length} issues inacessíveis`
        );
      }

      // Verificar se o serviço está inicializado
      if (!projectAccessService.isInitialized()) {
        criticalIssues.push('Serviço de acesso não inicializado');
        recommendations.push('Inicializar serviço de acesso a projetos');
      }

      // Verificar se há projetos configurados
      if (userProjects.length === 0) {
        criticalIssues.push('Nenhum projeto configurado para o usuário');
        recommendations.push('Configurar projetos acessíveis para o usuário');
      }

      const result: ValidationResult = {
        isValid: criticalIssues.length === 0,
        issues: {
          total: issues.length,
          accessible: accessibleIssues.length,
          inaccessible: inaccessibleIssues.length,
        },
        projects: {
          accessible: accessibleProjectKeys,
          inaccessible: inaccessibleProjectKeys,
          all: allProjectKeys,
        },
        recommendations,
        criticalIssues,
      };

      setValidationResult(result);
    } catch (error) {
      console.error('❌ Error validating access:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-600 font-medium">
            Validando acesso aos projetos...
          </span>
        </div>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Status Geral */}
      <div
        className={`p-4 rounded-lg border ${
          validationResult.isValid
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${
              validationResult.isValid ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <h3
            className={`font-semibold ${
              validationResult.isValid ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {validationResult.isValid
              ? '✅ Validação Aprovada'
              : '❌ Validação Falhou'}
          </h3>
        </div>

        <div className="text-sm text-gray-600">
          {validationResult.isValid
            ? 'Todos os dados estão sendo filtrados corretamente'
            : 'Problemas encontrados na filtragem de dados'}
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Issues */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Issues</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">
                {validationResult.issues.total}
              </span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Acessíveis:</span>
              <span className="font-medium">
                {validationResult.issues.accessible}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Inacessíveis:</span>
              <span className="font-medium">
                {validationResult.issues.inaccessible}
              </span>
            </div>
          </div>
        </div>

        {/* Projetos */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Projetos</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">
                {validationResult.projects.all.length}
              </span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Acessíveis:</span>
              <span className="font-medium">
                {validationResult.projects.accessible.length}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Inacessíveis:</span>
              <span className="font-medium">
                {validationResult.projects.inaccessible.length}
              </span>
            </div>
          </div>
        </div>

        {/* Status do Serviço */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Serviço</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Inicializado:</span>
              <span
                className={`font-medium ${
                  projectAccessService.isInitialized()
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {projectAccessService.isInitialized() ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Projetos Config:</span>
              <span className="font-medium">
                {projectAccessService.getUserProjects().length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium text-xs truncate">
                {projectAccessService.getUserEmail() || 'Não definido'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problemas Críticos */}
      {validationResult.criticalIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">
            🚨 Problemas Críticos
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {validationResult.criticalIssues.map((issue, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-500">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendações */}
      {validationResult.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            💡 Recomendações
          </h4>
          <ul className="space-y-1 text-sm text-yellow-700">
            {validationResult.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detalhes dos Projetos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">
          📊 Análise por Projeto
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projetos Acessíveis */}
          <div>
            <h5 className="font-medium text-green-700 mb-2">
              ✅ Projetos Acessíveis
            </h5>
            <div className="space-y-1 text-sm">
              {validationResult.projects.accessible.length > 0 ? (
                validationResult.projects.accessible.map((projectKey : any) => (
                  <div
                    key={projectKey}
                    className="flex justify-between items-center bg-green-50 px-2 py-1 rounded"
                  >
                    <span className="font-medium">{projectKey}</span>
                    <span className="text-green-600 text-xs">
                      {
                        issues.filter(
                          issue => issue.fields.project.key === projectKey
                        ).length
                      }{' '}
                      issues
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  Nenhum projeto acessível encontrado
                </div>
              )}
            </div>
          </div>

          {/* Projetos Inacessíveis */}
          <div>
            <h5 className="font-medium text-red-700 mb-2">
              ❌ Projetos Inacessíveis
            </h5>
            <div className="space-y-1 text-sm">
              {validationResult.projects.inaccessible.length > 0 ? (
                validationResult.projects.inaccessible.map((projectKey : any) => (
                  <div
                    key={projectKey}
                    className="flex justify-between items-center bg-red-50 px-2 py-1 rounded"
                  >
                    <span className="font-medium">{projectKey}</span>
                    <span className="text-red-600 text-xs">
                      {
                        issues.filter(
                          issue => issue.fields.project.key === projectKey
                        ).length
                      }{' '}
                      issues
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  Nenhum projeto inacessível encontrado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};








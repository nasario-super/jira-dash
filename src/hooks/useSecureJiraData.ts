import { useState, useEffect, useCallback } from 'react';
import { useJiraFilters } from './useJiraFilters';
import { projectAccessService } from '../services/projectAccessService';

interface SecureJiraDataReturn {
  data: any;
  loading: boolean;
  error: string | null;
  isSecure: boolean;
  accessInfo: {
    isInitialized: boolean;
    userProjects: string[];
    userEmail: string;
  };
}

/**
 * Hook que garante que os dados do Jira sejam filtrados por acesso do usuário
 * antes de serem exibidos no dashboard
 */
export const useSecureJiraData = (): SecureJiraDataReturn => {
  const { data: rawData, loading, error } = useJiraFilters();
  // Desabilitar useProjectAccess para evitar descoberta automática
  // const {
  //   isReady: projectAccessReady,
  //   userProjects,
  //   userEmail,
  //   isInitialized,
  // } = useProjectAccess();

  // Usar diretamente o projectAccessService
  const projectAccessReady = projectAccessService.isInitialized();
  const userProjects = projectAccessService.getUserProjects();
  const userEmail = projectAccessService.getUserEmail();
  const isInitialized = projectAccessService.isInitialized();
  const [secureData, setSecureData] = useState<any>(null);
  const [isSecure, setIsSecure] = useState(false);

  // Função para validar dados (sem filtragem - o JQL já filtrou!)
  const validateSecurityFilter = useCallback((data: any) => {
    console.log(
      '🔐 useSecureJiraData - Validating data security (no filtering - JQL already filtered)...'
    );

    if (!data || !data.issues) {
      console.warn('🔐 useSecureJiraData - No data to validate');
      return null;
    }

    // Verificar se o serviço de acesso está pronto
    if (!projectAccessService.isInitialized()) {
      console.warn(
        '🔐 useSecureJiraData - Project access service not initialized'
      );
      return null;
    }

    // Validar que todos os projetos nos dados são acessíveis (NÃO filtrar)
    const allProjects = [
      ...new Set(data.issues.map((issue: any) => issue.fields.project.key)),
    ];
    const accessibleProjects = allProjects.filter(key =>
      projectAccessService.hasAccessToProject(key)
    );
    const inaccessibleProjects = allProjects.filter(
      key => !projectAccessService.hasAccessToProject(key)
    );

    console.log('🔐 useSecureJiraData - Data validation result:', {
      totalIssues: data.issues.length,
      allProjects,
      accessibleProjects,
      inaccessibleProjects,
      userProjects: projectAccessService.getUserProjects(),
      isSecure: inaccessibleProjects.length === 0,
    });

    // Se há projetos inacessíveis, é um problema crítico
    if (inaccessibleProjects.length > 0) {
      console.error(
        '🚨 CRITICAL: Inaccessible projects found in JQL result:',
        inaccessibleProjects
      );
    }

    // Retornar dados SEM modificação (já foram filtrados pelo JQL)
    return data;
  }, []);

  // Aplicar filtragem quando os dados mudarem
  useEffect(() => {
    console.log('🔐 useSecureJiraData - Effect triggered:', {
      hasRawData: !!rawData,
      projectAccessReady,
      rawDataIssues: rawData?.issues?.length || 0,
      userProjects: projectAccessService.getUserProjects(),
      isInitialized: projectAccessService.isInitialized(),
    });

    if (rawData && projectAccessReady) {
      console.log(
        '🔐 useSecureJiraData - Data received, applying security filter...'
      );
      const filteredData = validateSecurityFilter(rawData);
      console.log('🔐 useSecureJiraData - Security filter result:', {
        originalCount: rawData.issues?.length || 0,
        filteredCount: filteredData?.issues?.length || 0,
        isSecure: filteredData !== null,
      });
      setSecureData(filteredData);
      setIsSecure(filteredData !== null);
    } else if (rawData && !projectAccessReady) {
      console.log(
        '🔐 useSecureJiraData - Data received but project access not ready, waiting...'
      );
      setSecureData(null);
      setIsSecure(false);
    } else {
      console.log('🔐 useSecureJiraData - No data or not ready, clearing...');
      setSecureData(null);
      setIsSecure(false);
    }
  }, [rawData, projectAccessReady, validateSecurityFilter]);

  // Verificar se há dados inacessíveis sendo exibidos
  useEffect(() => {
    if (secureData && secureData.issues && secureData.issues.length > 0) {
      const allProjectKeys = [
        ...new Set(
          secureData.issues.map((issue: any) => issue.fields.project.key)
        ),
      ];
      const inaccessibleProjects = allProjectKeys.filter(
        key => !projectAccessService.hasAccessToProject(key)
      );

      if (inaccessibleProjects.length > 0) {
        console.error(
          '🚨 CRITICAL SECURITY ISSUE: Inaccessible projects found in filtered data:',
          inaccessibleProjects
        );
        setIsSecure(false);
      } else {
        console.log('✅ Security check passed: All projects are accessible');
        setIsSecure(true);
      }
    } else if (secureData) {
      console.log('✅ No issues in data - data is secure');
      setIsSecure(true);
    }
  }, [secureData]);

  return {
    data: secureData,
    loading: loading || !projectAccessReady,
    error:
      error ||
      (!projectAccessReady
        ? 'Aguardando inicialização do controle de acesso...'
        : null),
    isSecure,
    accessInfo: {
      isInitialized,
      userProjects,
      userEmail,
    },
  };
};

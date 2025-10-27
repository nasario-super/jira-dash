import { useEffect, useState } from 'react';
import { projectAccessService } from '../services/projectAccessService';
import { useJiraApi } from './useJiraApi';
import { UserAccessDiscovery } from '../services/userProjectDiscovery';

interface UseProjectAccessReturn {
  isInitialized: boolean;
  userEmail: string | null;
  userProjects: string[];
  isReady: boolean;
  isDiscovering: boolean;
  discoveryInfo: UserAccessDiscovery | null;
  forceRediscovery: () => Promise<void>;
}

/**
 * Hook para gerenciar o acesso do usuário aos projetos
 * Garante que o serviço seja inicializado antes de qualquer busca de dados
 * Usa descoberta automática para identificar projetos acessíveis
 */
export const useProjectAccess = (): UseProjectAccessReturn => {
  const jiraApi = useJiraApi();
  const [isInitialized, setIsInitialized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryInfo, setDiscoveryInfo] =
    useState<UserAccessDiscovery | null>(null);

  useEffect(() => {
    const initializeProjectAccess = async () => {
      console.log('🔐 useProjectAccess - Checking project access status...');

      // Obter email do usuário logado (você pode adaptar isso para sua lógica de autenticação)
      const currentUserEmail = 'anderson.nasario@superlogica.com'; // TODO: Obter do contexto de auth

      // Verificar se já há projetos configurados (seleção manual)
      const isAlreadyInitialized = projectAccessService.isInitialized();
      const existingProjects = projectAccessService.getUserProjects();

      if (isAlreadyInitialized && existingProjects.length > 0) {
        console.log(
          '🔐 useProjectAccess - Projects already configured manually, skipping discovery'
        );
        console.log(
          '🔐 useProjectAccess - Existing projects:',
          existingProjects
        );
        console.log(
          '🔐 useProjectAccess - Manual selection detected, preventing automatic discovery'
        );

        setIsInitialized(true);
        setUserEmail(projectAccessService.getUserEmail());
        setUserProjects(existingProjects);
        setIsReady(true);
        setIsDiscovering(false);
        setDiscoveryInfo(null); // Não há descoberta automática
        return;
      }

      // Verificar se é seleção manual (não executar descoberta automática)
      if (projectAccessService.isManualSelection()) {
        console.log(
          '🔐 useProjectAccess - Manual selection detected, preventing automatic discovery'
        );
        setIsInitialized(true);
        setUserEmail(projectAccessService.getUserEmail());
        setUserProjects(projectAccessService.getUserProjects());
        setIsReady(true);
        setIsDiscovering(false);
        setDiscoveryInfo(null);
        return;
      }

      console.log(
        '🔐 useProjectAccess - No manual selection found, but automatic discovery is disabled'
      );
      console.log(
        '🔐 useProjectAccess - User must select projects manually through the project selection screen'
      );

      // Não executar descoberta automática - usuário deve selecionar manualmente
      setIsInitialized(false);
      setUserEmail(null);
      setUserProjects([]);
      setIsReady(false);
      setIsDiscovering(false);
      setDiscoveryInfo(null);
      return;
    };

    initializeProjectAccess();
  }, [jiraApi]);

  const forceRediscovery = async () => {
    const currentUserEmail = 'anderson.nasario@superlogica.com'; // TODO: Obter do contexto de auth
    console.log('🔐 useProjectAccess - Forcing rediscovery...');
    setIsDiscovering(true);

    try {
      // Limpar configuração manual antes de redescobrir
      projectAccessService.initializeUserProjects('', []);

      await projectAccessService.forceRediscovery(currentUserEmail, jiraApi);

      const initialized = projectAccessService.isInitialized();
      const email = projectAccessService.getUserEmail();
      const projects = projectAccessService.getUserProjects();
      const discovery = projectAccessService.getDiscoveryInfo();

      setIsInitialized(initialized);
      setUserEmail(email);
      setUserProjects(projects);
      setDiscoveryInfo(discovery);
      setIsReady(initialized && projects.length > 0);
    } catch (error) {
      console.error('🔐 useProjectAccess - Force rediscovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  return {
    isInitialized,
    userEmail,
    userProjects,
    isReady,
    isDiscovering,
    discoveryInfo,
    forceRediscovery,
  };
};

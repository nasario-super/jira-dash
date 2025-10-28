import { useState, useEffect } from 'react';
import { projectAccessService } from '../services/projectAccessService';

interface ProjectSelectionState {
  isSelectionRequired: boolean;
  hasSelectedProjects: boolean;
  selectedProjects: string[];
  isInitialized: boolean;
}

/**
 * Hook para gerenciar o estado de seleção de projetos
 * Verifica se o usuário precisa selecionar projetos ou se já tem projetos configurados
 */
export const useProjectSelection = () => {
  const [state, setState] = useState<ProjectSelectionState>({
    isSelectionRequired: false,
    hasSelectedProjects: false,
    selectedProjects: [],
    isInitialized: false,
  });

  useEffect(() => {
    checkProjectSelectionStatus();
  }, []);

  const checkProjectSelectionStatus = () => {
    console.log('🔍 Checking project selection status...');

    // Verificar se o serviço de acesso está inicializado
    const isInitialized = projectAccessService.isInitialized();
    const userProjects = projectAccessService.getUserProjects();
    const userEmail = projectAccessService.getUserEmail();

    console.log('🔍 Project selection status:', {
      isInitialized,
      userProjects,
      userEmail,
      projectCount: userProjects.length,
      isManualSelection: projectAccessService.isManualSelection(),
    });

    // Verificar se há projetos selecionados manualmente
    const hasManualSelection =
      isInitialized &&
      projectAccessService.isManualSelection() &&
      userProjects.length > 0;
    const isSelectionRequired = !hasManualSelection;
    const hasSelectedProjects = hasManualSelection;

    setState({
      isSelectionRequired,
      hasSelectedProjects,
      selectedProjects: userProjects,
      isInitialized,
    });

    console.log('🔍 Selection status determined:', {
      isSelectionRequired,
      hasSelectedProjects,
      selectedProjects: userProjects,
      hasManualSelection,
    });
  };

  const setSelectedProjects = (projects: string[]) => {
    console.log('✅ Setting selected projects:', projects);

    // Limpar descoberta automática e configurar seleção manual
    projectAccessService.initializeUserProjects(
      'anderson.nasario@superlogica.com', // TODO: Obter do contexto de auth
      projects
    );

    // Atualizar estado
    setState(prev => ({
      ...prev,
      isSelectionRequired: false,
      hasSelectedProjects: true,
      selectedProjects: projects,
      isInitialized: true,
    }));

    console.log('✅ Manual project selection completed, discovery disabled');
  };

  const clearProjectSelection = () => {
    console.log('🗑️ Clearing project selection...');

    // Limpar configuração do serviço
    projectAccessService.initializeUserProjects('', []);

    // Atualizar estado
    setState({
      isSelectionRequired: true,
      hasSelectedProjects: false,
      selectedProjects: [],
      isInitialized: false,
    });
  };

  const skipProjectSelection = () => {
    console.log('⏭️ Skipping project selection...');

    // Usar configuração padrão (projetos conhecidos)
    const defaultProjects = ['INFOSECC', 'SEGP'];
    setSelectedProjects(defaultProjects);
  };

  return {
    ...state,
    setSelectedProjects,
    clearProjectSelection,
    skipProjectSelection,
    refreshStatus: checkProjectSelectionStatus,
  };
};




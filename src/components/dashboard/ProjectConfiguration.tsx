import React, { useState } from 'react';
import { useProjectSelection } from '../../hooks/useProjectSelection';
import { projectAccessService } from '../../services/projectAccessService';
import { Settings, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const ProjectConfiguration: React.FC = () => {
  const {
    hasSelectedProjects,
    selectedProjects,
    clearProjectSelection,
    refreshStatus,
  } = useProjectSelection();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log(
        '🔄 ProjectConfiguration - Refreshing status without triggering discovery...'
      );
      // Apenas atualizar o status, não executar descoberta automática
      refreshStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearSelection = () => {
    if (
      confirm(
        'Tem certeza que deseja limpar a seleção de projetos? Isso irá reiniciar o processo de seleção.'
      )
    ) {
      clearProjectSelection();
    }
  };

  const isInitialized = projectAccessService.isInitialized();
  const userProjects = projectAccessService.getUserProjects();
  const userEmail = projectAccessService.getUserEmail();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Configuração de Projetos
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Status do Serviço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              isInitialized ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isInitialized ? '✅' : '❌'}
          </div>
          <div className="text-sm text-gray-600">Serviço</div>
          <div className="text-xs text-gray-500">
            {isInitialized ? 'Inicializado' : 'Não Inicializado'}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {userProjects.length}
          </div>
          <div className="text-sm text-gray-600">Projetos</div>
          <div className="text-xs text-gray-500">Configurados</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {hasSelectedProjects ? '✅' : '❌'}
          </div>
          <div className="text-sm text-gray-600">Seleção</div>
          <div className="text-xs text-gray-500">
            {hasSelectedProjects ? 'Completa' : 'Pendente'}
          </div>
        </div>
      </div>

      {/* Informações Detalhadas */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Email do Usuário:</span>
          <span className="text-sm font-medium text-gray-900">
            {userEmail || 'Não definido'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Projetos Selecionados:</span>
          <div className="flex flex-wrap gap-1">
            {userProjects.length > 0 ? (
              userProjects.map(project => (
                <span
                  key={project}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {project}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Nenhum</span>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      {hasSelectedProjects && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Projetos configurados com sucesso</span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Limpar Seleção
            </button>
          </div>
        </div>
      )}

      {!hasSelectedProjects && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-yellow-600">
            <AlertCircle className="w-4 h-4" />
            <span>
              Nenhum projeto selecionado. Reinicie o processo de seleção.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};



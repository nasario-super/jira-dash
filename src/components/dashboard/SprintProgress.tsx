import React from 'react';
import { SprintData } from '../../types/jira.types';
import { getSprintProgress } from '../../utils/dateHelpers';

interface SprintProgressProps {
  sprint: SprintData;
  loading?: boolean;
}

const SprintProgress: React.FC<SprintProgressProps> = ({ sprint, loading = false }) => {
  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Progresso da Sprint</h3>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-3 w-32"></div>
      </div>
    );
  }

  const progress = getSprintProgress(sprint);
  const isActive = sprint.state === 'active';
  const isCompleted = sprint.state === 'closed';

  const getProgressColor = () => {
    if (isCompleted) return 'bg-success';
    if (progress >= 80) return 'bg-warning';
    if (progress >= 50) return 'bg-primary';
    return 'bg-danger';
  };

  const getStatusBadge = () => {
    switch (sprint.state) {
      case 'active':
        return <span className="badge badge-success">Ativa</span>;
      case 'closed':
        return <span className="badge badge-gray">Concluída</span>;
      case 'future':
        return <span className="badge badge-info">Futura</span>;
      default:
        return <span className="badge badge-gray">{sprint.state}</span>;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Progresso da Sprint</h3>
        {getStatusBadge()}
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">{sprint.name}</h4>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Início: {new Date(sprint.startDate).toLocaleDateString('pt-BR')}</span>
          <span>Fim: {new Date(sprint.endDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Progresso</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      </div>

      {isActive && (
        <div className="text-sm text-gray-600">
          <p>
            {progress < 50 && 'Sprint em início'}
            {progress >= 50 && progress < 80 && 'Sprint em andamento'}
            {progress >= 80 && progress < 100 && 'Sprint próxima do fim'}
            {progress >= 100 && 'Sprint atrasada'}
          </p>
        </div>
      )}

      {isCompleted && sprint.completeDate && (
        <div className="text-sm text-gray-600">
          <p>Concluída em: {new Date(sprint.completeDate).toLocaleDateString('pt-BR')}</p>
        </div>
      )}
    </div>
  );
};

export default SprintProgress;


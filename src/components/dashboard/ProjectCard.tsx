import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  FolderOpen,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface ProjectCardProps {
  project: {
    key: string;
    name: string;
    description?: string;
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    overdueIssues: number;
    teamSize: number;
    lastActivity: string;
    health: 'excellent' | 'good' | 'warning' | 'critical';
  };
  loading?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate =
    project.totalIssues > 0
      ? (project.completedIssues / project.totalIssues) * 100
      : 0;
  const overdueRate =
    project.totalIssues > 0
      ? (project.overdueIssues / project.totalIssues) * 100
      : 0;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🔵';
      case 'warning':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {project.key}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-gray-900">
                {project.name}
              </CardTitle>
              <p className="text-xs text-gray-500">{project.key}</p>
            </div>
          </div>
          <Badge className={`text-xs ${getHealthColor(project.health)}`}>
            {getHealthIcon(project.health)} {project.health.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição do projeto */}
        {project.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {project.totalIssues}
            </div>
            <div className="text-xs text-gray-500">Total Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project.completedIssues}
            </div>
            <div className="text-xs text-gray-500">Concluídas</div>
          </div>
        </div>

        {/* Progresso de conclusão */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Progresso</span>
            <span className="font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1">
          {project.inProgressIssues > 0 && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {project.inProgressIssues} Em andamento
            </Badge>
          )}
          {project.overdueIssues > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {project.overdueIssues} Atrasadas
            </Badge>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-gray-600 mb-1">
              <Users className="w-3 h-3 mr-1" />
              Equipe
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {project.teamSize}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Última Atividade</div>
            <div className="text-sm font-medium text-gray-800">
              {project.lastActivity}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface UserCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    overdueIssues: number;
    velocity: number;
    efficiency: number;
  };
  loading?: boolean;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, loading = false, onClick }) => {
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
    user.totalIssues > 0 ? (user.completedIssues / user.totalIssues) * 100 : 0;
  const overdueRate =
    user.totalIssues > 0 ? (user.overdueIssues / user.totalIssues) * 100 : 0;

  return (
    <Card 
      className={`h-full hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              {user.name}
            </CardTitle>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {user.totalIssues}
            </div>
            <div className="text-xs text-gray-500">Total Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {user.completedIssues}
            </div>
            <div className="text-xs text-gray-500">Concluídas</div>
          </div>
        </div>

        {/* Progresso de conclusão */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Taxa de Conclusão</span>
            <span className="font-medium">{completionRate.toFixed(1)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1">
          {user.inProgressIssues > 0 && (
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {user.inProgressIssues} Em andamento
            </Badge>
          )}
          {user.overdueIssues > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              {user.overdueIssues} Atrasadas
            </Badge>
          )}
          {user.completedIssues > 0 && (
            <Badge
              variant="default"
              className="text-xs bg-green-100 text-green-800"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {user.completedIssues} Concluídas
            </Badge>
          )}
        </div>

        {/* Métricas de performance */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-gray-600 mb-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Velocity
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {user.velocity}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Eficiência</div>
            <div className="text-lg font-semibold text-orange-600">
              {user.efficiency}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;

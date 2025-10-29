import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Users,
  Database,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { projectAccessService } from '../../services/projectAccessService';
import { JiraIssue } from '../../types/jira.types';

interface UserProjectAccessProps {
  issues: JiraIssue[];
  className?: string;
}

const UserProjectAccess: React.FC<UserProjectAccessProps> = ({
  issues,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [accessStats, setAccessStats] = useState({
    totalIssues: 0,
    accessibleIssues: 0,
    inaccessibleIssues: 0,
    accessibleProjects: [] as string[],
    inaccessibleProjects: [] as string[],
  });

  useEffect(() => {
    if (issues.length > 0) {
      const stats = projectAccessService.getAccessStats(issues);
      setAccessStats(stats);

      // Validar se os dados estão sendo filtrados corretamente
      const validation = projectAccessService.validateDataFiltering(issues);
      console.log('🔐 UserProjectAccess - Data Validation:', validation);

      if (!validation.isValid) {
        console.warn('🔐 UserProjectAccess - Data filtering issues detected:', {
          recommendations: validation.recommendations,
          projects: validation.projects,
          issues: validation.issues,
        });
      }
    }
  }, [issues]);

  const getProjectStatus = (projectKey: string) => {
    const hasAccess = projectAccessService.hasAccessToProject(projectKey);
    return {
      hasAccess,
      icon: hasAccess ? CheckCircle : XCircle,
      color: hasAccess ? 'text-green-600' : 'text-red-600',
      bgColor: hasAccess ? 'bg-green-50' : 'bg-red-50',
      borderColor: hasAccess ? 'border-green-200' : 'border-red-200',
    };
  };

  const getAccessLevel = () => {
    const accessiblePercentage =
      accessStats.totalIssues > 0
        ? (accessStats.accessibleIssues / accessStats.totalIssues) * 100
        : 0;

    if (accessiblePercentage >= 90)
      return { level: 'Completo', color: 'text-green-600', icon: CheckCircle };
    if (accessiblePercentage >= 70)
      return { level: 'Bom', color: 'text-blue-600', icon: Info };
    if (accessiblePercentage >= 50)
      return {
        level: 'Parcial',
        color: 'text-yellow-600',
        icon: AlertTriangle,
      };
    return { level: 'Limitado', color: 'text-red-600', icon: XCircle };
  };

  const accessLevel = getAccessLevel();
  const AccessIcon = accessLevel.icon;

  return (
    <Card className={`${className} ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Acesso do Usuário aos Projetos</span>
            <Badge className={`${accessLevel.color} bg-white`}>
              <AccessIcon className="w-3 h-3 mr-1" />
              {accessLevel.level}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {accessStats.accessibleIssues}/{accessStats.totalIssues} issues
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
          <CardContent className="space-y-4">
            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {accessStats.accessibleIssues}
                </div>
                <div className="text-sm text-green-600">Acessíveis</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {accessStats.inaccessibleIssues}
                </div>
                <div className="text-sm text-red-600">Inacessíveis</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {accessStats.totalIssues}
                </div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>

            {/* Projetos Acessíveis */}
            {accessStats.accessibleProjects.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Projetos Acessíveis ({accessStats.accessibleProjects.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {accessStats.accessibleProjects.map((projectKey : any) => {
                    const status = getProjectStatus(projectKey);
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={projectKey}
                        className={`p-3 rounded-lg border ${status.bgColor} ${status.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{projectKey}</span>
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projetos Inacessíveis */}
            {accessStats.inaccessibleProjects.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Projetos Inacessíveis (
                  {accessStats.inaccessibleProjects.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {accessStats.inaccessibleProjects.map((projectKey : any) => {
                    const status = getProjectStatus(projectKey);
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={projectKey}
                        className={`p-3 rounded-lg border ${status.bgColor} ${status.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{projectKey}</span>
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Informações do Usuário */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Informações do Usuário
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">
                    {projectAccessService.getUserEmail()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projetos Configurados:</span>
                  <span className="font-medium">
                    {projectAccessService.getUserProjects().join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {projectAccessService.isInitialized()
                      ? 'Configurado'
                      : 'Não Configurado'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Aviso sobre Filtragem */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Filtragem Automática Ativa
                  </h4>
                  <p className="text-sm text-yellow-700">
                    A ferramenta está configurada para exibir apenas dados dos
                    projetos aos quais você tem acesso. Issues de projetos
                    inacessíveis são automaticamente filtradas para proteger
                    informações sensíveis.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default UserProjectAccess;

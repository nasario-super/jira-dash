import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Users,
  FolderOpen,
  Eye,
  EyeOff,
  Info,
  Clock,
  Zap,
} from 'lucide-react';
import { UserAccessDiscovery } from '../../services/userProjectDiscovery';

interface AutomaticProjectDiscoveryProps {
  discoveryInfo: UserAccessDiscovery | null;
  isDiscovering: boolean;
  onForceRediscovery: () => Promise<void>;
  className?: string;
}

const AutomaticProjectDiscovery: React.FC<AutomaticProjectDiscoveryProps> = ({
  discoveryInfo,
  isDiscovering,
  onForceRediscovery,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDiscoveryStatus = () => {
    if (isDiscovering) {
      return { status: 'discovering', color: 'text-blue-600', icon: Search };
    }

    if (!discoveryInfo) {
      return { status: 'not-started', color: 'text-gray-600', icon: Info };
    }

    if (discoveryInfo.accessibleProjectsCount === 0) {
      return { status: 'no-projects', color: 'text-red-600', icon: XCircle };
    }

    return { status: 'success', color: 'text-green-600', icon: CheckCircle };
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'jql':
        return 'bg-green-100 text-green-800';
      case 'projects':
        return 'bg-blue-100 text-blue-800';
      case 'boards':
        return 'bg-purple-100 text-purple-800';
      case 'fallback':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'jql':
        return 'Descoberta via JQL (mais preciso)';
      case 'projects':
        return 'Descoberta via API de Projetos';
      case 'boards':
        return 'Descoberta via API de Boards';
      case 'fallback':
        return 'Método de fallback (projetos comuns)';
      default:
        return 'Método desconhecido';
    }
  };

  const discoveryStatus = getDiscoveryStatus();
  const StatusIcon = discoveryStatus.icon;

  return (
    <Card className={`${className} ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Descoberta Automática de Projetos</span>
            <Badge className={`${discoveryStatus.color} bg-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {discoveryStatus.status === 'discovering'
                ? 'Descobrindo...'
                : discoveryStatus.status === 'success'
                ? 'Sucesso'
                : discoveryStatus.status === 'no-projects'
                ? 'Sem Projetos'
                : 'Não Iniciado'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {discoveryInfo && (
              <span className="text-sm text-gray-500">
                {discoveryInfo.accessibleProjectsCount}/
                {discoveryInfo.totalProjectsFound} projetos
              </span>
            )}
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
          <CardContent className="space-y-6">
            {/* Status da Descoberta */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-3 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Status da Descoberta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {discoveryInfo?.totalProjectsFound || 0}
                  </div>
                  <div className="text-sm text-blue-600">
                    Projetos Encontrados
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {discoveryInfo?.accessibleProjectsCount || 0}
                  </div>
                  <div className="text-sm text-green-600">
                    Projetos Acessíveis
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {discoveryInfo?.discoveryMethod || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-600">Método Usado</div>
                </div>
              </div>
            </div>

            {/* Informações do Método */}
            {discoveryInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Método de Descoberta
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Método:</span>
                  <Badge
                    className={getMethodBadgeColor(
                      discoveryInfo.discoveryMethod
                    )}
                  >
                    {discoveryInfo.discoveryMethod.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {getMethodDescription(discoveryInfo.discoveryMethod)}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Descoberto em:</span>
                  <span>
                    {discoveryInfo.discoveryTimestamp.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Projetos Descobertos */}
            {discoveryInfo && discoveryInfo.accessibleProjects.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Projetos Descobertos (
                  {discoveryInfo.accessibleProjects.length})
                </h4>
                <div className="space-y-3">
                  {discoveryInfo.accessibleProjects.map(project => (
                    <div
                      key={project.key}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={project.avatarUrls['16x16']}
                            alt={project.name}
                            className="w-4 h-4"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="font-medium">{project.key}</span>
                          <span className="text-sm text-gray-600">
                            {project.name}
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          ✅ Acessível
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Tipo: {project.projectTypeKey}
                        {project.projectCategory && (
                          <span className="ml-2">
                            • Categoria: {project.projectCategory.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status de Descoberta */}
            {isDiscovering && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <div>
                    <div className="font-semibold text-blue-800">
                      Descobrindo Projetos...
                    </div>
                    <div className="text-sm text-blue-600">
                      Analisando acesso do usuário aos projetos do Jira
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sem Projetos Encontrados */}
            {discoveryInfo && discoveryInfo.accessibleProjectsCount === 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-semibold text-red-800">
                      Nenhum Projeto Encontrado
                    </div>
                    <div className="text-sm text-red-600">
                      O usuário não tem acesso a nenhum projeto ou houve um erro
                      na descoberta
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onForceRediscovery}
                disabled={isDiscovering}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isDiscovering ? 'animate-spin' : ''
                  }`}
                />
                {isDiscovering ? 'Descobrindo...' : 'Forçar Nova Descoberta'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log(
                    '🔍 AutomaticProjectDiscovery - Discovery Info:',
                    discoveryInfo
                  );
                }}
              >
                <Info className="w-4 h-4 mr-2" />
                Log Debug
              </Button>
            </div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default AutomaticProjectDiscovery;









import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  BarChart3,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface UserDetailModalProps {
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
  issues: any[];
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  issues,
  isOpen,
  onClose,
}) => {
  const [expandedProjects, setExpandedProjects] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  const userIssues = issues.filter(
    issue =>
      issue.fields.assignee?.accountId === user.email?.split('@')[0] ||
      issue.fields.assignee?.displayName === user.name
  );

  const completionRate =
    user.totalIssues > 0 ? (user.completedIssues / user.totalIssues) * 100 : 0;
  const overdueRate =
    user.totalIssues > 0 ? (user.overdueIssues / user.totalIssues) * 100 : 0;

  // Agrupar issues por status
  const issuesByStatus = userIssues.reduce((acc: any, issue: any) => {
    const status = issue.fields.status.name;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(issue);
    return acc;
  }, {});

  // Agrupar issues por projeto
  const issuesByProject = userIssues.reduce((acc: any, issue: any) => {
    const project = issue.fields.project.key;
    if (!acc[project]) {
      acc[project] = {
        name: issue.fields.project.name,
        issues: [],
      };
    }
    acc[project].issues.push(issue);
    return acc;
  }, {});

  // Calcular métricas de tempo
  const recentIssues = userIssues.filter((issue : any) => {
    const updated = new Date(issue.fields.updated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated > weekAgo;
  }).length;

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('concluído') || statusLower.includes('done'))
      return 'bg-green-100 text-green-800';
    if (statusLower.includes('andamento') || statusLower.includes('progress'))
      return 'bg-blue-100 text-blue-800';
    if (statusLower.includes('pendente') || statusLower.includes('pending'))
      return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('cancelado') || statusLower.includes('cancelled'))
      return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('highest') || priorityLower.includes('crítica'))
      return 'bg-red-100 text-red-800';
    if (priorityLower.includes('high') || priorityLower.includes('alta'))
      return 'bg-orange-100 text-orange-800';
    if (priorityLower.includes('medium') || priorityLower.includes('média'))
      return 'bg-yellow-100 text-yellow-800';
    if (priorityLower.includes('low') || priorityLower.includes('baixa'))
      return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const toggleProjectExpand = (projectKey: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectKey]: !prev[projectKey],
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
            <div className="flex items-center space-x-4">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.totalIssues}
                  </div>
                  <div className="text-sm text-gray-500">Total Issues</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.completedIssues}
                  </div>
                  <div className="text-sm text-gray-500">Concluídas</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.velocity}
                  </div>
                  <div className="text-sm text-gray-500">Velocity</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {user.efficiency}%
                  </div>
                  <div className="text-sm text-gray-500">Eficiência</div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso e Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Taxa de Conclusão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">
                        {completionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {user.completedIssues} de {user.totalIssues} issues
                      concluídas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-indigo-600">
                      {recentIssues}
                    </div>
                    <div className="text-sm text-gray-500">
                      Issues atualizadas na última semana
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {user.inProgressIssues} Em andamento
                      </Badge>
                      {user.overdueIssues > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {user.overdueIssues} Atrasadas
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues por Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Issues por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(issuesByStatus).map(
                    ([status, statusIssues]: [string, any]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`text-xs ${getStatusColor(status)}`}
                          >
                            {status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {(statusIssues as any[]).length} issues
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {(
                            ((statusIssues as any[]).length /
                              userIssues.length) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Issues por Projeto - COM TODOS OS DETALHES */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Issues por Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(issuesByProject).map(
                    ([projectKey, projectData]: [string, any]) => (
                      <div key={projectKey} className="border rounded-lg">
                        {/* Header do Projeto - Expansível */}
                        <button
                          onClick={() => toggleProjectExpand(projectKey)}
                          className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              [{projectKey}] {projectData.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {projectData.issues.length} issues
                            </Badge>
                          </div>
                          {expandedProjects[projectKey] ? (
                            <ChevronUp size={18} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-500" />
                          )}
                        </button>

                        {/* Issues Detalhados - Expandível */}
                        {expandedProjects[projectKey] && (
                          <div className="p-3 space-y-2 bg-white border-t">
                            {projectData.issues.map((issue: any) => (
                              <button
                                key={issue.key}
                                onClick={() => setSelectedIssue(issue)}
                                className="w-full flex items-center justify-between text-sm p-2 bg-gray-50 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors border border-transparent cursor-pointer"
                              >
                                <div className="flex items-center space-x-2 flex-1 text-left">
                                  <span className="font-mono text-xs font-bold text-blue-600">
                                    {issue.key}
                                  </span>
                                  <span className="text-gray-700 flex-1">
                                    {issue.fields.summary}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <Badge
                                    className={`text-xs whitespace-nowrap ${getStatusColor(
                                      issue.fields.status.name
                                    )}`}
                                  >
                                    {issue.fields.status.name}
                                  </Badge>
                                  <Badge
                                    className={`text-xs whitespace-nowrap ${getPriorityColor(
                                      issue.fields.priority.name
                                    )}`}
                                  >
                                    {issue.fields.priority.name}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal de Detalhes da Issue */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
            onClick={() => setSelectedIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header da Issue */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-start justify-between z-10">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-lg font-bold">
                      {selectedIssue.key}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-white text-blue-700"
                    >
                      {selectedIssue.fields.issuetype.name}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {selectedIssue.fields.summary}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIssue(null)}
                  className="text-white hover:bg-blue-600"
                >
                  <X size={24} />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informações Principais */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Status
                    </label>
                    <Badge
                      className={`inline-block ${getStatusColor(
                        selectedIssue.fields.status.name
                      )}`}
                    >
                      {selectedIssue.fields.status.name}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Prioridade
                    </label>
                    <Badge
                      className={`inline-block ${getPriorityColor(
                        selectedIssue.fields.priority.name
                      )}`}
                    >
                      {selectedIssue.fields.priority.name}
                    </Badge>
                  </div>
                </div>

                {/* Detalhes da Issue */}
                <div className="space-y-4">
                  {/* Projeto */}
                  <div className="flex items-start space-x-3">
                    <Tag className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">
                        Projeto
                      </label>
                      <p className="text-gray-900">
                        {selectedIssue.fields.project.name} (
                        {selectedIssue.fields.project.key})
                      </p>
                    </div>
                  </div>

                  {/* Assignado */}
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">
                        Atribuído a
                      </label>
                      <p className="text-gray-900">
                        {selectedIssue.fields.assignee?.displayName || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Criador */}
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">
                        Criado por
                      </label>
                      <p className="text-gray-900">
                        {selectedIssue.fields.creator?.displayName || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Criado em
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(selectedIssue.fields.created)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Atualizado em
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(selectedIssue.fields.updated)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data de Vencimento */}
                {selectedIssue.fields.duedate && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Data de Vencimento
                    </label>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-900">
                        {formatDate(selectedIssue.fields.duedate)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Descrição */}
                {selectedIssue.fields.description && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Descrição
                    </label>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {selectedIssue.fields.description}
                    </div>
                  </div>
                )}

                {/* Labels */}
                {selectedIssue.fields.labels &&
                  selectedIssue.fields.labels.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Labels
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedIssue.fields.labels.map((label: string) => (
                          <Badge key={label} variant="outline">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default UserDetailModal;

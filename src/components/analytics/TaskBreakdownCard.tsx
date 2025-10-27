import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Target,
  Users,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import { motion } from 'framer-motion';

interface TaskBreakdownCardProps {
  issues: JiraIssue[];
  loading?: boolean;
}

interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  averageResolutionTime: number;
  averageComplexity: number;
  topPerformers: Array<{
    assignee: string;
    completedTasks: number;
    averageTime: number;
  }>;
  taskTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  statusFlow: Array<{
    status: string;
    count: number;
    averageTime: number;
  }>;
}

const TaskBreakdownCard: React.FC<TaskBreakdownCardProps> = ({
  issues,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'types' | 'timeline'>('overview');

  const taskMetrics = useMemo((): TaskMetrics => {
    if (!issues || issues.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        overdueTasks: 0,
        averageResolutionTime: 0,
        averageComplexity: 0,
        topPerformers: [],
        taskTypes: [],
        priorityDistribution: [],
        statusFlow: [],
      };
    }

    const now = new Date();
    const completedTasks = issues.filter(issue => 
      issue.fields.status.statusCategory.name === 'Done'
    );
    
    const inProgressTasks = issues.filter(issue => 
      issue.fields.status.statusCategory.name === 'In Progress'
    );
    
    const blockedTasks = issues.filter(issue => 
      issue.fields.status.name.toLowerCase().includes('blocked') ||
      issue.fields.status.name.toLowerCase().includes('impediment')
    );
    
    const overdueTasks = issues.filter(issue => {
      const dueDate = issue.fields.duedate;
      return dueDate && new Date(dueDate) < now && 
             issue.fields.status.statusCategory.name !== 'Done';
    });

    // Calcular tempo médio de resolução
    const resolvedIssues = issues.filter(issue => 
      issue.fields.status.statusCategory.name === 'Done' &&
      issue.fields.resolutiondate
    );
    
    const averageResolutionTime = resolvedIssues.length > 0 
      ? resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.fields.created);
          const resolved = new Date(issue.fields.resolutiondate!);
          return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedIssues.length
      : 0;

    // Calcular complexidade média baseada no tamanho do summary
    const averageComplexity = issues.reduce((sum, issue) => {
      const summaryLength = issue.fields.summary.length;
      return sum + (summaryLength > 50 ? 3 : summaryLength > 20 ? 2 : 1);
    }, 0) / issues.length;

    // Top performers por assignee
    const assigneeStats = new Map<string, { completed: number; totalTime: number }>();
    resolvedIssues.forEach(issue => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      const created = new Date(issue.fields.created);
      const resolved = new Date(issue.fields.resolutiondate!);
      const resolutionTime = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      
      if (!assigneeStats.has(assignee)) {
        assigneeStats.set(assignee, { completed: 0, totalTime: 0 });
      }
      const stats = assigneeStats.get(assignee)!;
      stats.completed++;
      stats.totalTime += resolutionTime;
    });

    const topPerformers = Array.from(assigneeStats.entries())
      .map(([assignee, stats]) => ({
        assignee,
        completedTasks: stats.completed,
        averageTime: stats.totalTime / stats.completed,
      }))
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 5);

    // Distribuição por tipo de task
    const typeStats = new Map<string, number>();
    issues.forEach(issue => {
      const type = issue.fields.issuetype.name;
      typeStats.set(type, (typeStats.get(type) || 0) + 1);
    });

    const taskTypes = Array.from(typeStats.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / issues.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Distribuição por prioridade
    const priorityStats = new Map<string, number>();
    issues.forEach(issue => {
      const priority = issue.fields.priority.name;
      priorityStats.set(priority, (priorityStats.get(priority) || 0) + 1);
    });

    const priorityDistribution = Array.from(priorityStats.entries())
      .map(([priority, count]) => ({
        priority,
        count,
        percentage: (count / issues.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Status flow
    const statusStats = new Map<string, { count: number; totalTime: number }>();
    issues.forEach(issue => {
      const status = issue.fields.status.name;
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      const timeInStatus = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      
      if (!statusStats.has(status)) {
        statusStats.set(status, { count: 0, totalTime: 0 });
      }
      const stats = statusStats.get(status)!;
      stats.count++;
      stats.totalTime += timeInStatus;
    });

    const statusFlow = Array.from(statusStats.entries())
      .map(([status, stats]) => ({
        status,
        count: stats.count,
        averageTime: stats.totalTime / stats.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTasks: issues.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      blockedTasks: blockedTasks.length,
      overdueTasks: overdueTasks.length,
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
      averageComplexity: Math.round(averageComplexity * 10) / 10,
      topPerformers,
      taskTypes,
      priorityDistribution,
      statusFlow,
    };
  }, [issues]);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('done') || statusLower.includes('completed')) return 'text-green-600';
    if (statusLower.includes('progress') || statusLower.includes('andamento')) return 'text-blue-600';
    if (statusLower.includes('blocked') || statusLower.includes('impediment')) return 'text-red-600';
    if (statusLower.includes('todo') || statusLower.includes('open')) return 'text-gray-600';
    return 'text-yellow-600';
  };

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes('highest') || priorityLower.includes('critical')) return 'text-red-600';
    if (priorityLower.includes('high')) return 'text-orange-600';
    if (priorityLower.includes('medium')) return 'text-yellow-600';
    if (priorityLower.includes('low')) return 'text-green-600';
    return 'text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('story')) return '📖';
    if (typeLower.includes('task')) return '📋';
    if (typeLower.includes('bug')) return '🐛';
    if (typeLower.includes('epic')) return '🎯';
    if (typeLower.includes('subtask')) return '📝';
    return '📄';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Análise Detalhada de Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span>Análise Detalhada de Tasks</span>
        </CardTitle>
        <div className="flex space-x-2 mt-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'types', label: 'Tipos', icon: Target },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-1"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {taskMetrics.totalTasks}
                    </div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-green-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {taskMetrics.completedTasks}
                    </div>
                    <div className="text-sm text-gray-600">Concluídas</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {taskMetrics.inProgressTasks}
                    </div>
                    <div className="text-sm text-gray-600">Em Progresso</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-red-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {taskMetrics.blockedTasks + taskMetrics.overdueTasks}
                    </div>
                    <div className="text-sm text-gray-600">Bloqueadas/Atrasadas</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Métricas de Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">Tempo Médio de Resolução</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {taskMetrics.averageResolutionTime} dias
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">Complexidade Média</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {taskMetrics.averageComplexity}/5
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Top Performers</span>
              </h3>
              <div className="space-y-3">
                {taskMetrics.topPerformers.map((performer, index) => (
                  <motion.div
                    key={performer.assignee}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{performer.assignee}</div>
                        <div className="text-sm text-gray-600">
                          {performer.completedTasks} tasks concluídas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(performer.averageTime)} dias
                      </div>
                      <div className="text-xs text-gray-600">tempo médio</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'types' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Distribuição por Tipo</span>
              </h3>
              <div className="space-y-3">
                {taskMetrics.taskTypes.map((type, index) => (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(type.type)}</span>
                      <div>
                        <div className="font-medium">{type.type}</div>
                        <div className="text-sm text-gray-600">
                          {type.count} tasks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(type.percentage)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span>Distribuição por Prioridade</span>
              </h3>
              <div className="space-y-3">
                {taskMetrics.priorityDistribution.map((priority, index) => (
                  <motion.div
                    key={priority.priority}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        priority.priority.toLowerCase().includes('highest') ? 'bg-red-500' :
                        priority.priority.toLowerCase().includes('high') ? 'bg-orange-500' :
                        priority.priority.toLowerCase().includes('medium') ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{priority.priority}</div>
                        <div className="text-sm text-gray-600">
                          {priority.count} tasks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(priority.percentage)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${priority.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Fluxo de Status</span>
              </h3>
              <div className="space-y-3">
                {taskMetrics.statusFlow.map((status, index) => (
                  <motion.div
                    key={status.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        getStatusColor(status.status).replace('text-', 'bg-')
                      }`}></div>
                      <div>
                        <div className="font-medium">{status.status}</div>
                        <div className="text-sm text-gray-600">
                          {status.count} tasks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(status.averageTime)} dias
                      </div>
                      <div className="text-xs text-gray-600">tempo médio</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskBreakdownCard;

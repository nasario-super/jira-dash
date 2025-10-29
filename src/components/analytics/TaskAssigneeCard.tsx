// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  User,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  Zap,
  Brain,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import { motion } from 'framer-motion';

interface TaskAssigneeCardProps {
  issues: JiraIssue[];
  loading?: boolean;
}

interface AssigneeMetrics {
  totalAssignees: number;
  activeAssignees: number;
  topPerformers: Array<{
    assignee: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    completionRate: number;
    averageResolutionTime: number;
    velocity: number;
    workload: number;
    efficiency: number;
  }>;
  workloadDistribution: Array<{
    assignee: string;
    currentTasks: number;
    completedThisWeek: number;
    averageTime: number;
    efficiency: number;
  }>;
  skillAnalysis: Array<{
    assignee: string;
    taskTypes: Array<{
      type: string;
      count: number;
      successRate: number;
    }>;
    strengths: string[];
    areasForImprovement: string[];
  }>;
  collaborationMetrics: Array<{
    assignee: string;
    tasksWithOthers: number;
    averageCollaborationScore: number;
    mostCollaboratedWith: string;
  }>;
  burnoutRisk: Array<{
    assignee: string;
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  }>;
}

const TaskAssigneeCard: React.FC<TaskAssigneeCardProps> = ({
  issues,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'performance'
    | 'workload'
    | 'skills'
    | 'collaboration'
    | 'wellbeing'
  >('overview');

  const assigneeMetrics = useMemo((): AssigneeMetrics => {
    if (!issues || issues.length === 0) {
      return {
        totalAssignees: 0,
        activeAssignees: 0,
        topPerformers: [],
        workloadDistribution: [],
        skillAnalysis: [],
        collaborationMetrics: [],
        burnoutRisk: [],
      };
    }

    // Agrupar issues por assignee
    const assigneeMap = new Map<string, JiraIssue[]>();
    issues.forEach(issue => {
      const assignee = issue.fields.assignee?.displayName || 'Unassigned';
      if (!assigneeMap.has(assignee)) {
        assigneeMap.set(assignee, []);
      }
      assigneeMap.get(assignee)!.push(issue);
    });

    const totalAssignees = assigneeMap.size;
    const activeAssignees = Array.from(assigneeMap.entries()).filter(
      ([_, tasks]) =>
        tasks.some(task => task.fields.status.statusCategory.name !== 'Done')
    ).length;

    // Calcular métricas para cada assignee
    const assigneeStats = Array.from(assigneeMap.entries()).map(
      ([assignee, tasks]) => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(
          task => task.fields.status.statusCategory.name === 'Done'
        ).length;
        const inProgressTasks = tasks.filter(
          task => task.fields.status.statusCategory.name === 'In Progress'
        ).length;
        const blockedTasks = tasks.filter(
          task =>
            task.fields.status.name.toLowerCase().includes('blocked') ||
            task.fields.status.name.toLowerCase().includes('impediment')
        ).length;

        const completionRate =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Calcular tempo médio de resolução
        const resolvedTasks = tasks.filter(
          task =>
            task.fields.status.statusCategory.name === 'Done' &&
            task.fields.updated
        );

        const averageResolutionTime =
          resolvedTasks.length > 0
            ? resolvedTasks.reduce((sum, task) => {
                const created = new Date(task.fields.created);
                const resolved = new Date(task.fields.updated!);
                return (
                  sum +
                  (resolved.getTime() - created.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
              }, 0) / resolvedTasks.length
            : 0;

        // Calcular velocity (tasks completadas por semana)
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const completedThisWeek = completedTasks; // Simplificado para demonstração

        const velocity = completedThisWeek;

        // Calcular workload (tasks ativas)
        const workload = inProgressTasks + blockedTasks;

        // Calcular eficiência (completion rate / average time)
        const efficiency =
          averageResolutionTime > 0
            ? completionRate / averageResolutionTime
            : 0;

        return {
          assignee,
          totalTasks,
          completedTasks,
          inProgressTasks,
          blockedTasks,
          completionRate,
          averageResolutionTime,
          velocity,
          workload,
          efficiency,
        };
      }
    );

    // Top performers
    const topPerformers = assigneeStats.sort(
      (a, b) => b.completionRate - a.completionRate
    );

    // Distribuição de workload
    const workloadDistribution = assigneeStats
      .filter((stat : any) => stat.workload > 0)
      .sort((a, b) => b.workload - a.workload)
      .map((stat : any) => ({
        assignee: stat.assignee,
        currentTasks: stat.inProgressTasks + stat.blockedTasks,
        completedThisWeek: stat.completedTasks,
        averageTime: stat.averageResolutionTime,
        efficiency: stat.efficiency,
      }));

    // Análise de skills
    const skillAnalysis = assigneeStats.map((stat : any) => {
      const assigneeTasks = assigneeMap.get(stat.assignee) || [];

      // Agrupar por tipo de task
      const typeStats = new Map<string, { count: number; completed: number }>();
      assigneeTasks.forEach(task => {
        const type = task.fields.issuetype.name;
        if (!typeStats.has(type)) {
          typeStats.set(type, { count: 0, completed: 0 });
        }
        typeStats.get(type)!.count++;
        if (task.fields.status.statusCategory.name === 'Done') {
          typeStats.get(type)!.completed++;
        }
      });

      const taskTypes = Array.from(typeStats.entries()).map(
        ([type, stats]) => ({
          type,
          count: stats.count,
          successRate:
            stats.count > 0 ? (stats.completed / stats.count) * 100 : 0,
        })
      );

      // Identificar strengths e áreas de melhoria
      const strengths = taskTypes
        .filter((type : any) => type.successRate > 80)
        .map((type : any) => type.type);

      const areasForImprovement = taskTypes
        .filter((type : any) => type.successRate < 60)
        .map((type : any) => type.type);

      return {
        assignee: stat.assignee,
        taskTypes,
        strengths,
        areasForImprovement,
      };
    });

    // Métricas de colaboração (simplificado)
    const collaborationMetrics = assigneeStats.map((stat : any) => ({
      assignee: stat.assignee,
      tasksWithOthers: Math.floor(stat.totalTasks * 0.3), // Simulado
      averageCollaborationScore: Math.random() * 10, // Simulado
      mostCollaboratedWith: 'Team Member', // Simulado
    }));

    // Análise de burnout risk
    const burnoutRisk = assigneeStats.map((stat : any) => {
      const factors = [];
      const recommendations = [];

      if (stat.workload > 10) {
        factors.push('Alto workload');
        recommendations.push('Reduzir número de tasks ativas');
      }

      if (stat.averageResolutionTime > 14) {
        factors.push('Tempo de resolução alto');
        recommendations.push('Focar em tasks menores primeiro');
      }

      if (stat.completionRate < 50) {
        factors.push('Baixa taxa de conclusão');
        recommendations.push('Revisar prioridades e dependências');
      }

      if (stat.blockedTasks > 3) {
        factors.push('Muitas tasks bloqueadas');
        recommendations.push('Resolver impedimentos urgentes');
      }

      const riskLevel =
        factors.length >= 3 ? 'high' : factors.length >= 2 ? 'medium' : 'low';

      return {
        assignee: stat.assignee,
        riskLevel,
        factors,
        recommendations,
      };
    });

    return {
      totalAssignees,
      activeAssignees,
      topPerformers,
      workloadDistribution,
      skillAnalysis,
      collaborationMetrics,
      burnoutRisk,
    };
  }, [issues]);

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
    }
  };

  const getRiskBgColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100';
      case 'medium':
        return 'bg-yellow-100';
      case 'high':
        return 'bg-red-100';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Análise de Assignees</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse h-16 bg-gray-200 rounded"
              ></div>
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
          <Users className="w-5 h-5 text-blue-600" />
          <span>Análise de Assignees</span>
        </CardTitle>
        <div className="flex space-x-2 mt-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'workload', label: 'Workload', icon: Target },
            { id: 'skills', label: 'Skills', icon: Brain },
            { id: 'collaboration', label: 'Colaboração', icon: Users },
            { id: 'wellbeing', label: 'Bem-estar', icon: Activity },
          ].map((tab : any) => (
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
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {assigneeMetrics.totalAssignees}
                    </div>
                    <div className="text-sm text-gray-600">Total Assignees</div>
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
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {assigneeMetrics.activeAssignees}
                    </div>
                    <div className="text-sm text-gray-600">Ativos</div>
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
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {assigneeMetrics.topPerformers.length}
                    </div>
                    <div className="text-sm text-gray-600">Top Performers</div>
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
                      {
                        assigneeMetrics.burnoutRisk.filter(
                          r => r.riskLevel === 'high'
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Alto Risco</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <div className="space-y-3">
              {assigneeMetrics.topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.assignee}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{performer.assignee}</div>
                        <div className="text-sm text-gray-600">
                          {performer.totalTasks} tasks •{' '}
                          {performer.completedTasks} concluídas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(performer.completionRate)}% completion
                      </div>
                      <div className="text-xs text-gray-600">
                        {Math.round(performer.averageResolutionTime)} dias médio
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{performer.completedTasks}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-yellow-600" />
                        <span>{performer.inProgressTasks}</span>
                      </div>
                      {performer.blockedTasks > 0 && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>{performer.blockedTasks}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Eficiência: {Math.round(performer.efficiency * 100) / 100}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Distribuição de Workload
            </h3>
            <div className="space-y-3">
              {assigneeMetrics.workloadDistribution.map((workload, index) => (
                <motion.div
                  key={workload.assignee}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{workload.assignee}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">
                          {workload.currentTasks}
                        </span>{' '}
                        ativas
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          {workload.completedThisWeek}
                        </span>{' '}
                        concluídas
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Tempo médio: {Math.round(workload.averageTime)} dias
                    </div>
                    <div className="text-sm text-gray-600">
                      Eficiência: {Math.round(workload.efficiency * 100) / 100}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Análise de Skills</h3>
            <div className="space-y-4">
              {assigneeMetrics.skillAnalysis.slice(0, 5).map((skill, index) => (
                <motion.div
                  key={skill.assignee}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium mb-2">{skill.assignee}</div>
                  <div className="space-y-2">
                    {skill.taskTypes.slice(0, 3).map((type, typeIndex) => (
                      <div
                        key={typeIndex}
                        className="flex items-center justify-between"
                      >
                        <div className="text-sm">{type.type}</div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">
                            {type.count} tasks • {Math.round(type.successRate)}%
                            success
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${type.successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {skill.strengths.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-green-600 font-medium">
                        Strengths:
                      </div>
                      <div className="text-xs text-green-600">
                        {skill.strengths.join(', ')}
                      </div>
                    </div>
                  )}
                  {skill.areasForImprovement.length > 0 && (
                    <div className="mt-1">
                      <div className="text-xs text-orange-600 font-medium">
                        Áreas para melhoria:
                      </div>
                      <div className="text-xs text-orange-600">
                        {skill.areasForImprovement.join(', ')}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">
              Métricas de Colaboração
            </h3>
            <div className="space-y-3">
              {assigneeMetrics.collaborationMetrics
                .slice(0, 5)
                .map((collab, index) => (
                  <motion.div
                    key={collab.assignee}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{collab.assignee}</div>
                        <div className="text-sm text-gray-600">
                          {collab.tasksWithOthers} tasks colaborativas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Score:{' '}
                          {Math.round(collab.averageCollaborationScore * 10) /
                            10}
                          /10
                        </div>
                        <div className="text-xs text-gray-600">
                          Mais com: {collab.mostCollaboratedWith}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'wellbeing' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Análise de Bem-estar</h3>
            <div className="space-y-3">
              {assigneeMetrics.burnoutRisk.map((risk, index) => (
                <motion.div
                  key={risk.assignee}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${getRiskBgColor(risk.riskLevel)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{risk.assignee}</div>
                    <Badge
                      className={`${getRiskColor(risk.riskLevel)} bg-white`}
                    >
                      {risk.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  {risk.factors.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-700">
                        Fatores de risco:
                      </div>
                      <div className="text-sm text-gray-600">
                        {risk.factors.join(', ')}
                      </div>
                    </div>
                  )}
                  {risk.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Recomendações:
                      </div>
                      <div className="text-sm text-gray-600">
                        {risk.recommendations.join(', ')}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskAssigneeCard;

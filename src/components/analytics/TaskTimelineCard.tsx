import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import { motion } from 'framer-motion';

interface TaskTimelineCardProps {
  issues: JiraIssue[];
  loading?: boolean;
}

interface TimelineData {
  dailyActivity: Array<{
    date: string;
    created: number;
    completed: number;
    inProgress: number;
    blocked: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    velocity: number;
    completionRate: number;
    averageResolutionTime: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageComplexity: number;
  }>;
  resolutionTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: number;
    activity: number;
  }>;
  seasonalPatterns: Array<{
    period: string;
    activity: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

const TaskTimelineCard: React.FC<TaskTimelineCardProps> = ({
  issues,
  loading = false,
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'weekly' | 'monthly' | 'patterns'>('daily');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const timelineData = useMemo((): TimelineData => {
    if (!issues || issues.length === 0) {
      return {
        dailyActivity: [],
        weeklyTrends: [],
        monthlyBreakdown: [],
        resolutionTimeDistribution: [],
        peakHours: [],
        seasonalPatterns: [],
      };
    }

    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    // Atividade diária
    const dailyActivity = [];
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created.toDateString() === date.toDateString();
      });

      const created = dayIssues.length;
      const completed = dayIssues.filter(issue => 
        issue.fields.status.statusCategory.name === 'Done'
      ).length;
      const inProgress = dayIssues.filter(issue => 
        issue.fields.status.statusCategory.name === 'In Progress'
      ).length;
      const blocked = dayIssues.filter(issue => 
        issue.fields.status.name.toLowerCase().includes('blocked') ||
        issue.fields.status.name.toLowerCase().includes('impediment')
      ).length;

      dailyActivity.push({
        date: dateStr,
        created,
        completed,
        inProgress,
        blocked,
      });
    }

    // Tendências semanais
    const weeklyTrends = [];
    for (let i = Math.floor(daysBack / 7); i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekStr = `${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`;
      
      const weekIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created >= weekStart && created <= weekEnd;
      });

      const completed = weekIssues.filter(issue => 
        issue.fields.status.statusCategory.name === 'Done'
      ).length;

      const velocity = completed;
      const completionRate = weekIssues.length > 0 ? (completed / weekIssues.length) * 100 : 0;

      // Calcular tempo médio de resolução
      const resolvedIssues = weekIssues.filter(issue => 
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

      weeklyTrends.push({
        week: weekStr,
        velocity,
        completionRate,
        averageResolutionTime,
      });
    }

    // Breakdown mensal
    const monthlyBreakdown = [];
    for (let i = Math.floor(daysBack / 30); i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthStr = monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      const monthIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created >= monthStart && created <= monthEnd;
      });

      const completed = monthIssues.filter(issue => 
        issue.fields.status.statusCategory.name === 'Done'
      ).length;

      const completionRate = monthIssues.length > 0 ? (completed / monthIssues.length) * 100 : 0;

      // Calcular complexidade média
      const averageComplexity = monthIssues.length > 0 
        ? monthIssues.reduce((sum, issue) => {
            const summaryLength = issue.fields.summary.length;
            return sum + (summaryLength > 50 ? 3 : summaryLength > 20 ? 2 : 1);
          }, 0) / monthIssues.length
        : 0;

      monthlyBreakdown.push({
        month: monthStr,
        totalTasks: monthIssues.length,
        completedTasks: completed,
        completionRate,
        averageComplexity,
      });
    }

    // Distribuição de tempo de resolução
    const resolvedIssues = issues.filter(issue => 
      issue.fields.status.statusCategory.name === 'Done' &&
      issue.fields.resolutiondate
    );

    const resolutionTimes = resolvedIssues.map(issue => {
      const created = new Date(issue.fields.created);
      const resolved = new Date(issue.fields.resolutiondate!);
      return (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    });

    const resolutionTimeDistribution = [
      { range: '0-1 dias', count: 0, percentage: 0 },
      { range: '1-3 dias', count: 0, percentage: 0 },
      { range: '3-7 dias', count: 0, percentage: 0 },
      { range: '7-14 dias', count: 0, percentage: 0 },
      { range: '14+ dias', count: 0, percentage: 0 },
    ];

    resolutionTimes.forEach(time => {
      if (time <= 1) resolutionTimeDistribution[0].count++;
      else if (time <= 3) resolutionTimeDistribution[1].count++;
      else if (time <= 7) resolutionTimeDistribution[2].count++;
      else if (time <= 14) resolutionTimeDistribution[3].count++;
      else resolutionTimeDistribution[4].count++;
    });

    resolutionTimeDistribution.forEach(item => {
      item.percentage = resolvedIssues.length > 0 ? (item.count / resolvedIssues.length) * 100 : 0;
    });

    // Horários de pico (baseado em horário de criação)
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity: 0,
    }));

    issues.forEach(issue => {
      const created = new Date(issue.fields.created);
      const hour = created.getHours();
      peakHours[hour].activity++;
    });

    // Padrões sazonais
    const seasonalPatterns = [
      { period: 'Manhã (6-12h)', activity: 0, trend: 'stable' as const },
      { period: 'Tarde (12-18h)', activity: 0, trend: 'stable' as const },
      { period: 'Noite (18-24h)', activity: 0, trend: 'stable' as const },
      { period: 'Madrugada (0-6h)', activity: 0, trend: 'stable' as const },
    ];

    issues.forEach(issue => {
      const created = new Date(issue.fields.created);
      const hour = created.getHours();
      
      if (hour >= 6 && hour < 12) seasonalPatterns[0].activity++;
      else if (hour >= 12 && hour < 18) seasonalPatterns[1].activity++;
      else if (hour >= 18 && hour < 24) seasonalPatterns[2].activity++;
      else seasonalPatterns[3].activity++;
    });

    return {
      dailyActivity,
      weeklyTrends,
      monthlyBreakdown,
      resolutionTimeDistribution,
      peakHours,
      seasonalPatterns,
    };
  }, [issues, timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Timeline de Tasks</span>
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
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Timeline de Tasks</span>
        </CardTitle>
        <div className="flex space-x-2 mt-4">
          {[
            { id: 'daily', label: 'Diário', icon: Calendar },
            { id: 'weekly', label: 'Semanal', icon: BarChart3 },
            { id: 'monthly', label: 'Mensal', icon: TrendingUp },
            { id: 'patterns', label: 'Padrões', icon: Activity },
          ].map((view) => (
            <Button
              key={view.id}
              variant={activeView === view.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(view.id as any)}
              className="flex items-center space-x-1"
            >
              <view.icon className="w-4 h-4" />
              <span>{view.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex space-x-2 mt-2">
          {[
            { id: '7d', label: '7 dias' },
            { id: '30d', label: '30 dias' },
            { id: '90d', label: '90 dias' },
            { id: '1y', label: '1 ano' },
          ].map((range) => (
            <Button
              key={range.id}
              variant={timeRange === range.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.id as any)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {activeView === 'daily' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Atividade Diária</h3>
            <div className="space-y-3">
              {timelineData.dailyActivity.slice(-14).map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-600">
                      {new Date(day.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{day.created} criadas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{day.completed} concluídas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">{day.inProgress} em progresso</span>
                      </div>
                      {day.blocked > 0 && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm">{day.blocked} bloqueadas</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {day.created + day.completed + day.inProgress + day.blocked} total
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'weekly' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Tendências Semanais</h3>
            <div className="space-y-3">
              {timelineData.weeklyTrends.slice(-8).map((week, index) => (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{week.week}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">{week.velocity}</span> velocity
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{Math.round(week.completionRate)}%</span> completion
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Tempo médio de resolução: {Math.round(week.averageResolutionTime)} dias
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'monthly' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Breakdown Mensal</h3>
            <div className="space-y-3">
              {timelineData.monthlyBreakdown.slice(-6).map((month, index) => (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{month.month}</div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">{month.totalTasks}</span> total
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{month.completedTasks}</span> concluídas
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Taxa de conclusão: {Math.round(month.completionRate)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Complexidade: {Math.round(month.averageComplexity * 10) / 10}/5
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'patterns' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Distribuição de Tempo de Resolução</span>
              </h3>
              <div className="space-y-3">
                {timelineData.resolutionTimeDistribution.map((range, index) => (
                  <motion.div
                    key={range.range}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="font-medium">{range.range}</div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        {range.count} tasks ({Math.round(range.percentage)}%)
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${range.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Padrões Sazonais</span>
              </h3>
              <div className="space-y-3">
                {timelineData.seasonalPatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.period}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(pattern.trend)}
                      <div className="font-medium">{pattern.period}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {pattern.activity} tasks
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

export default TaskTimelineCard;

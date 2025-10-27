import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  Zap,
  X,
  Plus,
} from 'lucide-react';

interface DailyScrumDashboardProps {
  issues: any[];
  users: any[];
  sprints: any[];
}

interface Blocker {
  id: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  owner: string;
  status: 'active' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  issueKey?: string;
}

const DailyScrumDashboard: React.FC<DailyScrumDashboardProps> = ({
  issues,
  users,
  sprints,
}) => {
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [newBlocker, setNewBlocker] = useState('');
  const [showAddBlocker, setShowAddBlocker] = useState(false);

  // Processar dados para Daily
  const dailyData = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Issues concluídas ontem
    const yesterdayCompleted = issues.filter(issue => {
      const updated = new Date(issue.fields.updated);
      return updated.toDateString() === yesterday.toDateString() &&
             (issue.fields.status.name.toLowerCase().includes('concluído') ||
              issue.fields.status.name.toLowerCase().includes('done'));
    });

    // Issues em andamento hoje
    const todayInProgress = issues.filter(issue => {
      return issue.fields.status.name.toLowerCase().includes('andamento') ||
             issue.fields.status.name.toLowerCase().includes('progress');
    });

    // Issues atrasadas
    const overdueIssues = issues.filter(issue => {
      const dueDate = issue.fields.duedate;
      return dueDate && new Date(dueDate) < today;
    });

    // Calcular velocity da equipe
    const completedThisSprint = issues.filter(issue => {
      const status = issue.fields.status.name.toLowerCase();
      return status.includes('concluído') || status.includes('done');
    });

    const teamVelocity = completedThisSprint.length;

    // Calcular capacidade da equipe
    const activeUsers = users.filter(user => user.totalIssues > 0);
    const teamCapacity = activeUsers.reduce((sum, user) => sum + user.velocity, 0);

    return {
      yesterdayCompleted,
      todayInProgress,
      overdueIssues,
      teamVelocity,
      teamCapacity,
      activeUsers,
    };
  }, [issues, users]);

  const addBlocker = () => {
    if (newBlocker.trim()) {
      const blocker: Blocker = {
        id: Date.now().toString(),
        description: newBlocker.trim(),
        impact: 'medium',
        owner: 'Equipe',
        status: 'active',
        createdAt: new Date(),
      };
      setBlockers([...blockers, blocker]);
      setNewBlocker('');
      setShowAddBlocker(false);
    }
  };

  const resolveBlocker = (blockerId: string) => {
    setBlockers(blockers.map(blocker => 
      blocker.id === blockerId 
        ? { ...blocker, status: 'resolved', resolvedAt: new Date() }
        : blocker
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Scrum Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              {dailyData.activeUsers.length} Membros Ativos
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Target className="w-4 h-4 mr-2" />
              Velocity: {dailyData.teamVelocity}
            </Badge>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ontem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Ontem Concluí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyData.yesterdayCompleted.length > 0 ? (
                  dailyData.yesterdayCompleted.slice(0, 5).map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {issue.key}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {issue.fields.summary}
                        </div>
                      </div>
                      <Badge className="text-xs bg-green-100 text-green-800">
                        {issue.fields.status.name}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhuma issue concluída ontem</p>
                  </div>
                )}
                {dailyData.yesterdayCompleted.length > 5 && (
                  <div className="text-center text-xs text-gray-500">
                    +{dailyData.yesterdayCompleted.length - 5} mais
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hoje */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-600">
                  <Clock className="w-5 h-5 mr-2" />
                  Hoje Vou Fazer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyData.todayInProgress.length > 0 ? (
                  dailyData.todayInProgress.slice(0, 5).map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {issue.key}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {issue.fields.summary}
                        </div>
                      </div>
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        {issue.fields.status.name}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhuma issue em andamento</p>
                  </div>
                )}
                {dailyData.todayInProgress.length > 5 && (
                  <div className="text-center text-xs text-gray-500">
                    +{dailyData.todayInProgress.length - 5} mais
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Impedimentos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Impedimentos
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddBlocker(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {blockers.filter(b => b.status === 'active').length > 0 ? (
                  blockers.filter(b => b.status === 'active').map((blocker) => (
                    <div key={blocker.id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 mb-1">
                            {blocker.description}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getImpactColor(blocker.impact)}`}>
                              {blocker.impact}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {blocker.owner}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resolveBlocker(blocker.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhum impedimento ativo</p>
                  </div>
                )}

                {/* Adicionar novo impedimento */}
                {showAddBlocker && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <textarea
                        value={newBlocker}
                        onChange={(e) => setNewBlocker(e.target.value)}
                        placeholder="Descreva o impedimento..."
                        className="w-full p-2 text-sm border rounded resize-none"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={addBlocker}>
                          Adicionar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setShowAddBlocker(false);
                            setNewBlocker('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Métricas da Equipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Velocity da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {dailyData.teamVelocity}
                </div>
                <div className="text-sm text-gray-600">
                  Issues concluídas neste sprint
                </div>
                <Progress 
                  value={(dailyData.teamVelocity / Math.max(dailyData.teamCapacity, 1)) * 100} 
                  className="mt-3" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <Zap className="w-5 h-5 mr-2" />
                Capacidade da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {dailyData.teamCapacity}
                </div>
                <div className="text-sm text-gray-600">
                  Story points estimados
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {dailyData.activeUsers.length} membros ativos
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Issues Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {dailyData.overdueIssues.length}
                </div>
                <div className="text-sm text-gray-600">
                  Requerem atenção
                </div>
                {dailyData.overdueIssues.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {dailyData.overdueIssues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="text-xs text-gray-600 truncate">
                        {issue.key}: {issue.fields.summary}
                      </div>
                    ))}
                    {dailyData.overdueIssues.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dailyData.overdueIssues.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyScrumDashboard;

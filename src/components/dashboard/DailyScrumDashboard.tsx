import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Tag,
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
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    yesterday: true,
    today: true,
    overdue: false,
  });

  // Processar dados para Daily
  const dailyData = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Issues concluídas ontem - Usar múltiplas estratégias
    const isCompleted = (issue: any) => {
      const status = issue.fields.status;
      return (
        status?.statusCategory?.name === 'Done' ||
        status?.statusCategory?.key === 'done' ||
        status?.name === 'Concluído' ||
        status?.name === 'Fechado' ||
        status?.name === 'Resolvido' ||
        status?.name === 'Done'
      );
    };

    const isInProgress = (issue: any) => {
      const status = issue.fields.status;
      return (
        status?.statusCategory?.name === 'In Progress' ||
        status?.statusCategory?.key === 'indeterminate' ||
        status?.name === 'Em Andamento' ||
        status?.name === 'Em Progresso' ||
        status?.name === 'In Progress' ||
        status?.name === 'Em desenvolvimento'
      );
    };

    const yesterdayCompleted = issues.filter((issue : any) => {
      const updated = new Date(issue.fields.updated);
      return (
        updated.toDateString() === yesterday.toDateString() &&
        isCompleted(issue)
      );
    });

    // Issues em andamento hoje - MOSTRAR TODAS
    const todayInProgress = issues.filter(isInProgress);

    // Issues atrasadas
    const overdueIssues = issues.filter((issue : any) => {
      const dueDate = issue.fields.duedate;
      return dueDate && new Date(dueDate) < today && !isCompleted(issue);
    });

    // Calcular velocity da equipe
    const completedThisSprint = issues.filter(isCompleted);
    const teamVelocity = completedThisSprint.length;

    // Calcular capacidade da equipe
    const activeUsers = users.filter((user : any) => user.totalIssues > 0);
    const teamCapacity = activeUsers.reduce(
      (sum, user) => sum + (user.velocity || 0),
      0
    );

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
    setBlockers(
      blockers.map((blocker : any) =>
        blocker.id === blockerId
          ? { ...blocker, status: 'resolved', resolvedAt: new Date() }
          : blocker
      )
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ✅ COMPONENTE DE LISTA DE ISSUES
  const IssuesList = ({
    issues,
    title,
    icon: Icon,
    color,
    sectionKey,
  }: any) => (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => toggleSection(sectionKey)}
        className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gradient-to-r ${
          color === 'green'
            ? 'from-green-50 to-green-0'
            : color === 'blue'
            ? 'from-blue-50 to-blue-0'
            : 'from-orange-50 to-orange-0'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon
            className={`w-5 h-5 ${
              color === 'green'
                ? 'text-green-600'
                : color === 'blue'
                ? 'text-blue-600'
                : 'text-orange-600'
            }`}
          />
          <span className="font-semibold text-gray-900">{title}</span>
          <Badge variant="outline" className="text-xs">
            {issues.length}
          </Badge>
        </div>
        <motion.div
          animate={{ rotate: expandedSections[sectionKey] ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t"
          >
            <div className="divide-y max-h-96 overflow-y-auto">
              {issues.length > 0 ? (
                issues.map((issue, idx) => (
                  <motion.div
                    key={issue.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {issue.key}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {issue.fields.status.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {issue.fields.summary}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {issue.fields.assignee && (
                            <span>👤 {issue.fields.assignee.displayName}</span>
                          )}
                          {issue.fields.priority && (
                            <span>⚡ {issue.fields.priority.name}</span>
                          )}
                          {issue.fields.duedate && (
                            <span>
                              📅{' '}
                              {new Date(
                                issue.fields.duedate
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Icon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma issue nesta categoria</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Scrum</h2>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {dailyData.activeUsers.length > 0 && (
            <Badge variant="outline" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              {dailyData.activeUsers.length} Membros Ativos
            </Badge>
          )}
          <Badge variant="outline" className="text-sm">
            <Target className="w-4 h-4 mr-2" />
            Velocity: {dailyData.teamVelocity}
          </Badge>
        </div>
      </div>

      {/* Listas Expansíveis */}
      <div className="space-y-4">
        <IssuesList
          issues={dailyData.yesterdayCompleted}
          title="✅ Ontem Concluí"
          icon={CheckCircle}
          color="green"
          sectionKey="yesterday"
        />

        <IssuesList
          issues={dailyData.todayInProgress}
          title="🔵 Hoje Vou Fazer"
          icon={Zap}
          color="blue"
          sectionKey="today"
        />

        <IssuesList
          issues={dailyData.overdueIssues}
          title="⚠️  Issues em Atraso"
          icon={AlertTriangle}
          color="orange"
          sectionKey="overdue"
        />
      </div>

      {/* Bloqueadores */}
      {blockers.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">🚫 Impedimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockers.map((blocker : any) => (
                <div
                  key={blocker.id}
                  className={`p-3 rounded-lg flex items-start justify-between ${
                    blocker.status === 'active'
                      ? getImpactColor(blocker.impact)
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{blocker.description}</p>
                    <p className="text-xs mt-1 opacity-75">{blocker.owner}</p>
                  </div>
                  {blocker.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveBlocker(blocker.id)}
                      className="ml-2"
                    >
                      Resolver
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyScrumDashboard;

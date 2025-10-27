import React from 'react';
import { JiraIssue } from '../../types/jira.types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Clock, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface QuickStatsProps {
  issues: JiraIssue[];
}

const QuickStats: React.FC<QuickStatsProps> = ({ issues }) => {
  const stats = React.useMemo(() => {
    if (!issues || issues.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byPriority: {},
        byType: {},
        assigned: 0,
        unassigned: 0,
        overdue: 0,
      };
    }

    const byStatus = issues.reduce((acc, issue) => {
      const status = issue.fields.status.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = issues.reduce((acc, issue) => {
      const priority = issue.fields.priority.name;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = issues.reduce((acc, issue) => {
      const type = issue.fields.issuetype.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assigned = issues.filter(issue => issue.fields.assignee).length;
    const unassigned = issues.length - assigned;

    const overdue = issues.filter(issue => {
      if (!issue.fields.duedate) return false;
      return new Date(issue.fields.duedate) < new Date();
    }).length;

    return {
      total: issues.length,
      byStatus,
      byPriority,
      byType,
      assigned,
      unassigned,
      overdue,
    };
  }, [issues]);

  const getStatusIcon = (status: string) => {
    if (
      status.toLowerCase().includes('done') ||
      status.toLowerCase().includes('closed')
    ) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    if (
      status.toLowerCase().includes('progress') ||
      status.toLowerCase().includes('active')
    ) {
      return <Clock className="w-3 h-3 text-blue-500" />;
    }
    if (
      status.toLowerCase().includes('blocked') ||
      status.toLowerCase().includes('waiting')
    ) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    return <Target className="w-3 h-3 text-gray-500" />;
  };

  const getPriorityIcon = (priority: string) => {
    if (
      priority.toLowerCase().includes('high') ||
      priority.toLowerCase().includes('critical')
    ) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    if (priority.toLowerCase().includes('medium')) {
      return <Clock className="w-3 h-3 text-yellow-500" />;
    }
    return <Target className="w-3 h-3 text-green-500" />;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Issues */}
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Assigned vs Unassigned */}
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Atribuídas</p>
              <p className="text-lg font-semibold">{stats.assigned}</p>
            </div>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
              <p className="text-lg font-semibold text-red-500">
                {stats.overdue}
              </p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Unassigned */}
      <Card className="p-3">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Não Atribuídas</p>
              <p className="text-lg font-semibold text-orange-500">
                {stats.unassigned}
              </p>
            </div>
            <Users className="w-4 h-4 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;














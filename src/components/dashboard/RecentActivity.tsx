import React, { useMemo, useState } from 'react';
import { JiraIssue } from '../../types/jira.types';
import { getStatusColor, getPriorityColor } from '../../utils/calculations';
import { formatRelativeTime } from '../../utils/dateHelpers';
import VirtualizedList from '../common/VirtualizedList';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import DetailedViewModal from '../common/DetailedViewModal';
import { Eye, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecentActivityProps {
  issues: JiraIssue[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = React.memo(
  ({ issues, loading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);

    // Memoizar dados para evitar recálculos desnecessários
    const sortedIssues = useMemo(() => {
      if (!issues || issues.length === 0) return [];
      return [...issues].sort(
        (a, b) =>
          new Date(b.fields.updated).getTime() -
          new Date(a.fields.updated).getTime()
      );
    }, [issues]);

    const handleViewAll = () => {
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedIssue(null);
    };

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse h-16 bg-muted rounded"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!issues || issues.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>Nenhuma atividade recente</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const getStatusBadge = (status: string) => {
      const color = getStatusColor(status);
      return (
        <span
          className={`badge text-xs px-2 py-1`}
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {status}
        </span>
      );
    };

    const getPriorityBadge = (priority: string) => {
      const color = getPriorityColor(priority);
      return (
        <span
          className={`badge text-xs px-2 py-1`}
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {priority}
        </span>
      );
    };

    const getTypeIcon = (type: string) => {
      const icons: Record<string, string> = {
        Story: '📖',
        Task: '📋',
        Bug: '🐛',
        Epic: '🎯',
        Incident: '🚨',
      };
      return icons[type] || '📄';
    };

    const renderIssue = (issue: JiraIssue, index: number) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => {
          // Abrir modal com detalhes da issue específica
          setSelectedIssue(issue);
          setIsModalOpen(true);
        }}
      >
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg">
            {getTypeIcon(issue.fields.issuetype.name)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {issue.key}
              </h4>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {issue.fields.summary}
              </p>
            </div>
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(issue.fields.updated)}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(issue.fields.status.name)}
            {getPriorityBadge(issue.fields.priority.name)}
            {issue.fields.assignee && (
              <span className="text-xs text-muted-foreground">
                👤 {issue.fields.assignee.displayName}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividade Recente ({sortedIssues.length} issues)
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAll}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VirtualizedList
              items={sortedIssues}
              itemHeight={80}
              containerHeight={400}
              renderItem={renderIssue}
              keyExtractor={issue => issue.id}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        <DetailedViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            selectedIssue
              ? `Detalhes - ${selectedIssue.key}`
              : 'Todas as Issues - Atividade Recente'
          }
          issues={selectedIssue ? [selectedIssue] : sortedIssues}
          loading={loading}
        />
      </>
    );
  }
);

export default RecentActivity;

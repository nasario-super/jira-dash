import React, { useState, useMemo } from 'react';
import { JiraIssue } from '../../types/jira.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import VirtualizedList from './VirtualizedList';
import QuickStats from './QuickStats';
import { formatRelativeTime } from '../../utils/dateHelpers';
import { getStatusColor, getPriorityColor } from '../../utils/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Filter,
  User,
  Calendar,
  Tag,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface DetailedViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  issues: JiraIssue[];
  loading?: boolean;
}

const DetailedViewModal: React.FC<DetailedViewModalProps> = React.memo(
  ({ isOpen, onClose, title, issues, loading = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    // Memoizar dados filtrados
    const filteredIssues = useMemo(() => {
      if (!issues || issues.length === 0) return [];

      return issues.filter((issue : any) => {
        const matchesSearch =
          issue.fields.summary
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          issue.key.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || issue.fields.status.name === statusFilter;
        const matchesPriority =
          priorityFilter === 'all' ||
          issue.fields.priority.name === priorityFilter;
        const matchesAssignee =
          assigneeFilter === 'all' ||
          (assigneeFilter === 'unassigned' && !issue.fields.assignee) ||
          (issue.fields.assignee &&
            issue.fields.assignee.displayName === assigneeFilter);

        return (
          matchesSearch && matchesStatus && matchesPriority && matchesAssignee
        );
      });
    }, [issues, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

    // Obter opções únicas para filtros
    const uniqueStatuses = useMemo(() => {
      const statuses = [
        ...new Set(issues.map((issue : any) => issue.fields.status.name)),
      ];
      return statuses.sort();
    }, [issues]);

    const uniquePriorities = useMemo(() => {
      const priorities = [
        ...new Set(issues.map((issue : any) => issue.fields.priority.name)),
      ];
      return priorities.sort();
    }, [issues]);

    const uniqueAssignees = useMemo(() => {
      const assignees = [
        ...new Set(
          issues
            .map((issue : any) => issue.fields.assignee?.displayName)
            .filter(Boolean)
        ),
      ];
      return assignees.sort();
    }, [issues]);

    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        Bug: '🐛',
        Story: '📖',
        Task: '✅',
        Epic: '🎯',
        'Sub-task': '📋',
        Incident: '🚨',
      };
      return icons[type] || '📄';
    };

    const getStatusBadge = (status: string) => {
      const color = getStatusColor(status);
      return (
        <Badge variant="secondary" className={`${color} text-xs`}>
          {status}
        </Badge>
      );
    };

    const getPriorityBadge = (priority: string) => {
      const color = getPriorityColor(priority);
      return (
        <Badge variant="outline" className={`${color} text-xs`}>
          {priority}
        </Badge>
      );
    };

    const exportToCSV = async () => {
      setIsExporting(true);
      try {
        const csvData = filteredIssues.map((issue : any) => ({
          Key: issue.key,
          Summary: issue.fields.summary,
          Status: issue.fields.status.name,
          Priority: issue.fields.priority.name,
          Type: issue.fields.issuetype.name,
          Assignee: issue.fields.assignee?.displayName || 'Não atribuído',
          Created: new Date(issue.fields.created).toLocaleDateString('pt-BR'),
          Updated: new Date(issue.fields.updated).toLocaleDateString('pt-BR'),
          Project: issue.fields.project.name,
        }));

        const headers = Object.keys(csvData[0] || {});
        const csvContent = [
          headers.join(','),
          ...csvData.map((row : any) =>
            headers
              .map((header : any) => `"${row[header as keyof typeof row]}"`)
              .join(',')
          ),
        ].join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `jira-issues-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erro ao exportar CSV:', error);
      } finally {
        setIsExporting(false);
      }
    };

    const exportToJSON = async () => {
      setIsExporting(true);
      try {
        const jsonData = {
          title: title,
          exportDate: new Date().toISOString(),
          totalIssues: filteredIssues.length,
          issues: filteredIssues.map((issue : any) => ({
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            priority: issue.fields.priority.name,
            type: issue.fields.issuetype.name,
            assignee: issue.fields.assignee?.displayName || null,
            created: issue.fields.created,
            updated: issue.fields.updated,
            project: issue.fields.project.name,
            labels: issue.fields.labels,
          })),
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: 'application/json',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `jira-issues-${new Date().toISOString().split('T')[0]}.json`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Erro ao exportar JSON:', error);
      } finally {
        setIsExporting(false);
      }
    };

    const renderIssue = (issue: JiraIssue, index: number) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg">
            {getTypeIcon(issue.fields.issuetype.name)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
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

          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(issue.fields.status.name)}
            {getPriorityBadge(issue.fields.priority.name)}
            {issue.fields.assignee && (
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {issue.fields.assignee.displayName}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(issue.fields.created).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </motion.div>
    );

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={isExporting || filteredIssues.length === 0}
                  className="text-xs"
                >
                  {isExporting ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToJSON}
                  disabled={isExporting || filteredIssues.length === 0}
                  className="text-xs"
                >
                  {isExporting ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <FileText className="w-3 h-3 mr-1" />
                  )}
                  JSON
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Quick Stats */}
              <QuickStats issues={filteredIssues} />

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar issues..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {uniqueStatuses.map((status : any) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    {uniquePriorities.map((priority : any) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={assigneeFilter}
                  onValueChange={setAssigneeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Responsáveis</SelectItem>
                    <SelectItem value="unassigned">Não Atribuído</SelectItem>
                    {uniqueAssignees.map((assignee : any) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contador de resultados */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredIssues.length} de {issues.length} issues
                </p>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Filtros ativos
                  </span>
                </div>
              </div>

              {/* Lista virtualizada */}
              <div className="flex-1 min-h-0">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse h-20 bg-muted rounded"
                      ></div>
                    ))}
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Nenhuma issue encontrada</p>
                  </div>
                ) : (
                  <VirtualizedList
                    items={filteredIssues}
                    itemHeight={100}
                    containerHeight={400}
                    renderItem={renderIssue}
                    keyExtractor={issue => issue.id}
                    className="rounded-md"
                  />
                )}
              </div>
            </CardContent>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

export default DetailedViewModal;

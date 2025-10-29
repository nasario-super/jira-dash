import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Mail,
  Trash2,
  Play,
  Pause,
  Settings,
  FileText,
  Table,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { reportService } from '../../services/reportService';

interface ScheduledReport {
  id: number;
  config: any;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  createdAt: string;
  isActive?: boolean;
  lastRun?: string;
  nextRun?: string;
}

const ScheduledReportsManager: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    try {
      const scheduledReports = reportService.getScheduledReports();
      setReports(scheduledReports);
    } catch (error) {
      console.error('Erro ao carregar relatórios agendados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (reportId: number) => {
    if (window.confirm('Tem certeza que deseja remover este relatório agendado?')) {
      reportService.removeScheduledReport(reportId);
      loadReports();
    }
  };

  const handleToggleReport = (reportId: number) => {
    setReports(prev => prev.map((report : any) => 
      report.id === reportId 
        ? { ...report, isActive: !report.isActive }
        : report
    ));
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return frequency;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <Table className="w-4 h-4" />;
      case 'csv': return <Table className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getNextRunTime = (frequency: string, time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        const daysUntilNextWeek = (7 - now.getDay()) % 7;
        nextRun.setDate(now.getDate() + (daysUntilNextWeek === 0 ? 7 : daysUntilNextWeek));
        break;
      case 'monthly':
        nextRun.setMonth(now.getMonth() + 1);
        break;
    }

    return nextRun.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum relatório agendado
          </h3>
          <p className="text-gray-600 mb-4">
            Configure relatórios automáticos para receber atualizações regulares.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={`${report.isActive === false ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFormatIcon(report.config.format)}
                  <div>
                    <CardTitle className="text-lg">{report.config.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {report.config.description || 'Relatório automático'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={report.isActive !== false ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {report.isActive !== false ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Ativo</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Pausado</span>
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Configurações do Relatório */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Frequência: {getFrequencyLabel(report.schedule.frequency)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Horário: {report.schedule.time}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{report.schedule.recipients.length} destinatário(s)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Settings className="w-4 h-4" />
                    <span>Formato: {report.config.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Opções do Relatório */}
              <div className="flex flex-wrap gap-2">
                {report.config.includeCharts && (
                  <Badge variant="outline" className="text-xs">
                    Gráficos
                  </Badge>
                )}
                {report.config.includeDetails && (
                  <Badge variant="outline" className="text-xs">
                    Detalhes
                  </Badge>
                )}
                {report.config.includeMetrics && (
                  <Badge variant="outline" className="text-xs">
                    Métricas
                  </Badge>
                )}
              </div>

              {/* Próxima execução */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Próxima execução</div>
                    <div className="text-sm text-gray-600">
                      {getNextRunTime(report.schedule.frequency, report.schedule.time)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleReport(report.id)}
                    className="flex items-center space-x-1"
                  >
                    {report.isActive !== false ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Reativar</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Implementar edição do relatório
                      console.log('Editar relatório:', report.id);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ScheduledReportsManager;

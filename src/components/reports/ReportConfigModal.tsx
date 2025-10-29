import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  X,
  Download,
  Calendar,
  FileText,
  Table,
  BarChart3,
  Settings,
  Clock,
  Users,
  Mail,
} from 'lucide-react';
import { ReportConfig } from '../../services/reportService';

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ReportConfig) => void;
  onSchedule: (config: ReportConfig, schedule: any) => void;
  defaultConfig?: Partial<ReportConfig>;
}

const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onSchedule,
  defaultConfig = {},
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    format: 'pdf',
    includeCharts: true,
    includeDetails: true,
    includeMetrics: true,
    title: 'Relatório Jira Dashboard',
    description: '',
    ...defaultConfig,
  });

  const [schedule, setSchedule] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    time: '09:00',
    recipients: '',
  });

  const [isScheduling, setIsScheduling] = useState(false);

  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleScheduleChange = (key: string, value: any) => {
    setSchedule(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    onExport(config);
    onClose();
  };

  const handleSchedule = () => {
    const recipients = schedule.recipients
      .split(',')
      .map((email : any) => email.trim())
      .filter((email : any) => email.length > 0);

    if (recipients.length === 0) {
      alert('Por favor, insira pelo menos um email para receber o relatório.');
      return;
    }

    onSchedule(config, { ...schedule, recipients });
    onClose();
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Relatório visual com gráficos' },
    { value: 'excel', label: 'Excel', icon: Table, description: 'Planilha com dados detalhados' },
    { value: 'csv', label: 'CSV', icon: Table, description: 'Dados em formato texto' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
  ];

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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configurar Relatório</h2>
                <p className="text-sm text-gray-500">Escolha o formato e opções do relatório</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Formato do Relatório */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato do Relatório</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        config.format === option.value
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleConfigChange('format', option.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">{option.label}</h4>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Informações do Relatório */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Relatório</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Relatório
                  </label>
                  <Input
                    value={config.title}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="Digite o título do relatório"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <Input
                    value={config.description}
                    onChange={(e) => handleConfigChange('description', e.target.value)}
                    placeholder="Descrição do relatório"
                  />
                </div>
              </div>
            </div>

            {/* Opções do Relatório */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opções do Relatório</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Incluir Gráficos</div>
                      <div className="text-sm text-gray-500">Adiciona visualizações ao relatório</div>
                    </div>
                  </div>
                  <Switch
                    checked={config.includeCharts}
                    onCheckedChange={(checked) => handleConfigChange('includeCharts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Table className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Incluir Detalhes</div>
                      <div className="text-sm text-gray-500">Lista detalhada de todas as issues</div>
                    </div>
                  </div>
                  <Switch
                    checked={config.includeDetails}
                    onCheckedChange={(checked) => handleConfigChange('includeDetails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Incluir Métricas</div>
                      <div className="text-sm text-gray-500">KPIs e métricas de performance</div>
                    </div>
                  </div>
                  <Switch
                    checked={config.includeMetrics}
                    onCheckedChange={(checked) => handleConfigChange('includeMetrics', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Agendamento */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamento Automático</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência
                    </label>
                    <Select
                      value={schedule.frequency}
                      onValueChange={(value) => handleScheduleChange('frequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário
                    </label>
                    <Input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => handleScheduleChange('time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emails para Receber o Relatório
                  </label>
                  <Input
                    value={schedule.recipients}
                    onChange={(e) => handleScheduleChange('recipients', e.target.value)}
                    placeholder="email1@exemplo.com, email2@exemplo.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separe múltiplos emails com vírgula
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduling(!isScheduling)}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isScheduling ? 'Cancelar Agendamento' : 'Agendar'}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                {isScheduling ? (
                  <Button onClick={handleSchedule} className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Agendar Relatório</span>
                  </Button>
                ) : (
                  <Button onClick={handleExport} className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportar Agora</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportConfigModal;

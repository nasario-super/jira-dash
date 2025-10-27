import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { JiraIssue } from '../types/jira.types';

export interface ReportData {
  issues: JiraIssue[];
  users: any[];
  projects: any[];
  metrics: {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    overdueIssues: number;
    completionRate: number;
    avgResolutionTime: number;
    teamProductivity: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface ReportConfig {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeDetails: boolean;
  includeMetrics: boolean;
  title: string;
  description?: string;
}

class ReportService {
  /**
   * Exporta dados para Excel
   */
  async exportToExcel(data: ReportData, config: ReportConfig): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Resumo Executivo
    const summaryData = [
      ['Métrica', 'Valor', 'Período'],
      ['Total de Issues', data.metrics.totalIssues, `${data.period.start.toLocaleDateString('pt-BR')} - ${data.period.end.toLocaleDateString('pt-BR')}`],
      ['Issues Concluídas', data.metrics.completedIssues, ''],
      ['Issues em Andamento', data.metrics.inProgressIssues, ''],
      ['Issues Atrasadas', data.metrics.overdueIssues, ''],
      ['Taxa de Conclusão', `${data.metrics.completionRate.toFixed(1)}%`, ''],
      ['Tempo Médio de Resolução', `${data.metrics.avgResolutionTime} dias`, ''],
      ['Produtividade da Equipe', `${data.metrics.teamProductivity.toFixed(1)} issues/usuário`, ''],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo Executivo');

    // Sheet 2: Issues Detalhadas
    if (config.includeDetails) {
      const issuesData = data.issues.map(issue => ({
        'Chave': issue.key,
        'Título': issue.fields.summary,
        'Status': issue.fields.status.name,
        'Tipo': issue.fields.issuetype.name,
        'Prioridade': issue.fields.priority.name,
        'Responsável': issue.fields.assignee?.displayName || 'Não atribuído',
        'Projeto': issue.fields.project.name,
        'Data de Criação': new Date(issue.fields.created).toLocaleDateString('pt-BR'),
        'Data de Atualização': new Date(issue.fields.updated).toLocaleDateString('pt-BR'),
        'Data de Vencimento': issue.fields.duedate ? new Date(issue.fields.duedate).toLocaleDateString('pt-BR') : 'Não definida',
      }));

      const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
      XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Issues Detalhadas');
    }

    // Sheet 3: Métricas por Usuário
    if (data.users.length > 0) {
      const userMetrics = this.calculateUserMetrics(data.issues);
      const userData = userMetrics.map(user => ({
        'Usuário': user.name,
        'Total de Issues': user.totalIssues,
        'Issues Concluídas': user.completedIssues,
        'Issues em Andamento': user.inProgressIssues,
        'Issues Atrasadas': user.overdueIssues,
        'Taxa de Conclusão': `${user.completionRate.toFixed(1)}%`,
        'Produtividade': user.productivity.toFixed(1),
      }));

      const userSheet = XLSX.utils.json_to_sheet(userData);
      XLSX.utils.book_append_sheet(workbook, userSheet, 'Métricas por Usuário');
    }

    // Sheet 4: Métricas por Projeto
    if (data.projects.length > 0) {
      const projectMetrics = this.calculateProjectMetrics(data.issues);
      const projectData = projectMetrics.map(project => ({
        'Projeto': project.name,
        'Total de Issues': project.totalIssues,
        'Issues Concluídas': project.completedIssues,
        'Issues em Andamento': project.inProgressIssues,
        'Issues Atrasadas': project.overdueIssues,
        'Taxa de Conclusão': `${project.completionRate.toFixed(1)}%`,
        'Saúde do Projeto': project.health,
      }));

      const projectSheet = XLSX.utils.json_to_sheet(projectData);
      XLSX.utils.book_append_sheet(workbook, projectSheet, 'Métricas por Projeto');
    }

    // Gerar arquivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${config.title}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Exporta dados para CSV
   */
  async exportToCSV(data: ReportData, config: ReportConfig): Promise<void> {
    const csvData = data.issues.map(issue => ({
      chave: issue.key,
      titulo: issue.fields.summary,
      status: issue.fields.status.name,
      tipo: issue.fields.issuetype.name,
      prioridade: issue.fields.priority.name,
      responsavel: issue.fields.assignee?.displayName || 'Não atribuído',
      projeto: issue.fields.project.name,
      dataCriacao: new Date(issue.fields.created).toLocaleDateString('pt-BR'),
      dataAtualizacao: new Date(issue.fields.updated).toLocaleDateString('pt-BR'),
      dataVencimento: issue.fields.duedate ? new Date(issue.fields.duedate).toLocaleDateString('pt-BR') : 'Não definida',
    }));

    const csvContent = this.convertToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${config.title}_${new Date().toISOString().split('T')[0]}.csv`);
  }

  /**
   * Exporta dados para PDF
   */
  async exportToPDF(data: ReportData, config: ReportConfig, elementId?: string): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Título
    pdf.setFontSize(20);
    pdf.text(config.title, 20, 20);
    
    if (config.description) {
      pdf.setFontSize(12);
      pdf.text(config.description, 20, 30);
    }

    // Data do relatório
    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 40);
    pdf.text(`Período: ${data.period.start.toLocaleDateString('pt-BR')} - ${data.period.end.toLocaleDateString('pt-BR')}`, 20, 45);

    // Métricas principais
    pdf.setFontSize(14);
    pdf.text('Métricas Principais', 20, 60);
    
    const metrics = [
      `Total de Issues: ${data.metrics.totalIssues}`,
      `Issues Concluídas: ${data.metrics.completedIssues}`,
      `Issues em Andamento: ${data.metrics.inProgressIssues}`,
      `Issues Atrasadas: ${data.metrics.overdueIssues}`,
      `Taxa de Conclusão: ${data.metrics.completionRate.toFixed(1)}%`,
      `Tempo Médio de Resolução: ${data.metrics.avgResolutionTime} dias`,
      `Produtividade da Equipe: ${data.metrics.teamProductivity.toFixed(1)} issues/usuário`,
    ];

    metrics.forEach((metric, index) => {
      pdf.setFontSize(10);
      pdf.text(metric, 20, 70 + (index * 5));
    });

    // Se incluir detalhes das issues
    if (config.includeDetails && data.issues.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Issues Detalhadas', 20, 20);
      
      let yPosition = 30;
      data.issues.slice(0, 20).forEach((issue, index) => { // Limitar a 20 issues por página
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(8);
        pdf.text(`${issue.key}: ${issue.fields.summary}`, 20, yPosition);
        pdf.text(`Status: ${issue.fields.status.name} | Responsável: ${issue.fields.assignee?.displayName || 'Não atribuído'}`, 20, yPosition + 3);
        yPosition += 10;
      });
    }

    // Salvar arquivo
    pdf.save(`${config.title}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Captura um elemento HTML como imagem para incluir no PDF
   */
  async captureElementAsImage(elementId: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Elemento não encontrado');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Calcula métricas por usuário
   */
  private calculateUserMetrics(issues: JiraIssue[]) {
    const userStats = issues.reduce((acc: any, issue: JiraIssue) => {
      const assignee = issue.fields.assignee;
      if (!assignee) return acc;

      const userId = assignee.accountId;
      if (!acc[userId]) {
        acc[userId] = {
          name: assignee.displayName,
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          overdueIssues: 0,
        };
      }

      acc[userId].totalIssues++;
      const status = issue.fields.status.name.toLowerCase();
      if (status.includes('concluído') || status.includes('done') || status.includes('closed')) {
        acc[userId].completedIssues++;
      } else if (status.includes('andamento') || status.includes('progress')) {
        acc[userId].inProgressIssues++;
      }

      const dueDate = issue.fields.duedate;
      if (dueDate && new Date(dueDate) < new Date()) {
        acc[userId].overdueIssues++;
      }

      return acc;
    }, {});

    return Object.values(userStats).map((user: any) => ({
      ...user,
      completionRate: user.totalIssues > 0 ? (user.completedIssues / user.totalIssues) * 100 : 0,
      productivity: user.totalIssues > 0 ? user.totalIssues : 0,
    }));
  }

  /**
   * Calcula métricas por projeto
   */
  private calculateProjectMetrics(issues: JiraIssue[]) {
    const projectStats = issues.reduce((acc: any, issue: JiraIssue) => {
      const project = issue.fields.project;
      const projectKey = project.key;

      if (!acc[projectKey]) {
        acc[projectKey] = {
          name: project.name,
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          overdueIssues: 0,
        };
      }

      acc[projectKey].totalIssues++;
      const status = issue.fields.status.name.toLowerCase();
      if (status.includes('concluído') || status.includes('done') || status.includes('closed')) {
        acc[projectKey].completedIssues++;
      } else if (status.includes('andamento') || status.includes('progress')) {
        acc[projectKey].inProgressIssues++;
      }

      const dueDate = issue.fields.duedate;
      if (dueDate && new Date(dueDate) < new Date()) {
        acc[projectKey].overdueIssues++;
      }

      return acc;
    }, {});

    return Object.values(projectStats).map((project: any) => {
      const completionRate = project.totalIssues > 0 ? (project.completedIssues / project.totalIssues) * 100 : 0;
      const overdueRate = project.totalIssues > 0 ? (project.overdueIssues / project.totalIssues) * 100 : 0;
      
      let health = 'excellent';
      if (overdueRate > 20) health = 'critical';
      else if (overdueRate > 10) health = 'warning';
      else if (completionRate < 50) health = 'good';

      return {
        ...project,
        completionRate,
        health,
      };
    });
  }

  /**
   * Converte array de objetos para CSV
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Agenda um relatório para ser gerado automaticamente
   */
  scheduleReport(config: ReportConfig, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    recipients: string[];
  }): void {
    // Implementar lógica de agendamento
    console.log('Agendando relatório:', { config, schedule });
    
    // Em uma implementação real, isso seria salvo no backend
    const scheduledReports = JSON.parse(localStorage.getItem('scheduledReports') || '[]');
    scheduledReports.push({
      id: Date.now(),
      config,
      schedule,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('scheduledReports', JSON.stringify(scheduledReports));
  }

  /**
   * Lista relatórios agendados
   */
  getScheduledReports(): any[] {
    return JSON.parse(localStorage.getItem('scheduledReports') || '[]');
  }

  /**
   * Remove um relatório agendado
   */
  removeScheduledReport(reportId: number): void {
    const scheduledReports = this.getScheduledReports();
    const filteredReports = scheduledReports.filter((report: any) => report.id !== reportId);
    localStorage.setItem('scheduledReports', JSON.stringify(filteredReports));
  }
}

export const reportService = new ReportService();

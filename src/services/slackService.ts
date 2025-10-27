interface SlackConfig {
  webhookUrl: string;
  channel: string;
  username: string;
  iconEmoji?: string;
}

interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
}

interface SlackAttachment {
  color: 'good' | 'warning' | 'danger' | string;
  title: string;
  text: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

interface AlertData {
  type: 'issue_overdue' | 'velocity_low' | 'team_overloaded' | 'milestone_approaching' | 'report_ready';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: any;
  timestamp: Date;
}

class SlackService {
  private config: SlackConfig | null = null;
  private isEnabled = false;

  /**
   * Configura o serviço Slack
   */
  configure(config: SlackConfig): void {
    this.config = config;
    this.isEnabled = true;
    
    // Salvar configuração no localStorage
    localStorage.setItem('slackConfig', JSON.stringify(config));
  }

  /**
   * Carrega configuração salva
   */
  loadConfig(): SlackConfig | null {
    try {
      const saved = localStorage.getItem('slackConfig');
      if (saved) {
        this.config = JSON.parse(saved);
        this.isEnabled = true;
        return this.config;
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do Slack:', error);
    }
    return null;
  }

  /**
   * Verifica se o Slack está configurado
   */
  isConfigured(): boolean {
    return this.isEnabled && this.config !== null;
  }

  /**
   * Envia uma mensagem simples para o Slack
   */
  async sendMessage(message: string, channel?: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Slack não configurado');
      return false;
    }

    const slackMessage: SlackMessage = {
      text: message,
      channel: channel || this.config!.channel,
      username: this.config!.username,
      icon_emoji: this.config!.iconEmoji || ':robot_face:',
    };

    return this.sendToSlack(slackMessage);
  }

  /**
   * Envia um alerta estruturado para o Slack
   */
  async sendAlert(alert: AlertData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Slack não configurado');
      return false;
    }

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const attachment: SlackAttachment = {
      color,
      title: `${emoji} ${alert.title}`,
      text: alert.description,
      fields: this.buildAlertFields(alert),
      footer: 'Jira Dashboard',
      ts: Math.floor(alert.timestamp.getTime() / 1000),
    };

    const slackMessage: SlackMessage = {
      text: `🚨 Novo alerta: ${alert.title}`,
      channel: this.config!.channel,
      username: this.config!.username,
      icon_emoji: this.config!.iconEmoji || ':robot_face:',
      attachments: [attachment],
    };

    return this.sendToSlack(slackMessage);
  }

  /**
   * Envia notificação de relatório pronto
   */
  async sendReportNotification(reportTitle: string, reportUrl?: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Slack não configurado');
      return false;
    }

    const attachment: SlackAttachment = {
      color: 'good',
      title: '📊 Relatório Pronto',
      text: `O relatório "${reportTitle}" foi gerado com sucesso!`,
      fields: [
        {
          title: 'Relatório',
          value: reportTitle,
          short: true,
        },
        {
          title: 'Gerado em',
          value: new Date().toLocaleString('pt-BR'),
          short: true,
        },
      ],
      footer: 'Jira Dashboard',
    };

    if (reportUrl) {
      attachment.fields?.push({
        title: 'Download',
        value: `<${reportUrl}|Clique aqui para baixar>`,
        short: false,
      });
    }

    const slackMessage: SlackMessage = {
      text: `📊 Relatório "${reportTitle}" está pronto!`,
      channel: this.config!.channel,
      username: this.config!.username,
      icon_emoji: this.config!.iconEmoji || ':robot_face:',
      attachments: [attachment],
    };

    return this.sendToSlack(slackMessage);
  }

  /**
   * Envia notificação de métricas diárias
   */
  async sendDailyMetrics(metrics: {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    overdueIssues: number;
    completionRate: number;
  }): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Slack não configurado');
      return false;
    }

    const attachment: SlackAttachment = {
      color: metrics.completionRate >= 80 ? 'good' : metrics.completionRate >= 60 ? 'warning' : 'danger',
      title: '📈 Métricas Diárias',
      text: 'Resumo das métricas do dia',
      fields: [
        {
          title: 'Total de Issues',
          value: metrics.totalIssues.toString(),
          short: true,
        },
        {
          title: 'Concluídas',
          value: metrics.completedIssues.toString(),
          short: true,
        },
        {
          title: 'Em Andamento',
          value: metrics.inProgressIssues.toString(),
          short: true,
        },
        {
          title: 'Atrasadas',
          value: metrics.overdueIssues.toString(),
          short: true,
        },
        {
          title: 'Taxa de Conclusão',
          value: `${metrics.completionRate.toFixed(1)}%`,
          short: true,
        },
      ],
      footer: 'Jira Dashboard - Relatório Diário',
      ts: Math.floor(Date.now() / 1000),
    };

    const slackMessage: SlackMessage = {
      text: `📈 Relatório Diário - ${new Date().toLocaleDateString('pt-BR')}`,
      channel: this.config!.channel,
      username: this.config!.username,
      icon_emoji: this.config!.iconEmoji || ':robot_face:',
      attachments: [attachment],
    };

    return this.sendToSlack(slackMessage);
  }

  /**
   * Envia notificação de sprint
   */
  async sendSprintNotification(sprintData: {
    name: string;
    startDate: Date;
    endDate: Date;
    totalIssues: number;
    completedIssues: number;
    remainingIssues: number;
    progress: number;
  }): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Slack não configurado');
      return false;
    }

    const attachment: SlackAttachment = {
      color: sprintData.progress >= 80 ? 'good' : sprintData.progress >= 50 ? 'warning' : 'danger',
      title: `🏃 Sprint: ${sprintData.name}`,
      text: `Progresso do sprint atual`,
      fields: [
        {
          title: 'Período',
          value: `${sprintData.startDate.toLocaleDateString('pt-BR')} - ${sprintData.endDate.toLocaleDateString('pt-BR')}`,
          short: false,
        },
        {
          title: 'Total de Issues',
          value: sprintData.totalIssues.toString(),
          short: true,
        },
        {
          title: 'Concluídas',
          value: sprintData.completedIssues.toString(),
          short: true,
        },
        {
          title: 'Restantes',
          value: sprintData.remainingIssues.toString(),
          short: true,
        },
        {
          title: 'Progresso',
          value: `${sprintData.progress.toFixed(1)}%`,
          short: true,
        },
      ],
      footer: 'Jira Dashboard - Sprint Update',
      ts: Math.floor(Date.now() / 1000),
    };

    const slackMessage: SlackMessage = {
      text: `🏃 Sprint Update: ${sprintData.name}`,
      channel: this.config!.channel,
      username: this.config!.username,
      icon_emoji: this.config!.iconEmoji || ':robot_face:',
      attachments: [attachment],
    };

    return this.sendToSlack(slackMessage);
  }

  /**
   * Envia a mensagem para o Slack via webhook
   */
  private async sendToSlack(message: SlackMessage): Promise<boolean> {
    if (!this.config) return false;

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('Mensagem enviada para o Slack com sucesso');
        return true;
      } else {
        console.error('Erro ao enviar mensagem para o Slack:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem para o Slack:', error);
      return false;
    }
  }

  /**
   * Obtém a cor baseada na severidade
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'good';
      default: return 'good';
    }
  }

  /**
   * Obtém o emoji baseado na severidade
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  /**
   * Constrói os campos do alerta
   */
  private buildAlertFields(alert: AlertData): SlackField[] {
    const fields: SlackField[] = [
      {
        title: 'Tipo',
        value: this.getAlertTypeLabel(alert.type),
        short: true,
      },
      {
        title: 'Severidade',
        value: alert.severity.toUpperCase(),
        short: true,
      },
    ];

    // Adicionar campos específicos baseados no tipo de alerta
    switch (alert.type) {
      case 'issue_overdue':
        fields.push({
          title: 'Issue',
          value: alert.data.issueKey || 'N/A',
          short: true,
        });
        fields.push({
          title: 'Responsável',
          value: alert.data.assignee || 'Não atribuído',
          short: true,
        });
        break;
      case 'velocity_low':
        fields.push({
          title: 'Velocity Atual',
          value: alert.data.currentVelocity?.toString() || 'N/A',
          short: true,
        });
        fields.push({
          title: 'Velocity Esperada',
          value: alert.data.expectedVelocity?.toString() || 'N/A',
          short: true,
        });
        break;
      case 'team_overloaded':
        fields.push({
          title: 'Usuário',
          value: alert.data.userName || 'N/A',
          short: true,
        });
        fields.push({
          title: 'Issues Atribuídas',
          value: alert.data.assignedIssues?.toString() || 'N/A',
          short: true,
        });
        break;
    }

    return fields;
  }

  /**
   * Obtém o label do tipo de alerta
   */
  private getAlertTypeLabel(type: string): string {
    switch (type) {
      case 'issue_overdue': return 'Issue Atrasada';
      case 'velocity_low': return 'Velocity Baixa';
      case 'team_overloaded': return 'Equipe Sobrecarregada';
      case 'milestone_approaching': return 'Marco Aproximando';
      case 'report_ready': return 'Relatório Pronto';
      default: return 'Alerta';
    }
  }

  /**
   * Testa a conexão com o Slack
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const testMessage = {
        text: '🧪 Teste de conexão do Jira Dashboard',
        channel: this.config!.channel,
        username: this.config!.username,
        icon_emoji: ':robot_face:',
      };

      const response = await fetch(this.config!.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão com Slack:', error);
      return false;
    }
  }

  /**
   * Desabilita o serviço Slack
   */
  disable(): void {
    this.isEnabled = false;
    this.config = null;
    localStorage.removeItem('slackConfig');
  }
}

export const slackService = new SlackService();
export type { SlackConfig, AlertData, SlackMessage };

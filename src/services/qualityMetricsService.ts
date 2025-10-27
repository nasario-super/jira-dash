import { JiraIssue } from '../types/jira.types';

export interface QualityMetrics {
  bugRate: number; // Percentual de issues que são bugs
  reworkRate: number; // Percentual de issues que foram reabertas
  defectEscapeRate: number; // Percentual de bugs que escaparam para produção
  testCoverage: number; // Cobertura de testes (simulado)
  codeQuality: number; // Qualidade do código (simulado)
  technicalDebt: number; // Dívida técnica (simulado)
  customerSatisfaction: number; // Satisfação do cliente (simulado)
  meanTimeToResolution: number; // Tempo médio de resolução
  firstTimeResolution: number; // Taxa de resolução na primeira tentativa
  escalationRate: number; // Taxa de escalação
}

export interface QualityTrend {
  period: string;
  metrics: QualityMetrics;
}

export interface QualityInsight {
  type: 'improvement' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
}

class QualityMetricsService {
  /**
   * Calcula métricas de qualidade baseadas nas issues
   */
  calculateQualityMetrics(issues: JiraIssue[]): QualityMetrics {
    if (issues.length === 0) {
      return this.getDefaultMetrics();
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtrar issues dos últimos 30 dias
    const recentIssues = issues.filter(
      issue => new Date(issue.fields.created) >= thirtyDaysAgo
    );

    // Calcular métricas básicas
    const totalIssues = recentIssues.length;
    const bugIssues = this.getBugIssues(recentIssues);
    const reopenedIssues = this.getReopenedIssues(recentIssues);
    const resolvedIssues = this.getResolvedIssues(recentIssues);
    const escalatedIssues = this.getEscalatedIssues(recentIssues);

    // Calcular taxas
    const bugRate =
      totalIssues > 0 ? (bugIssues.length / totalIssues) * 100 : 0;
    const reworkRate =
      totalIssues > 0 ? (reopenedIssues.length / totalIssues) * 100 : 0;
    const escalationRate =
      totalIssues > 0 ? (escalatedIssues.length / totalIssues) * 100 : 0;

    // Calcular tempo médio de resolução
    const meanTimeToResolution =
      this.calculateMeanTimeToResolution(resolvedIssues);

    // Calcular taxa de resolução na primeira tentativa
    const firstTimeResolution =
      this.calculateFirstTimeResolution(resolvedIssues);

    // Métricas simuladas (em um sistema real, viriam de outras fontes)
    const testCoverage = this.simulateTestCoverage(bugRate);
    const codeQuality = this.simulateCodeQuality(bugRate, reworkRate);
    const technicalDebt = this.simulateTechnicalDebt(
      reworkRate,
      escalationRate
    );
    const customerSatisfaction = this.simulateCustomerSatisfaction(
      bugRate,
      meanTimeToResolution
    );
    const defectEscapeRate = this.simulateDefectEscapeRate(bugRate);

    return {
      bugRate: Math.round(bugRate * 10) / 10,
      reworkRate: Math.round(reworkRate * 10) / 10,
      defectEscapeRate: Math.round(defectEscapeRate * 10) / 10,
      testCoverage: Math.round(testCoverage * 10) / 10,
      codeQuality: Math.round(codeQuality * 10) / 10,
      technicalDebt: Math.round(technicalDebt * 10) / 10,
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
      meanTimeToResolution: Math.round(meanTimeToResolution * 10) / 10,
      firstTimeResolution: Math.round(firstTimeResolution * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
    };
  }

  /**
   * Gera insights baseados nas métricas
   */
  generateInsights(metrics: QualityMetrics): QualityInsight[] {
    const insights: QualityInsight[] = [];

    // Insight sobre bug rate
    if (metrics.bugRate > 30) {
      insights.push({
        type: 'critical',
        title: 'Taxa de Bugs Crítica',
        description: `A taxa de bugs está em ${metrics.bugRate}%, muito acima do ideal (≤15%)`,
        recommendation:
          'Implemente revisões de código mais rigorosas e testes automatizados',
        impact: 'high',
      });
    } else if (metrics.bugRate > 20) {
      insights.push({
        type: 'warning',
        title: 'Taxa de Bugs Elevada',
        description: `A taxa de bugs está em ${metrics.bugRate}%, acima do recomendado`,
        recommendation:
          'Revise processos de desenvolvimento e implemente mais testes',
        impact: 'medium',
      });
    } else if (metrics.bugRate < 10) {
      insights.push({
        type: 'improvement',
        title: 'Excelente Taxa de Bugs',
        description: `Taxa de bugs em ${metrics.bugRate}% está excelente!`,
        recommendation: 'Continue mantendo os padrões de qualidade atuais',
        impact: 'low',
      });
    }

    // Insight sobre rework rate
    if (metrics.reworkRate > 25) {
      insights.push({
        type: 'critical',
        title: 'Taxa de Retrabalho Crítica',
        description: `A taxa de retrabalho está em ${metrics.reworkRate}%, indicando problemas de qualidade`,
        recommendation:
          'Melhore a comunicação e especificações antes do desenvolvimento',
        impact: 'high',
      });
    } else if (metrics.reworkRate > 15) {
      insights.push({
        type: 'warning',
        title: 'Taxa de Retrabalho Elevada',
        description: `A taxa de retrabalho está em ${metrics.reworkRate}%`,
        recommendation: 'Revise processos de aprovação e feedback',
        impact: 'medium',
      });
    }

    // Insight sobre tempo de resolução
    if (metrics.meanTimeToResolution > 7) {
      insights.push({
        type: 'warning',
        title: 'Tempo de Resolução Elevado',
        description: `Tempo médio de resolução está em ${metrics.meanTimeToResolution} dias`,
        recommendation: 'Otimize processos de resolução e capacite a equipe',
        impact: 'medium',
      });
    }

    // Insight sobre satisfação do cliente
    if (metrics.customerSatisfaction < 70) {
      insights.push({
        type: 'critical',
        title: 'Satisfação do Cliente Baixa',
        description: `Satisfação do cliente está em ${metrics.customerSatisfaction}%`,
        recommendation:
          'Foque em melhorar a qualidade e comunicação com clientes',
        impact: 'high',
      });
    } else if (metrics.customerSatisfaction > 90) {
      insights.push({
        type: 'improvement',
        title: 'Excelente Satisfação do Cliente',
        description: `Satisfação do cliente em ${metrics.customerSatisfaction}% está excelente!`,
        recommendation: 'Continue mantendo o alto padrão de qualidade',
        impact: 'low',
      });
    }

    // Insight sobre dívida técnica
    if (metrics.technicalDebt > 70) {
      insights.push({
        type: 'warning',
        title: 'Dívida Técnica Elevada',
        description: `Dívida técnica está em ${metrics.technicalDebt}%`,
        recommendation: 'Planeje sprints de refatoração e melhoria de código',
        impact: 'medium',
      });
    }

    return insights;
  }

  /**
   * Calcula tendências das métricas ao longo do tempo
   */
  calculateTrends(issues: JiraIssue[]): QualityTrend[] {
    const trends: QualityTrend[] = [];
    const now = new Date();

    // Calcular métricas para os últimos 4 períodos (semanas)
    for (let i = 3; i >= 0; i--) {
      const periodStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const periodEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const periodIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created >= periodStart && created < periodEnd;
      });

      const metrics = this.calculateQualityMetrics(periodIssues);
      trends.push({
        period: `Semana ${4 - i}`,
        metrics,
      });
    }

    return trends;
  }

  /**
   * Obtém issues que são bugs
   */
  private getBugIssues(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(issue => {
      const issueType = issue.fields.issuetype.name.toLowerCase();
      const summary = issue.fields.summary.toLowerCase();
      return (
        issueType.includes('bug') ||
        issueType.includes('defect') ||
        summary.includes('bug') ||
        summary.includes('erro') ||
        summary.includes('falha')
      );
    });
  }

  /**
   * Obtém issues que foram reabertas
   */
  private getReopenedIssues(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(issue => {
      // Simular reabertura baseada em atualizações múltiplas
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      const daysDiff =
        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      // Se foi atualizado várias vezes após a criação, provavelmente foi reaberto
      return daysDiff > 1 && issue.fields.updated !== issue.fields.created;
    });
  }

  /**
   * Obtém issues resolvidas
   */
  private getResolvedIssues(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(issue => {
      const status = issue.fields.status.name.toLowerCase();
      return (
        status.includes('resolved') ||
        status.includes('closed') ||
        status.includes('done') ||
        status.includes('concluído')
      );
    });
  }

  /**
   * Obtém issues escaladas
   */
  private getEscalatedIssues(issues: JiraIssue[]): JiraIssue[] {
    return issues.filter(issue => {
      const priority = issue.fields.priority.name.toLowerCase();
      const summary = issue.fields.summary.toLowerCase();
      return (
        priority.includes('highest') ||
        priority.includes('critical') ||
        summary.includes('escalation') ||
        summary.includes('urgent')
      );
    });
  }

  /**
   * Calcula tempo médio de resolução
   */
  private calculateMeanTimeToResolution(resolvedIssues: JiraIssue[]): number {
    if (resolvedIssues.length === 0) return 0;

    const totalDays = resolvedIssues.reduce((sum, issue) => {
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      const days =
        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return totalDays / resolvedIssues.length;
  }

  /**
   * Calcula taxa de resolução na primeira tentativa
   */
  private calculateFirstTimeResolution(resolvedIssues: JiraIssue[]): number {
    if (resolvedIssues.length === 0) return 0;

    const firstTimeResolved = resolvedIssues.filter(issue => {
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      const daysDiff =
        (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      // Se foi resolvido em menos de 2 dias, provavelmente foi na primeira tentativa
      return daysDiff <= 2;
    });

    return (firstTimeResolved.length / resolvedIssues.length) * 100;
  }

  /**
   * Simula cobertura de testes baseada na taxa de bugs
   */
  private simulateTestCoverage(bugRate: number): number {
    // Quanto maior a taxa de bugs, menor a cobertura de testes
    return Math.max(20, 100 - bugRate * 2);
  }

  /**
   * Simula qualidade do código baseada na taxa de bugs e retrabalho
   */
  private simulateCodeQuality(bugRate: number, reworkRate: number): number {
    // Quanto maior a taxa de bugs e retrabalho, menor a qualidade
    return Math.max(30, 100 - (bugRate + reworkRate) * 1.5);
  }

  /**
   * Simula dívida técnica baseada na taxa de retrabalho e escalação
   */
  private simulateTechnicalDebt(
    reworkRate: number,
    escalationRate: number
  ): number {
    // Quanto maior a taxa de retrabalho e escalação, maior a dívida técnica
    return Math.min(100, (reworkRate + escalationRate) * 2);
  }

  /**
   * Simula satisfação do cliente baseada na taxa de bugs e tempo de resolução
   */
  private simulateCustomerSatisfaction(
    bugRate: number,
    meanTimeToResolution: number
  ): number {
    // Quanto maior a taxa de bugs e tempo de resolução, menor a satisfação
    const bugImpact = bugRate * 0.5;
    const timeImpact = Math.min(20, meanTimeToResolution * 2);
    return Math.max(40, 100 - bugImpact - timeImpact);
  }

  /**
   * Simula taxa de escape de defeitos baseada na taxa de bugs
   */
  private simulateDefectEscapeRate(bugRate: number): number {
    // Quanto maior a taxa de bugs, maior a chance de escape para produção
    return Math.min(50, bugRate * 0.3);
  }

  /**
   * Retorna métricas padrão quando não há dados
   */
  private getDefaultMetrics(): QualityMetrics {
    return {
      bugRate: 0,
      reworkRate: 0,
      defectEscapeRate: 0,
      testCoverage: 0,
      codeQuality: 0,
      technicalDebt: 0,
      customerSatisfaction: 0,
      meanTimeToResolution: 0,
      firstTimeResolution: 0,
      escalationRate: 0,
    };
  }

  /**
   * Obtém score geral de qualidade
   */
  getQualityScore(metrics: QualityMetrics): number {
    const weights = {
      bugRate: 0.2,
      reworkRate: 0.15,
      defectEscapeRate: 0.1,
      testCoverage: 0.15,
      codeQuality: 0.15,
      technicalDebt: 0.1,
      customerSatisfaction: 0.15,
    };

    // Normalizar métricas (algumas são inversas)
    const normalizedMetrics = {
      bugRate: Math.max(0, 100 - metrics.bugRate * 2),
      reworkRate: Math.max(0, 100 - metrics.reworkRate * 2),
      defectEscapeRate: Math.max(0, 100 - metrics.defectEscapeRate * 2),
      testCoverage: metrics.testCoverage,
      codeQuality: metrics.codeQuality,
      technicalDebt: Math.max(0, 100 - metrics.technicalDebt),
      customerSatisfaction: metrics.customerSatisfaction,
    };

    return Math.round(
      Object.entries(weights).reduce((score, [key, weight]) => {
        return (
          score +
          normalizedMetrics[key as keyof typeof normalizedMetrics] * weight
        );
      }, 0)
    );
  }
}

export const qualityMetricsService = new QualityMetricsService();

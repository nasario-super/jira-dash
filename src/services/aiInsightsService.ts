import { JiraIssue, SprintData } from '../types/jira.types';

export interface AIInsight {
  id: string;
  type: 'performance' | 'trend' | 'anomaly' | 'recommendation' | 'risk';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metrics: Record<string, any>;
  recommendations: string[];
  timestamp: Date;
  priority: number; // 1-10
}

export interface TrendAnalysis {
  metric: string;
  period: 'week' | 'month' | 'quarter';
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number; // percentage
  significance: number; // 0-100
  dataPoints: Array<{
    date: string;
    value: number;
    predicted?: number;
  }>;
}

export interface AnomalyDetection {
  type: 'spike' | 'drop' | 'pattern_break' | 'outlier';
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  value: number;
  expectedValue: number;
  deviation: number; // percentage
  description: string;
  context: Record<string, any>;
}

export class AIInsightsService {
  private static instance: AIInsightsService;

  public static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  // Generate comprehensive AI insights
  async generateInsights(
    issues: JiraIssue[],
    sprints: SprintData[],
    timeRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<AIInsight[]> {
    console.log('🤖 AI Insights: Gerando análises automáticas...');

    const insights: AIInsight[] = [];

    try {
      // 1. Performance Analysis
      const performanceInsights = await this.analyzePerformance(
        issues,
        sprints,
        timeRange
      );
      insights.push(...performanceInsights);

      // 2. Trend Analysis
      const trendInsights = await this.analyzeTrends(issues, timeRange);
      insights.push(...trendInsights);

      // 3. Anomaly Detection
      const anomalyInsights = await this.detectAnomalies(issues, timeRange);
      insights.push(...anomalyInsights);

      // 4. Risk Assessment
      const riskInsights = await this.assessRisks(issues, sprints);
      insights.push(...riskInsights);

      // 5. Recommendations
      const recommendationInsights = await this.generateRecommendations(
        issues,
        sprints
      );
      insights.push(...recommendationInsights);

      // Sort by priority and confidence
      insights.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.confidence - a.confidence;
      });

      console.log(`✅ AI Insights: ${insights.length} insights gerados`);
      return insights;
    } catch (error) {
      console.error('❌ AI Insights Error:', error);
      return [];
    }
  }

  // Performance Analysis
  private async analyzePerformance(
    issues: JiraIssue[],
    sprints: SprintData[],
    timeRange: string
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Calculate key metrics
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    const velocity = this.calculateVelocity(issues, sprints);
    const cycleTime = this.calculateCycleTime(issues);
    const bugRate = this.calculateBugRate(issues);
    const reworkRate = this.calculateReworkRate(issues);

    // Velocity Analysis
    if (velocity < 10) {
      insights.push({
        id: 'low-velocity',
        type: 'performance',
        title: 'Velocidade Baixa Detectada',
        description: `A velocidade da equipe está em ${velocity.toFixed(
          1
        )} pontos/sprint, considerada baixa para o tamanho da equipe.`,
        confidence: 85,
        impact: 'high',
        category: 'Performance',
        metrics: { velocity, threshold: 15 },
        recommendations: [
          'Revisar estimativas de story points',
          'Identificar gargalos no processo',
          'Considerar pair programming',
          'Avaliar complexidade das tarefas',
        ],
        timestamp: new Date(),
        priority: 8,
      });
    }

    // Cycle Time Analysis
    if (cycleTime > 14) {
      insights.push({
        id: 'high-cycle-time',
        type: 'performance',
        title: 'Tempo de Ciclo Elevado',
        description: `O tempo médio de ciclo está em ${cycleTime.toFixed(
          1
        )} dias, acima do ideal de 7-10 dias.`,
        confidence: 90,
        impact: 'high',
        category: 'Performance',
        metrics: { cycleTime, ideal: 10 },
        recommendations: [
          'Implementar WIP limits',
          'Revisar processo de review',
          'Automatizar testes',
          'Melhorar comunicação entre equipes',
        ],
        timestamp: new Date(),
        priority: 9,
      });
    }

    // Bug Rate Analysis
    if (bugRate > 0.3) {
      insights.push({
        id: 'high-bug-rate',
        type: 'performance',
        title: 'Taxa de Bugs Elevada',
        description: `A taxa de bugs está em ${(bugRate * 100).toFixed(
          1
        )}%, considerada alta.`,
        confidence: 80,
        impact: 'medium',
        category: 'Quality',
        metrics: { bugRate, threshold: 0.2 },
        recommendations: [
          'Implementar testes automatizados',
          'Revisar processo de QA',
          'Melhorar definição de critérios de aceite',
          'Investigar causas raiz dos bugs',
        ],
        timestamp: new Date(),
        priority: 7,
      });
    }

    return insights;
  }

  // Trend Analysis
  private async analyzeTrends(
    issues: JiraIssue[],
    timeRange: string
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Analyze velocity trends
    const velocityTrend = this.analyzeVelocityTrend(issues, timeRange);
    if (
      velocityTrend.trend === 'decreasing' &&
      velocityTrend.significance > 70
    ) {
      insights.push({
        id: 'velocity-decline',
        type: 'trend',
        title: 'Declínio na Velocidade',
        description: `A velocidade da equipe está diminuindo consistentemente (${velocityTrend.changeRate.toFixed(
          1
        )}% por ${timeRange}).`,
        confidence: velocityTrend.significance,
        impact: 'high',
        category: 'Trends',
        metrics: velocityTrend,
        recommendations: [
          'Investigar causas do declínio',
          'Revisar carga de trabalho',
          'Avaliar burnout da equipe',
          'Implementar retrospectivas mais frequentes',
        ],
        timestamp: new Date(),
        priority: 9,
      });
    }

    // Analyze completion rate trends
    const completionTrend = this.analyzeCompletionTrend(issues, timeRange);
    if (
      completionTrend.trend === 'decreasing' &&
      completionTrend.significance > 60
    ) {
      insights.push({
        id: 'completion-decline',
        type: 'trend',
        title: 'Redução na Taxa de Conclusão',
        description: `A taxa de conclusão de issues está diminuindo (${completionTrend.changeRate.toFixed(
          1
        )}% por ${timeRange}).`,
        confidence: completionTrend.significance,
        impact: 'medium',
        category: 'Trends',
        metrics: completionTrend,
        recommendations: [
          'Revisar definição de "Done"',
          'Avaliar complexidade das tarefas',
          'Melhorar planejamento de sprint',
          'Identificar dependências externas',
        ],
        timestamp: new Date(),
        priority: 6,
      });
    }

    return insights;
  }

  // Anomaly Detection
  private async detectAnomalies(
    issues: JiraIssue[],
    timeRange: string
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Detect velocity spikes/drops
    const velocityAnomalies = this.detectVelocityAnomalies(issues, timeRange);
    insights.push(...velocityAnomalies);

    // Detect bug spikes
    const bugAnomalies = this.detectBugAnomalies(issues, timeRange);
    insights.push(...bugAnomalies);

    // Detect completion anomalies
    const completionAnomalies = this.detectCompletionAnomalies(
      issues,
      timeRange
    );
    insights.push(...completionAnomalies);

    return insights;
  }

  // Risk Assessment
  private async assessRisks(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Overdue issues risk
    const overdueIssues = issues.filter(issue => {
      if (!issue.fields.duedate) return false;
      return new Date(issue.fields.duedate) < new Date();
    });

    if (overdueIssues.length > 0) {
      insights.push({
        id: 'overdue-issues',
        type: 'risk',
        title: 'Issues Atrasadas',
        description: `${overdueIssues.length} issues estão atrasadas, representando risco para o cronograma.`,
        confidence: 95,
        impact: 'high',
        category: 'Risks',
        metrics: {
          overdueCount: overdueIssues.length,
          totalIssues: issues.length,
        },
        recommendations: [
          'Priorizar issues atrasadas',
          'Revisar estimativas de prazo',
          'Comunicar impactos aos stakeholders',
          'Implementar buffer de tempo',
        ],
        timestamp: new Date(),
        priority: 10,
      });
    }

    // High priority issues without assignee
    const unassignedHighPriority = issues.filter(
      issue => issue.fields.priority.name === 'High' && !issue.fields.assignee
    );

    if (unassignedHighPriority.length > 0) {
      insights.push({
        id: 'unassigned-high-priority',
        type: 'risk',
        title: 'Issues de Alta Prioridade Sem Assignee',
        description: `${unassignedHighPriority.length} issues de alta prioridade não possuem responsável atribuído.`,
        confidence: 90,
        impact: 'medium',
        category: 'Risks',
        metrics: { unassignedCount: unassignedHighPriority.length },
        recommendations: [
          'Atribuir responsáveis imediatamente',
          'Revisar processo de atribuição',
          'Implementar alertas automáticos',
          'Criar SLA para atribuição',
        ],
        timestamp: new Date(),
        priority: 8,
      });
    }

    return insights;
  }

  // Generate Recommendations
  private async generateRecommendations(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Process improvement recommendations
    const processInsights = this.analyzeProcess(issues, sprints);
    insights.push(...processInsights);

    // Team efficiency recommendations
    const efficiencyInsights = this.analyzeEfficiency(issues, sprints);
    insights.push(...efficiencyInsights);

    return insights;
  }

  // Helper methods for calculations
  private calculateVelocity(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): number {
    console.log('🔍 AI Insights - calculateVelocity Debug:', {
      totalIssues: issues.length,
      totalSprints: sprints.length,
      issuesSample: issues.slice(0, 3).map(issue => ({
        key: issue.key,
        status: issue.fields.status.name,
        statusCategory: issue.fields.status.statusCategory.name,
        type: issue.fields.issuetype.name,
      })),
    });

    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    console.log('🔍 AI Insights - completedIssues:', {
      completedCount: completedIssues.length,
      completedSample: completedIssues.slice(0, 3).map(issue => ({
        key: issue.key,
        status: issue.fields.status.name,
        type: issue.fields.issuetype.name,
      })),
    });

    // Estimate story points based on issue type
    const totalPoints = completedIssues.reduce((sum, issue) => {
      const type = issue.fields.issuetype.name;
      const points =
        type === 'Story' ? 3 : type === 'Task' ? 2 : type === 'Bug' ? 1 : 5;
      return sum + points;
    }, 0);

    const velocity = sprints.length > 0 ? totalPoints / sprints.length : 0;

    console.log('🔍 AI Insights - velocity calculation:', {
      totalPoints,
      sprintsLength: sprints.length,
      velocity,
    });

    return velocity;
  }

  private calculateCycleTime(issues: JiraIssue[]): number {
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    if (completedIssues.length === 0) return 0;

    const totalCycleTime = completedIssues.reduce((sum, issue) => {
      const created = new Date(issue.fields.created);
      const updated = new Date(issue.fields.updated);
      return sum + (updated.getTime() - created.getTime());
    }, 0);

    return totalCycleTime / completedIssues.length / (1000 * 60 * 60 * 24);
  }

  private calculateBugRate(issues: JiraIssue[]): number {
    const totalIssues = issues.length;
    const bugIssues = issues.filter(
      issue => issue.fields.issuetype.name === 'Bug'
    );

    return totalIssues > 0 ? bugIssues.length / totalIssues : 0;
  }

  private calculateReworkRate(issues: JiraIssue[]): number {
    // Simplified rework calculation based on status changes
    const reworkIssues = issues.filter(issue => {
      // If an issue has been updated multiple times after being "Done"
      // it might indicate rework
      return issue.fields.updated !== issue.fields.created;
    });

    return issues.length > 0 ? reworkIssues.length / issues.length : 0;
  }

  // Trend analysis methods
  private analyzeVelocityTrend(issues: JiraIssue[], timeRange: string) {
    // Simplified trend analysis
    const recentIssues = this.getRecentIssues(issues, timeRange);
    const olderIssues = this.getOlderIssues(issues, timeRange);

    const recentVelocity = this.calculateVelocity(recentIssues, []);
    const olderVelocity = this.calculateVelocity(olderIssues, []);

    const changeRate =
      olderVelocity > 0
        ? ((recentVelocity - olderVelocity) / olderVelocity) * 100
        : 0;

    return {
      metric: 'velocity',
      period: timeRange as any,
      trend:
        changeRate > 10
          ? 'increasing'
          : changeRate < -10
          ? 'decreasing'
          : 'stable',
      changeRate,
      significance: Math.abs(changeRate),
      dataPoints: [],
    };
  }

  private analyzeCompletionTrend(issues: JiraIssue[], timeRange: string) {
    const recentIssues = this.getRecentIssues(issues, timeRange);
    const olderIssues = this.getOlderIssues(issues, timeRange);

    const recentCompletion =
      recentIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      ).length / recentIssues.length;

    const olderCompletion =
      olderIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      ).length / olderIssues.length;

    const changeRate =
      olderCompletion > 0
        ? ((recentCompletion - olderCompletion) / olderCompletion) * 100
        : 0;

    return {
      metric: 'completion',
      period: timeRange as any,
      trend:
        changeRate > 10
          ? 'increasing'
          : changeRate < -10
          ? 'decreasing'
          : 'stable',
      changeRate,
      significance: Math.abs(changeRate),
      dataPoints: [],
    };
  }

  // Anomaly detection methods
  private detectVelocityAnomalies(
    issues: JiraIssue[],
    timeRange: string
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Simplified anomaly detection
    const velocity = this.calculateVelocity(issues, []);
    const expectedVelocity = 15; // Expected baseline

    if (velocity > expectedVelocity * 1.5) {
      insights.push({
        id: 'velocity-spike',
        type: 'anomaly',
        title: 'Pico de Velocidade Detectado',
        description: `A velocidade atual (${velocity.toFixed(1)}) está ${(
          ((velocity - expectedVelocity) / expectedVelocity) *
          100
        ).toFixed(1)}% acima do esperado.`,
        confidence: 75,
        impact: 'low',
        category: 'Anomaly',
        metrics: { velocity, expected: expectedVelocity },
        recommendations: [
          'Verificar se as estimativas estão corretas',
          'Avaliar se há trabalho extra não contabilizado',
          'Documentar práticas que levaram ao aumento',
        ],
        timestamp: new Date(),
        priority: 3,
      });
    }

    return insights;
  }

  private detectBugAnomalies(
    issues: JiraIssue[],
    timeRange: string
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    const recentIssues = this.getRecentIssues(issues, timeRange);
    const bugRate = this.calculateBugRate(recentIssues);

    if (bugRate > 0.4) {
      insights.push({
        id: 'bug-spike',
        type: 'anomaly',
        title: 'Pico de Bugs Detectado',
        description: `A taxa de bugs está em ${(bugRate * 100).toFixed(
          1
        )}%, significativamente acima do normal.`,
        confidence: 85,
        impact: 'high',
        category: 'Anomaly',
        metrics: { bugRate, threshold: 0.2 },
        recommendations: [
          'Investigar causa raiz do aumento',
          'Revisar processo de QA',
          'Implementar testes adicionais',
          'Comunicar com a equipe de desenvolvimento',
        ],
        timestamp: new Date(),
        priority: 8,
      });
    }

    return insights;
  }

  private detectCompletionAnomalies(
    issues: JiraIssue[],
    timeRange: string
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    const recentIssues = this.getRecentIssues(issues, timeRange);
    const completionRate =
      recentIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      ).length / recentIssues.length;

    if (completionRate < 0.3) {
      insights.push({
        id: 'completion-drop',
        type: 'anomaly',
        title: 'Queda na Taxa de Conclusão',
        description: `A taxa de conclusão está em ${(
          completionRate * 100
        ).toFixed(1)}%, abaixo do esperado.`,
        confidence: 80,
        impact: 'medium',
        category: 'Anomaly',
        metrics: { completionRate, threshold: 0.5 },
        recommendations: [
          'Identificar bloqueios nas tarefas',
          'Revisar definição de "Done"',
          'Avaliar carga de trabalho da equipe',
          'Implementar daily standups mais eficazes',
        ],
        timestamp: new Date(),
        priority: 6,
      });
    }

    return insights;
  }

  // Process and efficiency analysis
  private analyzeProcess(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Analyze process efficiency
    const cycleTime = this.calculateCycleTime(issues);
    const reworkRate = this.calculateReworkRate(issues);

    if (cycleTime > 21) {
      insights.push({
        id: 'process-inefficiency',
        type: 'recommendation',
        title: 'Processo Ineficiente Detectado',
        description: `O tempo de ciclo médio está em ${cycleTime.toFixed(
          1
        )} dias, indicando ineficiência no processo.`,
        confidence: 90,
        impact: 'high',
        category: 'Process',
        metrics: { cycleTime, ideal: 14 },
        recommendations: [
          'Implementar Kanban com WIP limits',
          'Revisar processo de aprovação',
          'Automatizar testes e deploy',
          'Melhorar comunicação entre equipes',
        ],
        timestamp: new Date(),
        priority: 9,
      });
    }

    return insights;
  }

  private analyzeEfficiency(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    // Analyze team efficiency
    const velocity = this.calculateVelocity(issues, sprints);
    const bugRate = this.calculateBugRate(issues);

    if (velocity > 0 && bugRate < 0.1) {
      insights.push({
        id: 'high-efficiency',
        type: 'recommendation',
        title: 'Equipe de Alta Eficiência',
        description: `A equipe está demonstrando alta eficiência com boa velocidade e baixa taxa de bugs.`,
        confidence: 85,
        impact: 'low',
        category: 'Efficiency',
        metrics: { velocity, bugRate },
        recommendations: [
          'Documentar práticas de sucesso',
          'Compartilhar conhecimento com outras equipes',
          'Considerar aumentar a complexidade dos projetos',
          'Manter o ritmo atual',
        ],
        timestamp: new Date(),
        priority: 2,
      });
    }

    return insights;
  }

  // Helper methods
  private getRecentIssues(issues: JiraIssue[], timeRange: string): JiraIssue[] {
    const now = new Date();
    const daysBack = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return issues.filter(issue => new Date(issue.fields.created) >= cutoff);
  }

  private getOlderIssues(issues: JiraIssue[], timeRange: string): JiraIssue[] {
    const now = new Date();
    const daysBack =
      timeRange === 'week' ? 14 : timeRange === 'month' ? 60 : 180;
    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return issues.filter(issue => {
      const created = new Date(issue.fields.created);
      return (
        created < cutoff &&
        created >= new Date(now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000)
      );
    });
  }
}

export default AIInsightsService;

import { JiraIssue, SprintData, ProjectData } from '../types/jira.types';

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PerformanceMetrics {
  velocity: number;
  throughput: number;
  cycleTime: number;
  leadTime: number;
  workInProgress: number;
  efficiency: number;
}

export interface PredictiveData {
  forecast: {
    nextSprint: number;
    nextMonth: number;
    nextQuarter: number;
  };
  confidence: number;
  factors: string[];
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  metrics: Record<string, number>;
  timestamp: Date;
}

export class AnalyticsService {
  // Trend Analysis
  static analyzeTrends(
    issues: JiraIssue[],
    period: 'week' | 'month' | 'quarter' = 'month'
  ): TrendData[] {
    console.log('📈 AnalyticsService: Analisando tendências', {
      totalIssues: issues.length,
      period,
    });

    const now = new Date();
    const periods = this.getPeriods(now, period, 12);

    const trends = periods.map(period => {
      const periodIssues = issues.filter(issue => {
        const created = new Date(issue.fields.created);
        return created >= period.start && created <= period.end;
      });

      const completedIssues = periodIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      );

      const previousPeriod = periods[periods.indexOf(period) - 1];
      const previousIssues = previousPeriod
        ? issues.filter(issue => {
            const created = new Date(issue.fields.created);
            return (
              created >= previousPeriod.start && created <= previousPeriod.end
            );
          })
        : [];

      const previousCompleted = previousIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      );

      const change = completedIssues.length - previousCompleted.length;
      const changePercent =
        previousCompleted.length > 0
          ? (change / previousCompleted.length) * 100
          : 0;

      return {
        period: period.label,
        value: completedIssues.length,
        change,
        changePercent,
      };
    });

    console.log('📊 Tendências calculadas:', trends);
    return trends;
  }

  // Performance Metrics
  static calculatePerformanceMetrics(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): PerformanceMetrics {
    console.log('📊 AnalyticsService: Calculando métricas de performance', {
      totalIssues: issues.length,
      totalSprints: sprints.length,
    });

    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    console.log('✅ Issues concluídas:', completedIssues.length);

    // Velocity (story points completed per sprint)
    const velocity = this.calculateVelocity(completedIssues, sprints);

    // Throughput (issues completed per week)
    const throughput = this.calculateThroughput(completedIssues);

    // Cycle Time (average time from start to completion)
    const cycleTime = this.calculateCycleTime(completedIssues);

    // Lead Time (average time from creation to completion)
    const leadTime = this.calculateLeadTime(completedIssues);

    // Work in Progress
    const workInProgress = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'In Progress'
    ).length;

    // Efficiency (completed vs total)
    const efficiency =
      issues.length > 0 ? (completedIssues.length / issues.length) * 100 : 0;

    return {
      velocity,
      throughput,
      cycleTime,
      leadTime,
      workInProgress,
      efficiency,
    };
  }

  // Predictive Analytics
  static generatePredictions(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): PredictiveData {
    const trends = this.analyzeTrends(issues, 'month');
    const performance = this.calculatePerformanceMetrics(issues, sprints);

    console.log('🔮 AnalyticsService: Gerando previsões', {
      trendsCount: trends.length,
      performance,
      trends: trends.slice(-3), // Last 3 months for debugging
    });

    // Enhanced prediction algorithm
    const recentTrends = trends.slice(-6); // Last 6 months
    const currentValue = recentTrends[recentTrends.length - 1]?.value || 0;

    // Calculate average growth rate
    let avgGrowth = 0;
    if (recentTrends.length > 1) {
      const growthRates = [];
      for (let i = 1; i < recentTrends.length; i++) {
        const prevValue = recentTrends[i - 1].value;
        const currentTrendValue = recentTrends[i].value;
        if (prevValue > 0) {
          growthRates.push((currentTrendValue - prevValue) / prevValue);
        }
      }
      avgGrowth =
        growthRates.length > 0
          ? growthRates.reduce((sum, rate) => sum + rate, 0) /
            growthRates.length
          : 0;
    }

    // Base predictions on throughput and velocity
    const baseThroughput = performance.throughput;
    const baseVelocity = performance.velocity;

    // Calculate forecasts with multiple approaches
    const trendBasedForecast = Math.max(
      0,
      currentValue + avgGrowth * currentValue
    );
    const throughputBasedForecast = baseThroughput * 4; // 4 weeks
    const velocityBasedForecast = baseVelocity * 0.5; // Half sprint

    // Use the most reliable forecast
    const nextSprint = Math.max(
      1,
      Math.round(velocityBasedForecast || throughputBasedForecast * 0.25)
    );
    const nextMonth = Math.max(
      1,
      Math.round(throughputBasedForecast || trendBasedForecast)
    );
    const nextQuarter = Math.max(1, Math.round(nextMonth * 3));

    console.log('📊 Previsões calculadas:', {
      currentValue,
      avgGrowth,
      baseThroughput,
      baseVelocity,
      nextSprint,
      nextMonth,
      nextQuarter,
    });

    return {
      forecast: {
        nextSprint,
        nextMonth,
        nextQuarter,
      },
      confidence: this.calculateConfidence(recentTrends),
      factors: this.identifyFactors(issues, performance),
    };
  }

  // Insights Engine
  static generateInsights(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): Insight[] {
    const insights: Insight[] = [];
    const performance = this.calculatePerformanceMetrics(issues, sprints);
    const trends = this.analyzeTrends(issues, 'month');
    const predictions = this.generatePredictions(issues, sprints);

    // Performance Insights
    if (performance.efficiency < 30) {
      insights.push({
        id: 'low-efficiency',
        type: 'warning',
        title: 'Baixa Eficiência',
        description: `Apenas ${performance.efficiency.toFixed(
          1
        )}% das issues foram concluídas`,
        impact: 'high',
        recommendation: 'Revisar processos e identificar gargalos',
        metrics: { efficiency: performance.efficiency },
        timestamp: new Date(),
      });
    }

    if (performance.workInProgress > 10) {
      insights.push({
        id: 'high-wip',
        type: 'warning',
        title: 'Alto Work in Progress',
        description: `${performance.workInProgress} issues em progresso simultâneo`,
        impact: 'medium',
        recommendation: 'Limitar WIP para melhorar fluxo',
        metrics: { workInProgress: performance.workInProgress },
        timestamp: new Date(),
      });
    }

    // Trend Insights
    const recentTrend = trends[trends.length - 1];
    if (recentTrend && recentTrend.changePercent < -20) {
      insights.push({
        id: 'declining-trend',
        type: 'critical',
        title: 'Tendência Declinante',
        description: `Produtividade caiu ${Math.abs(
          recentTrend.changePercent
        ).toFixed(1)}% no último período`,
        impact: 'high',
        recommendation: 'Investigar causas da queda de produtividade',
        metrics: { changePercent: recentTrend.changePercent },
        timestamp: new Date(),
      });
    }

    if (recentTrend && recentTrend.changePercent > 20) {
      insights.push({
        id: 'improving-trend',
        type: 'success',
        title: 'Tendência Positiva',
        description: `Produtividade aumentou ${recentTrend.changePercent.toFixed(
          1
        )}% no último período`,
        impact: 'medium',
        recommendation: 'Manter práticas que estão funcionando',
        metrics: { changePercent: recentTrend.changePercent },
        timestamp: new Date(),
      });
    }

    // Predictive Insights
    const currentValue = recentTrend?.value || 0;
    if (predictions.forecast.nextMonth < currentValue * 0.8) {
      insights.push({
        id: 'forecast-decline',
        type: 'warning',
        title: 'Previsão de Declínio',
        description: 'Modelo prevê queda na produtividade no próximo mês',
        impact: 'medium',
        recommendation: 'Planejar ações preventivas',
        metrics: { forecast: predictions.forecast.nextMonth },
        timestamp: new Date(),
      });
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  // Helper Methods
  private static getPeriods(now: Date, period: string, count: number) {
    const periods = [];
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(now);
      const end = new Date(now);

      switch (period) {
        case 'week':
          start.setDate(now.getDate() - (i + 1) * 7);
          end.setDate(now.getDate() - i * 7);
          break;
        case 'month':
          start.setMonth(now.getMonth() - (i + 1));
          end.setMonth(now.getMonth() - i);
          break;
        case 'quarter':
          start.setMonth(now.getMonth() - (i + 1) * 3);
          end.setMonth(now.getMonth() - i * 3);
          break;
      }

      periods.push({
        start,
        end,
        label: this.formatPeriodLabel(start, period),
      });
    }
    return periods.reverse();
  }

  private static formatPeriodLabel(date: Date, period: string): string {
    switch (period) {
      case 'week':
        return `Semana ${date.getWeek()}`;
      case 'month':
        return date.toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric',
        });
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      default:
        return date.toLocaleDateString('pt-BR');
    }
  }

  private static calculateVelocity(
    issues: JiraIssue[],
    sprints: SprintData[]
  ): number {
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    if (sprints.length === 0) return 0;

    // Para dados reais, vamos usar uma estimativa baseada no tipo de issue
    const totalStoryPoints = completedIssues.reduce((sum, issue) => {
      // Estimativa baseada no tipo de issue
      let points = 1; // Default

      if (issue.fields.issuetype.name === 'Story') {
        points = 3; // Story média
      } else if (issue.fields.issuetype.name === 'Task') {
        points = 2; // Task média
      } else if (issue.fields.issuetype.name === 'Bug') {
        points = 1; // Bug pequeno
      } else if (issue.fields.issuetype.name === 'Epic') {
        points = 8; // Epic grande
      }

      return sum + points;
    }, 0);

    const velocity = totalStoryPoints / sprints.length;
    console.log('📈 Velocidade calculada:', {
      totalStoryPoints,
      sprintsCount: sprints.length,
      velocity,
    });

    return velocity;
  }

  private static calculateThroughput(issues: JiraIssue[]): number {
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);

    const recentCompleted = completedIssues.filter(issue => {
      const completed = new Date(issue.fields.updated);
      return completed >= fourWeeksAgo;
    });

    const throughput = recentCompleted.length / 4; // per week
    console.log('📊 Throughput calculado:', {
      totalCompleted: completedIssues.length,
      recentCompleted: recentCompleted.length,
      throughput,
    });

    return throughput;
  }

  private static calculateCycleTime(issues: JiraIssue[]): number {
    const completedIssues = issues.filter(
      issue => issue.fields.status.statusCategory.name === 'Done'
    );

    if (completedIssues.length === 0) return 0;

    const totalCycleTime = completedIssues.reduce((sum, issue) => {
      const created = new Date(issue.fields.created);
      const completed = new Date(issue.fields.updated);
      return sum + (completed.getTime() - created.getTime());
    }, 0);

    const cycleTime =
      totalCycleTime / completedIssues.length / (1000 * 60 * 60 * 24); // in days
    console.log('⏱️ Cycle Time calculado:', {
      completedIssues: completedIssues.length,
      cycleTime: cycleTime.toFixed(2),
    });

    return cycleTime;
  }

  private static calculateLeadTime(issues: JiraIssue[]): number {
    return this.calculateCycleTime(issues); // Simplified for demo
  }

  private static calculateConfidence(trends: TrendData[]): number {
    if (trends.length < 3) return 0.6; // Higher base confidence for mock data

    const values = trends.map(t => t.value);
    const variance = this.calculateVariance(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Enhanced confidence calculation
    let confidence = 0.7; // Base confidence for mock data

    if (mean > 0) {
      // Higher confidence for consistent data
      const coefficientOfVariation = Math.sqrt(variance) / mean;
      confidence = Math.max(
        0.6,
        Math.min(0.95, 1 - coefficientOfVariation * 0.5)
      );
    }

    // Boost confidence for mock data
    if (trends.length >= 6) {
      confidence = Math.min(0.95, confidence + 0.1);
    }

    console.log('🎯 Confiança calculada:', {
      trendsCount: trends.length,
      mean,
      variance,
      confidence: confidence.toFixed(2),
    });

    return confidence;
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private static identifyFactors(
    issues: JiraIssue[],
    performance: PerformanceMetrics
  ): string[] {
    const factors = [];

    if (performance.cycleTime > 14) {
      factors.push('Ciclo de desenvolvimento longo');
    }

    if (performance.workInProgress > 5) {
      factors.push('Muitas tarefas em paralelo');
    }

    if (performance.efficiency < 50) {
      factors.push('Baixa taxa de conclusão');
    }

    return factors;
  }
}

// Extend Date prototype for week calculation
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil(
    ((this.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
  );
};

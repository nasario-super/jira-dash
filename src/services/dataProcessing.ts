// Funções de processamento de dados para gráficos otimizados

interface JiraIssue {
  fields: {
    status: { name: string };
    issuetype: { name: string };
    priority: { name: string };
    assignee: { displayName: string };
    created: string;
    updated: string;
    customfield_10016?: number; // Story points
    sprint?: any;
  };
}

/**
 * Processar dados para gráfico de burndown
 */
export function processBurndownData(issues: JiraIssue[]) {
  // Lógica para calcular burndown baseado nas issues
  // Por enquanto, retornar dados mockados
  const days = 14;
  const totalPoints = 100;

  return Array.from({ length: days }, (_, i) => ({
    dia: `Dia ${i + 1}`,
    ideal: Math.max(0, totalPoints - (totalPoints / days) * (i + 1)),
    real: Math.max(
      0,
      totalPoints - (totalPoints / days) * (i + 1) + Math.random() * 10 - 5
    ),
  }));
}

/**
 * Processar distribuição por status
 */
export function processStatusData(issues: JiraIssue[]) {
  const statusCount: Record<string, number> = {};

  issues.forEach(issue => {
    const status = issue.fields.status.name;
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  return Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));
}

/**
 * Processar velocity
 */
export function processVelocityData(issues: JiraIssue[]) {
  // Agrupar por sprint e calcular story points
  const sprintData: Record<string, { planejado: number; concluido: number }> =
    {};

  issues.forEach(issue => {
    const sprint = issue.fields.sprint?.name || 'Sem Sprint';
    const points = issue.fields.customfield_10016 || 0;

    if (!sprintData[sprint]) {
      sprintData[sprint] = { planejado: 0, concluido: 0 };
    }

    sprintData[sprint].planejado += points;

    // Se status é "Done", conta como concluído
    if (
      issue.fields.status.name === 'Done' ||
      issue.fields.status.name === 'Concluído'
    ) {
      sprintData[sprint].concluido += points;
    }
  });

  return Object.entries(sprintData).map(([sprint, data]) => ({
    sprint,
    ...data,
  }));
}

/**
 * Processar tipos de issue
 */
export function processIssueTypeData(issues: JiraIssue[]) {
  const typeCount: Record<string, number> = {};

  issues.forEach(issue => {
    const type = issue.fields.issuetype.name;
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount).map(([name, count]) => ({
    name,
    count,
  }));
}

/**
 * Processar timeline
 */
export function processTimelineData(issues: JiraIssue[]) {
  // Agrupar por data de conclusão
  const timelineData: Record<string, number> = {};

  issues.forEach(issue => {
    if (
      issue.fields.status.name === 'Done' ||
      issue.fields.status.name === 'Concluído'
    ) {
      const date = new Date(issue.fields.updated).toISOString().split('T')[0];
      timelineData[date] = (timelineData[date] || 0) + 1;
    }
  });

  return Object.entries(timelineData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, concluidas]) => ({
      data,
      concluidas,
    }));
}

/**
 * Processar prioridade por status
 */
export function processPriorityByStatus(issues: JiraIssue[]) {
  const distribution: Record<string, Record<string, number>> = {};

  issues.forEach(issue => {
    const status = issue.fields.status.name;
    const priority = issue.fields.priority.name.toLowerCase();

    if (!distribution[status]) {
      distribution[status] = { highest: 0, high: 0, medium: 0, low: 0 };
    }

    if (priority.includes('highest')) {
      distribution[status].highest++;
    } else if (priority.includes('high')) {
      distribution[status].high++;
    } else if (priority.includes('medium')) {
      distribution[status].medium++;
    } else {
      distribution[status].low++;
    }
  });

  return Object.entries(distribution).map(([status, priorities]) => ({
    status,
    ...priorities,
  }));
}

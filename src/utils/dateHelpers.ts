import { format, formatDistance, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ptBR });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true, 
    locale: ptBR 
  });
};

export const getRelativeDateLabel = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Hoje';
  }
  
  if (isYesterday(dateObj)) {
    return 'Ontem';
  }
  
  if (isThisWeek(dateObj)) {
    return 'Esta semana';
  }
  
  if (isThisMonth(dateObj)) {
    return 'Este mês';
  }
  
  return formatDate(dateObj);
};

export const getDateRangeOptions = () => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  return [
    { label: 'Última semana', value: { start: formatDate(oneWeekAgo), end: formatDate(now) } },
    { label: 'Último mês', value: { start: formatDate(oneMonthAgo), end: formatDate(now) } },
    { label: 'Últimos 3 meses', value: { start: formatDate(threeMonthsAgo), end: formatDate(now) } },
    { label: 'Últimos 6 meses', value: { start: formatDate(sixMonthsAgo), end: formatDate(now) } },
    { label: 'Este ano', value: { start: formatDate(new Date(now.getFullYear(), 0, 1)), end: formatDate(now) } },
  ];
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSprintProgress = (sprint: { startDate: string; endDate: string }): number => {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const now = new Date();
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(progress);
};


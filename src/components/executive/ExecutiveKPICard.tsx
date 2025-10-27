import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ExecutiveKPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  target?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const ExecutiveKPICard: React.FC<ExecutiveKPICardProps> = ({
  title,
  value,
  previousValue,
  target,
  unit = '',
  trend,
  trendValue,
  status = 'good',
  description,
  icon,
  loading = false,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateProgress = () => {
    if (!target || !value) return 0;
    const current = typeof value === 'string' ? parseFloat(value) : value;
    const targetValue =
      typeof target === 'string' ? parseFloat(target) : target;
    return Math.min((current / targetValue) * 100, 100);
  };

  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-2 bg-gray-200 rounded w-full animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full ${getStatusColor(status)} ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700">
              {title}
            </CardTitle>
            {icon && <div className="p-2 rounded-lg bg-white/50">{icon}</div>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Valor Principal */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>

          {/* Trend e Comparação */}
          {trend && trendValue !== undefined && (
            <div className="flex items-center space-x-2">
              {getTrendIcon(trend)}
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {trendValue > 0 ? '+' : ''}
                {trendValue}%
              </span>
              <span className="text-xs text-gray-500">vs. anterior</span>
            </div>
          )}

          {/* Target e Progresso */}
          {target && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Meta:{' '}
                  {typeof target === 'number'
                    ? target.toLocaleString()
                    : target}{' '}
                  {unit}
                </span>
                <span>{calculateProgress().toFixed(0)}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          )}

          {/* Descrição */}
          {description && (
            <p className="text-xs text-gray-600">{description}</p>
          )}

          {/* Status Badge */}
          <div className="flex justify-end">
            <Badge
              variant="outline"
              className={`text-xs ${
                status === 'excellent'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : status === 'good'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {status === 'excellent' && (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              {status === 'critical' && (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExecutiveKPICard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Zap,
} from 'lucide-react';

interface AdvancedMetricsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  loading?: boolean;
  subMetrics?: {
    label: string;
    value: number | string;
    color?: string;
  }[];
}

const AdvancedMetricsCard: React.FC<AdvancedMetricsCardProps> = ({
  title,
  value,
  previousValue,
  unit = '',
  icon,
  trend,
  trendValue,
  description,
  color = 'blue',
  loading = false,
  subMetrics = [],
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      purple: 'text-purple-600 bg-purple-100',
      indigo: 'text-indigo-600 bg-indigo-100',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((Number(value) - previousValue) / previousValue) * 100;
    return Math.abs(change).toFixed(1);
  };

  const change = calculateChange();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && (
            <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Valor principal */}
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>

        {/* Trend indicator */}
        {trend && trendValue && (
          <div
            className={`flex items-center space-x-1 text-sm ${getTrendColor(
              trend
            )}`}
          >
            {getTrendIcon(trend)}
            <span>
              {trendValue > 0 ? '+' : ''}
              {trendValue}%
            </span>
            <span className="text-gray-500">vs anterior</span>
          </div>
        )}

        {/* Change indicator */}
        {change && (
          <div
            className={`flex items-center space-x-1 text-sm ${
              Number(value) > previousValue! ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {Number(value) > previousValue! ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}%</span>
          </div>
        )}

        {/* Descrição */}
        {description && <p className="text-xs text-gray-600">{description}</p>}

        {/* Sub-métricas */}
        {subMetrics.length > 0 && (
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-2">
              {subMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div
                    className="text-lg font-semibold"
                    style={{ color: metric.color }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedMetricsCard;

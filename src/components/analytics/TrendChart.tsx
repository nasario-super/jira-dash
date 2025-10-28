import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendData } from '../../services/analyticsService';

interface TrendChartProps {
  data: TrendData[];
  title: string;
  metric: string;
  loading?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  metric,
  loading = false,
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedValue: item.value.toLocaleString('pt-BR'),
      formattedChange: `${
        item.changePercent >= 0 ? '+' : ''
      }${item.changePercent.toFixed(1)}%`,
    }));
  }, [data]);

  const latestTrend = data[data.length - 1];
  const previousTrend = data[data.length - 2];

  const getTrendIcon = () => {
    if (!latestTrend || !previousTrend)
      return <Minus className="w-4 h-4 text-gray-500" />;

    if (latestTrend.changePercent > 5) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (latestTrend.changePercent < -5) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!latestTrend) return 'text-gray-500';
    if (latestTrend.changePercent > 5) return 'text-green-500';
    if (latestTrend.changePercent < -5) return 'text-red-500';
    return 'text-gray-500';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {metric}: <span className="font-medium">{data.formattedValue}</span>
          </p>
          <p className="text-sm">
            Variação:{' '}
            <span className={getTrendColor()}>{data.formattedChange}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon()}
            {title}
          </CardTitle>
          {latestTrend && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTrendColor()}>
                {latestTrend.formattedChange}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {latestTrend.formattedValue}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Média</p>
            <p className="text-sm font-medium">
              {(
                data.reduce((sum, item) => sum + item.value, 0) / data.length
              ).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Máximo</p>
            <p className="text-sm font-medium">
              {Math.max(...data.map(item => item.value))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mínimo</p>
            <p className="text-sm font-medium">
              {Math.min(...data.map(item => item.value))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;















import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Settings,
  Download,
  Maximize2,
  Minimize2,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';

interface AdvancedChartsProps {
  issues: JiraIssue[];
  loading?: boolean;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  trend?: number;
}

interface TimeSeriesData {
  period: string;
  value: number;
  target?: number;
  forecast?: number;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  issues,
  loading = false,
}) => {
  const [selectedChart, setSelectedChart] = useState<
    'velocity' | 'burndown' | 'distribution' | 'trends'
  >('velocity');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [chartSettings, setChartSettings] = useState({
    showDataPoints: true,
    showTrendLine: true,
    animationSpeed: 'normal' as 'slow' | 'normal' | 'fast',
  });

  // Calcular dados reais baseados nas issues
  const velocityData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [
        { period: 'Sem 1', value: 12, target: 15 },
        { period: 'Sem 2', value: 18, target: 15 },
        { period: 'Sem 3', value: 14, target: 15 },
        { period: 'Sem 4', value: 16, target: 15, forecast: 17 },
      ];
    }

    // Calcular velocity real baseada nas issues
    const now = new Date();
    const weeks = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekIssues = issues.filter((issue : any) => {
        const created = new Date(issue.fields.created);
        return created >= weekStart && created < weekEnd;
      });

      const completedIssues = weekIssues.filter(
        issue => issue.fields.status.statusCategory.name === 'Done'
      );

      weeks.push({
        period: `Sem ${4 - i}`,
        value: completedIssues.length,
        target: Math.round(issues.length / 4),
        forecast:
          i === 0 ? Math.round(completedIssues.length * 1.1) : undefined,
      });
    }

    return weeks;
  }, [issues]);

  const burndownData: TimeSeriesData[] = [
    { period: 'Dia 1', value: 20, target: 20 },
    { period: 'Dia 2', value: 18, target: 18 },
    { period: 'Dia 3', value: 15, target: 16 },
    { period: 'Dia 4', value: 12, target: 14 },
    { period: 'Dia 5', value: 8, target: 12 },
    { period: 'Dia 6', value: 5, target: 10 },
    { period: 'Dia 7', value: 2, target: 8 },
  ];

  const distributionData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [
        { name: 'Bugs', value: 25, color: '#ef4444', trend: -5.2 },
        { name: 'Features', value: 45, color: '#3b82f6', trend: 12.3 },
        { name: 'Tasks', value: 20, color: '#10b981', trend: 3.1 },
        { name: 'Epics', value: 10, color: '#f59e0b', trend: -2.1 },
      ];
    }

    // Calcular distribuição real por tipo de issue
    const typeStats = new Map<string, number>();
    issues.forEach(issue => {
      const type = issue.fields.issuetype.name;
      typeStats.set(type, (typeStats.get(type) || 0) + 1);
    });

    const colors = [
      '#ef4444',
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#06b6d4',
    ];
    let colorIndex = 0;

    return Array.from(typeStats.entries())
      .map(([name, count]) => ({
        name,
        value: Math.round((count / issues.length) * 100),
        color: colors[colorIndex++ % colors.length],
        trend: Math.random() * 20 - 10, // Simular tendência
      }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);

  const trendsData: TimeSeriesData[] = [
    { period: 'Jan', value: 15, target: 12 },
    { period: 'Fev', value: 18, target: 15 },
    { period: 'Mar', value: 22, target: 18 },
    { period: 'Abr', value: 19, target: 20 },
    { period: 'Mai', value: 25, target: 22 },
    { period: 'Jun', value: 28, target: 25, forecast: 30 },
  ];

  const getMaxValue = (data: TimeSeriesData[]) => {
    return Math.max(
      ...data.map((d : any) => Math.max(d.value, d.target || 0, d.forecast || 0))
    );
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  const handleExportChart = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simular exportação de gráfico
    const data = {
      chartType: selectedChart,
      data:
        selectedChart === 'velocity'
          ? velocityData
          : selectedChart === 'distribution'
          ? distributionData
          : selectedChart === 'burndown'
          ? burndownData
          : trendsData,
      exportDate: new Date().toISOString(),
      settings: chartSettings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-${selectedChart}-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [
    selectedChart,
    velocityData,
    distributionData,
    burndownData,
    trendsData,
    chartSettings,
  ]);

  const handleRefreshData = useCallback(() => {
    // Simular refresh dos dados
    console.log('Refreshing chart data...');
  }, []);

  const getPieSlice = (
    value: number,
    total: number,
    startAngle: number = 0
  ) => {
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M 50,50 L ${x1},${y1} A 40,40 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  };

  const renderVelocityChart = () => {
    const maxValue = getMaxValue(velocityData);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Velocity Trend</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Últimas 4 semanas
            </Badge>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-2">
          {velocityData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center space-y-2"
            >
              <div className="w-full flex flex-col items-center space-y-1">
                {/* Forecast bar */}
                {data.forecast && (
                  <div className="w-full bg-purple-200 rounded-t">
                    <div
                      className="bg-purple-500 rounded-t transition-all duration-500"
                      style={{
                        height: `${getBarHeight(data.forecast, maxValue)}%`,
                      }}
                    ></div>
                  </div>
                )}

                {/* Target bar */}
                <div className="w-full bg-gray-200 rounded">
                  <div
                    className="bg-blue-500 rounded transition-all duration-500"
                    style={{
                      height: `${getBarHeight(data.target || 0, maxValue)}%`,
                    }}
                  ></div>
                </div>

                {/* Actual bar */}
                <div className="w-full bg-gray-200 rounded">
                  <div
                    className="bg-green-500 rounded transition-all duration-500"
                    style={{ height: `${getBarHeight(data.value, maxValue)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-gray-600 text-center">
                <div className="font-medium">{data.period}</div>
                <div className="text-green-600">{data.value}</div>
                {data.forecast && (
                  <div className="text-purple-600">{data.forecast}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Atual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Meta</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Previsão</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBurndownChart = () => {
    const maxValue = getMaxValue(burndownData);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Burndown Chart</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Sprint Atual
            </Badge>
          </div>
        </div>

        <div className="h-64 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-6 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-r border-gray-200"></div>
            ))}
          </div>

          {/* Chart lines */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Target line */}
            <polyline
              points={burndownData
                .map(
                  (data, index) =>
                    `${(index / (burndownData.length - 1)) * 100}%,${
                      100 - ((data.target || 0) / maxValue) * 100
                    }%`
                )
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Actual line */}
            <polyline
              points={burndownData
                .map(
                  (data, index) =>
                    `${(index / (burndownData.length - 1)) * 100}%,${
                      100 - (data.value / maxValue) * 100
                    }%`
                )
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Data points */}
            {burndownData.map((data, index) => (
              <circle
                key={index}
                cx={`${(index / (burndownData.length - 1)) * 100}%`}
                cy={`${100 - (data.value / maxValue) * 100}%`}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all"
              />
            ))}
          </svg>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
            {burndownData.map((data, index) => (
              <div key={index} className="text-center">
                <div>{data.period}</div>
                <div className="font-medium text-green-600">{data.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Atual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className="w-3 h-3 bg-blue-500 rounded"
              style={{
                background:
                  'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 2px, transparent 2px, transparent 4px)',
              }}
            ></div>
            <span>Meta</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDistributionChart = () => {
    const total = distributionData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Distribuição de Issues</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Por Tipo
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {distributionData.map((item, index) => {
                const slice = getPieSlice(item.value, total, currentAngle);
                currentAngle += (item.value / total) * 360;

                return (
                  <path
                    key={index}
                    d={slice}
                    fill={item.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
            </svg>
          </div>

          <div className="space-y-2">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-gray-600">{item.value}%</span>
                {item.trend && (
                  <span
                    className={`text-xs ${
                      item.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.trend > 0 ? '+' : ''}
                    {item.trend}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTrendsChart = () => {
    const maxValue = getMaxValue(trendsData);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tendências Mensais</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Últimos 6 meses
            </Badge>
          </div>
        </div>

        <div className="h-64 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-5 gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-r border-gray-200"></div>
            ))}
          </div>

          {/* Chart area */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Target line */}
            <polyline
              points={trendsData
                .map(
                  (data, index) =>
                    `${(index / (trendsData.length - 1)) * 100}%,${
                      100 - ((data.target || 0) / maxValue) * 100
                    }%`
                )
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Actual line */}
            <polyline
              points={trendsData
                .map(
                  (data, index) =>
                    `${(index / (trendsData.length - 1)) * 100}%,${
                      100 - (data.value / maxValue) * 100
                    }%`
                )
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
            />

            {/* Forecast line */}
            <polyline
              points={trendsData
                .filter((d : any) => d.forecast)
                .map(
                  (data, index) =>
                    `${(index / (trendsData.length - 1)) * 100}%,${
                      100 - ((data.forecast || 0) / maxValue) * 100
                    }%`
                )
                .join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="3,3"
            />

            {/* Data points */}
            {trendsData.map((data, index) => (
              <circle
                key={index}
                cx={`${(index / (trendsData.length - 1)) * 100}%`}
                cy={`${100 - (data.value / maxValue) * 100}%`}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all"
              />
            ))}
          </svg>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
            {trendsData.map((data, index) => (
              <div key={index} className="text-center">
                <div>{data.period}</div>
                <div className="font-medium text-green-600">{data.value}</div>
                {data.forecast && (
                  <div className="text-purple-600">{data.forecast}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Atual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className="w-3 h-3 bg-blue-500 rounded"
              style={{
                background:
                  'repeating-linear-gradient(45deg, #3b82f6, #3b82f6 2px, transparent 2px, transparent 4px)',
              }}
            ></div>
            <span>Meta</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className="w-3 h-3 bg-purple-500 rounded"
              style={{
                background:
                  'repeating-linear-gradient(45deg, #8b5cf6, #8b5cf6 2px, transparent 2px, transparent 4px)',
              }}
            ></div>
            <span>Previsão</span>
          </div>
        </div>
      </div>
    );
  };

  const chartTypes = [
    { id: 'velocity', label: 'Velocity', icon: TrendingUp },
    { id: 'burndown', label: 'Burndown', icon: Activity },
    { id: 'distribution', label: 'Distribuição', icon: PieChart },
    { id: 'trends', label: 'Tendências', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Gráficos Avançados</span>
            <Badge variant="outline" className="text-xs">
              {issues?.length || 0} issues
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportChart}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chart type selector */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {chartTypes.map((type : any) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedChart(type.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedChart === type.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {selectedChart === 'velocity' && renderVelocityChart()}
        {selectedChart === 'burndown' && renderBurndownChart()}
        {selectedChart === 'distribution' && renderDistributionChart()}
        {selectedChart === 'trends' && renderTrendsChart()}
      </CardContent>
    </Card>
  );
};

export default AdvancedCharts;

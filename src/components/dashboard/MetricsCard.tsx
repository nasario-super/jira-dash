import React from 'react';
import { MetricCard } from '../../types/jira.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  metric: MetricCard;
  loading?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = React.memo(({ metric, loading = false }) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-6 w-6 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted rounded mb-2"></div>
          <div className="h-3 w-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-danger';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </CardTitle>
          <div className="text-2xl">
            {metric.icon}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-3xl font-bold ${metric.color || 'text-foreground'}`}>
                {metric.value}
              </p>
              {metric.change !== undefined && (
                <div className="flex items-center mt-2">
                  <Badge 
                    variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs período anterior
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default MetricsCard;

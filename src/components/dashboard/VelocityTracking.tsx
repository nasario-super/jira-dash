import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';

interface VelocityTrackingProps {
  issues: any[];
  sprints: any[];
}

interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
  commitment: number;
  actual: number;
}

const VelocityTracking: React.FC<VelocityTrackingProps> = ({
  issues,
  sprints,
}) => {
  // Processar dados de velocity
  const velocityData = useMemo(() => {
    // Simular dados históricos de velocity (em produção, viria do Jira)
    const historicalData: VelocityData[] = [
      { sprint: 'Sprint 1', planned: 20, completed: 18, commitment: 20, actual: 18 },
      { sprint: 'Sprint 2', planned: 22, completed: 20, commitment: 22, actual: 20 },
      { sprint: 'Sprint 3', planned: 25, completed: 23, commitment: 25, actual: 23 },
      { sprint: 'Sprint 4', planned: 24, completed: 26, commitment: 24, actual: 26 },
      { sprint: 'Sprint 5', planned: 27, completed: 25, commitment: 27, actual: 25 },
      { sprint: 'Sprint Atual', planned: 30, completed: 0, commitment: 30, actual: 0 },
    ];

    // Calcular velocity atual baseada em issues concluídas
    const currentSprintCompleted = issues.filter((issue : any) => {
      const status = issue.fields.status.name.toLowerCase();
      return status.includes('concluído') || status.includes('done');
    }).length;

    // Atualizar sprint atual com dados reais
    const currentSprintIndex = historicalData.length - 1;
    historicalData[currentSprintIndex] = {
      ...historicalData[currentSprintIndex],
      completed: currentSprintCompleted,
      actual: currentSprintCompleted,
    };

    return historicalData;
  }, [issues]);

  // Calcular métricas de velocity
  const velocityMetrics = useMemo(() => {
    const completedSprints = velocityData.filter((sprint : any) => sprint.sprint !== 'Sprint Atual');
    
    if (completedSprints.length === 0) return null;

    const avgVelocity = completedSprints.reduce((sum, sprint) => sum + sprint.actual, 0) / completedSprints.length;
    const avgCommitment = completedSprints.reduce((sum, sprint) => sum + sprint.commitment, 0) / completedSprints.length;
    const commitmentAccuracy = (avgVelocity / avgCommitment) * 100;
    
    const lastSprint = completedSprints[completedSprints.length - 1];
    const velocityTrend = completedSprints.length > 1 
      ? lastSprint.actual - completedSprints[completedSprints.length - 2].actual
      : 0;

    return {
      avgVelocity: Math.round(avgVelocity),
      avgCommitment: Math.round(avgCommitment),
      commitmentAccuracy: Math.round(commitmentAccuracy),
      velocityTrend,
      lastSprintVelocity: lastSprint.actual,
    };
  }, [velocityData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Métricas de Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {velocityMetrics?.avgVelocity || 0}
            </div>
            <div className="text-sm text-gray-600">Velocity Média</div>
            <div className="text-xs text-gray-500">Últimos sprints</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {velocityMetrics?.commitmentAccuracy || 0}%
            </div>
            <div className="text-sm text-gray-600">Precisão</div>
            <div className="text-xs text-gray-500">Commitment vs Real</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold mb-1 flex items-center justify-center ${
              (velocityMetrics?.velocityTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(velocityMetrics?.velocityTrend || 0) >= 0 ? (
                <TrendingUp className="w-5 h-5 mr-1" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-1" />
              )}
              {Math.abs(velocityMetrics?.velocityTrend || 0)}
            </div>
            <div className="text-sm text-gray-600">Tendência</div>
            <div className="text-xs text-gray-500">Último sprint</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {velocityMetrics?.lastSprintVelocity || 0}
            </div>
            <div className="text-sm text-gray-600">Último Sprint</div>
            <div className="text-xs text-gray-500">Velocity real</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Velocity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Evolução da Velocity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sprint" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Planejado"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="commitment" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Commitment"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="Real"
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Sprint Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progresso</span>
                <span className="text-sm font-medium">
                  {velocityData[velocityData.length - 1]?.actual || 0} / {velocityData[velocityData.length - 1]?.planned || 0}
                </span>
              </div>
              <Progress 
                value={((velocityData[velocityData.length - 1]?.actual || 0) / (velocityData[velocityData.length - 1]?.planned || 1)) * 100} 
                className="h-2" 
              />
              <div className="text-xs text-gray-500">
                {Math.round(((velocityData[velocityData.length - 1]?.actual || 0) / (velocityData[velocityData.length - 1]?.planned || 1)) * 100)}% concluído
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {velocityMetrics && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Precisão do Commitment</span>
                    <Badge className={
                      velocityMetrics.commitmentAccuracy >= 90 
                        ? 'bg-green-100 text-green-800' 
                        : velocityMetrics.commitmentAccuracy >= 70 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }>
                      {velocityMetrics.commitmentAccuracy}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tendência</span>
                    <Badge className={
                      velocityMetrics.velocityTrend >= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }>
                      {velocityMetrics.velocityTrend >= 0 ? 'Crescendo' : 'Decrescendo'}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    {velocityMetrics.commitmentAccuracy >= 90 
                      ? 'Excelente precisão! A equipe está entregando consistentemente.'
                      : velocityMetrics.commitmentAccuracy >= 70
                      ? 'Boa precisão. Considere ajustar estimativas para melhorar.'
                      : 'Baixa precisão. Revise o processo de estimativa.'
                    }
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VelocityTracking;

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartData, JiraIssue } from '../../types/jira.types';
import { getStatusColor } from '../../utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import DetailedViewModal from '../common/DetailedViewModal';
import { Eye, TrendingUp } from 'lucide-react';

interface IssuesByStatusProps {
  data: ChartData[];
  loading?: boolean;
  allIssues?: JiraIssue[];
}

const IssuesByStatus: React.FC<IssuesByStatusProps> = React.memo(({ data, loading = false, allIssues = [] }) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoizar issues filtradas por status
  const filteredIssues = useMemo(() => {
    if (!selectedStatus || !allIssues.length) return [];
    return allIssues.filter((issue : any) => issue.fields.status.name === selectedStatus);
  }, [selectedStatus, allIssues]);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStatus(null);
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} issues ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value} ({((entry.payload.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Issues por Status
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusClick('all')}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver Todas
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || getStatusColor(entry.name)} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: {total} issues
            </p>
            <div className="flex flex-wrap gap-1">
              {data.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusClick(item.name)}
                  className="text-xs h-6"
                >
                  {item.name} ({item.value})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DetailedViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Issues - ${selectedStatus === 'all' ? 'Todos os Status' : selectedStatus}`}
        issues={selectedStatus === 'all' ? allIssues : filteredIssues}
        loading={loading}
      />
    </>
  );
});

export default IssuesByStatus;




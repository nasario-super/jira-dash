import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartData, JiraIssue } from '../../types/jira.types';
import { getTypeColor } from '../../utils/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import DetailedViewModal from '../common/DetailedViewModal';
import { Eye, TrendingUp } from 'lucide-react';

interface IssuesByTypeProps {
  data: ChartData[];
  loading?: boolean;
  allIssues?: JiraIssue[];
}

const IssuesByType: React.FC<IssuesByTypeProps> = React.memo(
  ({ data, loading = false, allIssues = [] }) => {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoizar issues filtradas por tipo
    const filteredIssues = useMemo(() => {
      if (!selectedType || !allIssues.length) return [];
      return allIssues.filter(
        issue => issue.fields.issuetype.name === selectedType
      );
    }, [selectedType, allIssues]);

    const handleTypeClick = (type: string) => {
      setSelectedType(type);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedType(null);
    };

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Issues por Tipo</CardTitle>
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
            <CardTitle>Issues por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-gray-600">{data.value} issues</p>
          </div>
        );
      }
      return null;
    };

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Issues por Tipo
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTypeClick('all')}
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
                <BarChart
                  data={data}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {data.map((item, index) => {
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor:
                              item.color || getTypeColor(item.name),
                          }}
                        />
                        <span className="text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item.value}</span>
                        <span className="text-muted-foreground ml-1">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Total: {total} issues
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {data.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTypeClick(item.name)}
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
          title={`Issues - ${
            selectedType === 'all' ? 'Todos os Tipos' : selectedType
          }`}
          issues={selectedType === 'all' ? allIssues : filteredIssues}
          loading={loading}
        />
      </>
    );
  }
);

export default IssuesByType;

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartData, JiraIssue } from '../../types/jira.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import DetailedViewModal from '../common/DetailedViewModal';
import {
  Eye,
  Users,
  TrendingUp,
  UserCheck,
  Database,
  AlertCircle,
} from 'lucide-react';
import UserService from '../../services/userService';

interface IssuesByUserProps {
  data: ChartData[];
  loading?: boolean;
  allIssues?: JiraIssue[];
}

const IssuesByUser: React.FC<IssuesByUserProps> = React.memo(
  ({ data, loading = false, allIssues = [] }) => {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    // Memoizar issues filtradas por usuário
    const filteredIssues = useMemo(() => {
      if (!selectedUser || !allIssues.length) return [];
      return allIssues.filter(
        issue => issue.fields.assignee?.displayName === selectedUser
      );
    }, [selectedUser, allIssues]);

    const handleUserClick = (user: string) => {
      setSelectedUser(user);
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedUser(null);
    };

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Issues por Usuário</CardTitle>
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
            <CardTitle>Issues por Usuário</CardTitle>
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

    // Cores para o gráfico de pizza
    const COLORS = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#06B6D4',
      '#84CC16',
      '#F97316',
    ];

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Issues por Usuário
                {(() => {
                  const userService = UserService.getInstance();
                  const isRealData = userService.isUsingRealData();
                  return (
                    <div className="flex items-center gap-1 ml-2">
                      {isRealData ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          <Database className="w-3 h-3" />
                          <span>Dados Reais</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          <AlertCircle className="w-3 h-3" />
                          <span>Dados de Demo</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Barras
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="text-xs"
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  Pizza
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserClick('all')}
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
                {chartType === 'bar' ? (
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#3B82F6" />
                  </BarChart>
                ) : (
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
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground truncate max-w-32">
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
                    onClick={() => handleUserClick(item.name)}
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
            selectedUser === 'all' ? 'Todos os Usuários' : selectedUser
          }`}
          issues={selectedUser === 'all' ? allIssues : filteredIssues}
          loading={loading}
        />
      </>
    );
  }
);

export default IssuesByUser;

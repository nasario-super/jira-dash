import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ISSUE_TYPE_COLORS } from '../../config/chartConfig';

interface IssueTypeData {
  name: string;
  count: number;
}

interface IssuesByTypeChartProps {
  data: IssueTypeData[];
}

export function IssuesByTypeChart({ data }: IssuesByTypeChartProps) {
  // Ordenar do maior para o menor
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issues por Tipo
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: any) => [`${value} issues`, 'Total']}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="count"
            fill={ISSUE_TYPE_COLORS.Story}
            radius={[0, 4, 4, 0]}
            label={{
              position: 'right',
              fill: '#374151',
              fontSize: 12,
              fontWeight: 600,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

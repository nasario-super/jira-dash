import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../../config/chartConfig';

interface StatusData {
  name: string;
  value: number;
}

interface IssuesByStatusChartProps {
  data: StatusData[];
}

export function IssuesByStatusChart({ data }: IssuesByStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label que não sobrepõe
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Não mostrar labels muito pequenas

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issues por Status
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Gráfico */}
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ||
                      '#6b7280'
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                formatter={(value: any) => [`${value} issues`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda lateral customizada */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[
                          item.name as keyof typeof STATUS_COLORS
                        ] || '#6b7280',
                    }}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({((item.value / total) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

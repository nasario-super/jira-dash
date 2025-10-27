import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_CONFIG } from '../../config/chartConfig';

interface BurndownData {
  dia: string;
  ideal: number;
  real: number;
}

interface BurndownChartProps {
  data: BurndownData[];
}

export function BurndownChart({ data }: BurndownChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Burndown - Sprint Atual
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Ideal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Real</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={CHART_CONFIG.margins.default}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dia"
            tick={CHART_CONFIG.fonts.axis}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={CHART_CONFIG.fonts.axis}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Story Points',
              angle: -90,
              position: 'insideLeft',
              style: CHART_CONFIG.fonts.axis,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Linha Ideal"
          />
          <Line
            type="monotone"
            dataKey="real"
            stroke={CHART_CONFIG.colors.primary}
            strokeWidth={3}
            dot={{ fill: CHART_CONFIG.colors.primary, r: 4 }}
            activeDot={{ r: 6 }}
            name="Progresso Real"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legenda customizada abaixo do gráfico */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gray-400 border-t-2 border-dashed"></div>
          <span className="text-gray-700">Linha Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span className="text-gray-700">Progresso Real</span>
        </div>
      </div>
    </div>
  );
}

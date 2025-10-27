import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_CONFIG } from '../../config/chartConfig';

interface VelocityData {
  sprint: string;
  planejado: number;
  concluido: number;
}

interface VelocityChartProps {
  data: VelocityData[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Velocity do Time
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={CHART_CONFIG.margins.default}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="sprint"
            tick={CHART_CONFIG.fonts.axis}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={CHART_CONFIG.fonts.axis}
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
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar
            dataKey="planejado"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            name="Planejado"
          />
          <Bar
            dataKey="concluido"
            fill={CHART_CONFIG.colors.success}
            radius={[4, 4, 0, 0]}
            name="Concluído"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda customizada */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span className="text-gray-700">Planejado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-700">Concluído</span>
        </div>
      </div>
    </div>
  );
}

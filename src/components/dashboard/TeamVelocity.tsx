import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VelocityData } from '../../types/jira.types';

interface TeamVelocityProps {
  data: VelocityData[];
  loading?: boolean;
}

const TeamVelocity: React.FC<TeamVelocityProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Velocity do Time</h3>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Velocity do Time</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} story points
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const averageVelocity = data.reduce((sum, sprint) => sum + sprint.velocity, 0) / data.length;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Velocity do Time</h3>
        <div className="text-sm text-gray-600">
          Média: {averageVelocity.toFixed(1)} SP
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="sprint" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="planned" 
              name="Planejado" 
              fill="#3B82F6" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="completed" 
              name="Concluído" 
              fill="#10B981" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600">Total Planejado</p>
          <p className="font-semibold text-blue-600">
            {data.reduce((sum, sprint) => sum + sprint.planned, 0)} SP
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Total Concluído</p>
          <p className="font-semibold text-green-600">
            {data.reduce((sum, sprint) => sum + sprint.completed, 0)} SP
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamVelocity;




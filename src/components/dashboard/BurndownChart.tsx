import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BurndownData } from '../../types/jira.types';

interface BurndownChartProps {
  data: BurndownData[];
  loading?: boolean;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Burndown Chart</h3>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Burndown Chart</h3>
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

  const isOnTrack = () => {
    if (data.length === 0) return true;
    const lastData = data[data.length - 1];
    return lastData.actual <= lastData.ideal * 1.1; // 10% tolerance
  };

  const getStatusMessage = () => {
    if (isOnTrack()) {
      return { message: 'Sprint no prazo', color: 'text-success' };
    } else {
      return { message: 'Sprint atrasada', color: 'text-danger' };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Burndown Chart</h3>
        <div className={`text-sm font-medium ${status.color}`}>
          {status.message}
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ideal" 
              name="Ideal" 
              stroke="#6B7280" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Real" 
              stroke="#3B82F6" 
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600">Início</p>
          <p className="font-semibold">
            {data.length > 0 ? data[0].actual : 0} SP
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Atual</p>
          <p className="font-semibold">
            {data.length > 0 ? data[data.length - 1].actual : 0} SP
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">Meta</p>
          <p className="font-semibold">
            {data.length > 0 ? data[data.length - 1].ideal : 0} SP
          </p>
        </div>
      </div>
    </div>
  );
};

export default BurndownChart;















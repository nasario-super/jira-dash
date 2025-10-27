import React, { useState } from 'react';
import { FilterState } from '../../types/jira.types';
import { X, Filter, Calendar, Users, Tag, Flag } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  options: {
    projects: Array<{ value: string; label: string }>;
    sprints: Array<{ value: string; label: string }>;
    issueTypes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    assignees: Array<{ value: string; label: string }>;
    priorities: Array<{ value: string; label: string }>;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
  options,
  isOpen,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      projects: [],
      sprints: [],
      issueTypes: [],
      statuses: [],
      assignees: [],
      dateRange: { start: '', end: '' },
      priorities: []
    });
    onReset();
  };

  const MultiSelect = ({ 
    label, 
    options, 
    value, 
    onChange, 
    icon: Icon 
  }: {
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string[];
    onChange: (value: string[]) => void;
    icon: any;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon size={16} />
        {label}
      </label>
      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 p-2 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, option.value]);
                } else {
                  onChange(value.filter(v => v !== option.value));
                }
              }}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const DateRangePicker = () => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Calendar size={16} />
        Período
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={localFilters.dateRange.start}
          onChange={(e) => setLocalFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, start: e.target.value }
          }))}
          className="input text-sm"
          placeholder="Data início"
        />
        <input
          type="date"
          value={localFilters.dateRange.end}
          onChange={(e) => setLocalFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, end: e.target.value }
          }))}
          className="input text-sm"
          placeholder="Data fim"
        />
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="btn btn-secondary flex items-center gap-2"
      >
        <Filter size={16} />
        Filtros
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter size={20} />
          Filtros
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <MultiSelect
          label="Projetos"
          options={options.projects}
          value={localFilters.projects}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, projects: value }))}
          icon={Tag}
        />

        <MultiSelect
          label="Sprints"
          options={options.sprints}
          value={localFilters.sprints}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, sprints: value }))}
          icon={Calendar}
        />

        <MultiSelect
          label="Tipos de Issue"
          options={options.issueTypes}
          value={localFilters.issueTypes}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, issueTypes: value }))}
          icon={Tag}
        />

        <MultiSelect
          label="Status"
          options={options.statuses}
          value={localFilters.statuses}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, statuses: value }))}
          icon={Flag}
        />

        <MultiSelect
          label="Responsáveis"
          options={options.assignees}
          value={localFilters.assignees}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, assignees: value }))}
          icon={Users}
        />

        <MultiSelect
          label="Prioridades"
          options={options.priorities}
          value={localFilters.priorities}
          onChange={(value) => setLocalFilters(prev => ({ ...prev, priorities: value }))}
          icon={Flag}
        />

        <DateRangePicker />
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleApply}
          className="btn btn-primary flex-1"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={handleReset}
          className="btn btn-secondary"
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;

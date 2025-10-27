import { MultiSelectFilter } from '../common/MultiSelectFilter';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { addDays, startOfMonth } from 'date-fns';
import { FilterState, FilterOptions } from '../../types/filters.types';

interface FilterBarProps {
  filters: FilterState;
  filterOptions: FilterOptions | null;
  updateFilter: (key: keyof FilterState, value: any) => void;
  clearAllFilters: () => void;
  activeFiltersCount: number;
  loading: boolean;
}

export function FilterBar({
  filters,
  filterOptions,
  updateFilter,
  clearAllFilters,
  activeFiltersCount,
  loading,
}: FilterBarProps) {
  const datePresets = [
    {
      label: 'Hoje',
      value: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Últimos 7 dias',
      value: {
        start: addDays(new Date(), -7).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Últimos 30 dias',
      value: {
        start: addDays(new Date(), -30).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Este mês',
      value: {
        start: startOfMonth(new Date()).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header com contador de filtros ativos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {activeFiltersCount}{' '}
              {activeFiltersCount === 1 ? 'ativo' : 'ativos'}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            disabled={loading}
          >
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Linha 1 de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DateRangeFilter
          label="Período"
          value={filters.dateRange}
          onChange={val => updateFilter('dateRange', val)}
          presets={datePresets}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Sprints"
          placeholder="Selecione sprints"
          options={filterOptions?.sprints || []}
          value={filters.sprints}
          onChange={val => updateFilter('sprints', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <span>{opt.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  opt.state === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {opt.state}
              </span>
            </div>
          )}
          disabled={loading}
        />
      </div>

      {/* Linha 2 de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MultiSelectFilter
          label="Tipo"
          placeholder="Tipos de issue"
          options={filterOptions?.issueTypes || []}
          value={filters.issueTypes}
          onChange={val => updateFilter('issueTypes', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img src={opt.iconUrl} alt="" className="w-4 h-4" />
              <span>{opt.name}</span>
            </div>
          )}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Status"
          placeholder="Status"
          options={filterOptions?.statuses || []}
          value={filters.statuses}
          onChange={val => updateFilter('statuses', val)}
          groupBy={opt => opt.category}
          disabled={loading}
        />

        <MultiSelectFilter
          label="Assignee"
          placeholder="Responsável"
          options={filterOptions?.assignees || []}
          value={filters.assignees}
          onChange={val => updateFilter('assignees', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img
                src={opt.avatarUrl}
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <span>{opt.displayName}</span>
            </div>
          )}
          searchable
          disabled={loading}
        />

        <MultiSelectFilter
          label="Prioridade"
          placeholder="Prioridade"
          options={filterOptions?.priorities || []}
          value={filters.priorities}
          onChange={val => updateFilter('priorities', val)}
          renderOption={opt => (
            <div className="flex items-center gap-2">
              <img src={opt.iconUrl} alt="" className="w-4 h-4" />
              <span>{opt.name}</span>
            </div>
          )}
          disabled={loading}
        />
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span>Aplicando filtros...</span>
        </div>
      )}
    </div>
  );
}

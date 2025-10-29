// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useOptimizedFilters } from '../../hooks/useOptimizedFilters';
import {
  Search,
  Filter,
  X,
  Save,
  Clock,
  Users,
  Tag,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  projects?: any[];
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  isOpen,
  onToggle,
  projects = [],
}) => {
  const {
    filters,
    searchTerm,
    isFiltering,
    filterOptions,
    hasActiveFilters,
    getFilterSummary,
    handleSearchChange,
    updateFilters,
    clearAllFilters,
    applyFilterPreset,
    loadFilterPreset,
    getSavedPresets,
  } = useOptimizedFilters(projects);

  const [projectSearchTerm, setProjectSearchTerm] = useState('');

  // Filter projects based on search term
  const filteredProjectOptions = useMemo(() => {
    if (!projectSearchTerm) return filterOptions.projects;
    return filterOptions.projects.filter((project : any) =>
      project.label.toLowerCase().includes(projectSearchTerm.toLowerCase())
    );
  }, [filterOptions.projects, projectSearchTerm]);

  const [showPresets] = useState(false);
  const [presetName] = useState('');
  const [showSavePreset] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['search', 'status'])
  );

  const savedPresets = getSavedPresets();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string[]) => {
    updateFilters({ ...filters, [key]: value });
  };

  const handleMultiSelectChange = (
    key: keyof typeof filters,
    value: string,
    checked: boolean
  ) => {
    console.log('🔧 MultiSelect Change:', { key, value, checked });
    const currentValues = Array.isArray(filters[key])
      ? (filters[key] as string[])
      : [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v : any) => v !== value);

    console.log('🔧 New Values:', newValues);
    console.log('🔧 Calling updateFilters with:', { [key]: newValues });
    handleFilterChange(key, newValues);
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: string;
    children: React.ReactNode;
  }> = ({ title, icon, sectionKey, children }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const MultiSelectFilter: React.FC<{
    options: Array<{ value: string; label: string }>;
    selectedValues: string[];
    onChange: (value: string, checked: boolean) => void;
  }> = ({ options, selectedValues, onChange }) => (
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {options.map((option : any) => (
        <label
          key={option.value}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={e => onChange(option.value, e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-40"
    >
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros Avançados
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {/* Search */}
          <FilterSection
            title="Busca"
            icon={<Search className="w-4 h-4" />}
            sectionKey="search"
          >
            <div className="relative">
              <Input
                placeholder="Buscar issues..."
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="pr-8"
              />
              {isFiltering && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection
            title="Status"
            icon={<Tag className="w-4 h-4" />}
            sectionKey="status"
          >
            <MultiSelectFilter
              options={filterOptions.statuses}
              selectedValues={
                Array.isArray(filters.statuses) ? filters.statuses : []
              }
              onChange={(value, checked) =>
                handleMultiSelectChange('statuses', value, checked)
              }
            />
          </FilterSection>

          {/* Projects */}
          <FilterSection
            title="Projetos"
            icon={<Users className="w-4 h-4" />}
            sectionKey="projects"
          >
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar projeto..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={projectSearchTerm}
                  onChange={e => setProjectSearchTerm(e.target.value)}
                />
              </div>

              {/* Multi Select */}
              <MultiSelectFilter
                options={filteredProjectOptions}
                selectedValues={
                  Array.isArray(filters.projects) ? filters.projects : []
                }
                onChange={(value, checked) =>
                  handleMultiSelectChange('projects', value, checked)
                }
              />
            </div>
          </FilterSection>

          {/* Types */}
          <FilterSection
            title="Tipos"
            icon={<Tag className="w-4 h-4" />}
            sectionKey="types"
          >
            <MultiSelectFilter
              options={filterOptions.types}
              selectedValues={
                Array.isArray(filters.issueTypes) ? filters.issueTypes : []
              }
              onChange={(value, checked) =>
                handleMultiSelectChange('issueTypes', value, checked)
              }
            />
          </FilterSection>

          {/* Priorities */}
          <FilterSection
            title="Prioridades"
            icon={<Tag className="w-4 h-4" />}
            sectionKey="priorities"
          >
            <MultiSelectFilter
              options={filterOptions.priorities}
              selectedValues={
                Array.isArray(filters.priorities) ? filters.priorities : []
              }
              onChange={(value, checked) =>
                handleMultiSelectChange('priorities', value, checked)
              }
            />
          </FilterSection>

          {/* Date Range */}
          <FilterSection
            title="Período"
            icon={<Calendar className="w-4 h-4" />}
            sectionKey="dateRange"
          >
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={e =>
                    updateFilters({
                      ...filters,
                      dateRange: {
                        start: e.target.value,
                        end: filters.dateRange.end || '',
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={e =>
                    updateFilters({
                      ...filters,
                      dateRange: {
                        start: filters.dateRange.start || '',
                        end: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </FilterSection>

          {/* Presets */}
          <FilterSection
            title="Presets"
            icon={<Clock className="w-4 h-4" />}
            sectionKey="presets"
          >
            <div className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFilterPreset('active')}
                  className="text-xs"
                >
                  Ativas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFilterPreset('completed')}
                  className="text-xs"
                >
                  Concluídas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyFilterPreset('bugs')}
                  className="text-xs"
                >
                  Bugs
                </Button>
              </div>

              {savedPresets.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Presets Salvos:
                  </p>
                  {savedPresets.map((preset : any) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      size="sm"
                      onClick={() => loadFilterPreset(preset.name)}
                      className="w-full justify-start text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                className="w-full text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                Salvar Preset
              </Button>
            </div>
          </FilterSection>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Filtros Ativos:</p>
              <p className="text-xs">{getFilterSummary()}</p>
            </div>
          )}

          {isFiltering && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              Aplicando filtros...
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onToggle}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AdvancedFilterPanel;

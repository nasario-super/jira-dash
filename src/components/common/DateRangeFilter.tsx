import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { addDays, startOfMonth, format } from 'date-fns';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface DateRangeFilterProps {
  label: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  presets?: Array<{
    label: string;
    value: DateRange;
  }>;
  disabled?: boolean;
}

export function DateRangeFilter({
  label,
  value,
  onChange,
  presets = [],
  disabled = false,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartDateChange = (date: string) => {
    onChange({ ...value, start: date });
  };

  const handleEndDateChange = (date: string) => {
    onChange({ ...value, end: date });
  };

  const clearDates = () => {
    onChange({ start: null, end: null });
  };

  const applyPreset = (preset: DateRange) => {
    onChange(preset);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value.start && !value.end) {
      return 'Selecione o período';
    }
    if (value.start && value.end) {
      return `${value.start} - ${value.end}`;
    }
    if (value.start) {
      return `A partir de ${value.start}`;
    }
    if (value.end) {
      return `Até ${value.end}`;
    }
    return 'Selecione o período';
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 bg-white border rounded-lg text-left
          flex items-center justify-between gap-2
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-50'
              : 'hover:border-gray-400'
          }
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
        `}
      >
        <span className="text-sm text-gray-700 truncate">
          {getDisplayText()}
        </span>

        <div className="flex items-center gap-2">
          {(value.start || value.end) && !disabled && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600"
              onClick={e => {
                e.stopPropagation();
                clearDates();
              }}
            />
          )}
          <Calendar size={16} className="text-gray-400" />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          {/* Presets */}
          {presets.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Períodos rápidos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset.value)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={value.start || ''}
                onChange={e => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Data final
              </label>
              <input
                type="date"
                value={value.end || ''}
                onChange={e => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={clearDates}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

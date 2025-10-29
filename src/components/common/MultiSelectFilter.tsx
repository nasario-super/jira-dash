// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: any[];
  value: any[];
  onChange: (selected: any[]) => void;
  renderOption?: (option: any) => React.ReactNode;
  groupBy?: (option: any) => string;
  searchable?: boolean;
  disabled?: boolean;
}

export function MultiSelectFilter({
  label,
  placeholder,
  options,
  value,
  onChange,
  renderOption,
  groupBy,
  searchable = false,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtrar opções por busca
  const filteredOptions =
    searchable && searchTerm
      ? options.filter((opt : any) =>
          JSON.stringify(opt).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  // Agrupar opções se necessário
  const groupedOptions = groupBy
    ? filteredOptions.reduce((acc, opt) => {
        const group = groupBy(opt);
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
      }, {} as Record<string, any[]>)
    : { all: filteredOptions };

  const toggleOption = (option: any) => {
    const optionId = option.id || option.key || option.accountId || option.name;
    const isSelected = value.some(v => {
      const vId = v.id || v.key || v.accountId || v.name || v;
      return vId === optionId;
    });

    if (isSelected) {
      onChange(
        value.filter((v : any) => {
          const vId = v.id || v.key || v.accountId || v.name || v;
          return vId !== optionId;
        })
      );
    } else {
      onChange([...value, optionId]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
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
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <span className="font-medium">
              {value.length} selecionado{value.length > 1 ? 's' : ''}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {value.length > 0 && !disabled && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600"
              onClick={clearAll}
            />
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
              <div key={groupName}>
                {groupBy && (
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {groupName}
                  </div>
                )}

                {groupOptions.map((option, idx) => {
                  const optionId =
                    option.id || option.key || option.accountId || option.name;
                  const isSelected = value.some(v => {
                    const vId = v.id || v.key || v.accountId || v.name || v;
                    return vId === optionId;
                  });

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={`
                        w-full px-4 py-2.5 text-left flex items-center gap-3
                        hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div
                        className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                        ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }
                      `}
                      >
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <span className="text-sm text-gray-900">
                            {option.name || option}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateRangePreset, DateFilter } from '../types';
import { formatDateToYMD } from '../utils/dateUtils';

interface DateFilterBarProps {
  dateFilter: DateFilter;
  onChangeDateFilter: (filter: DateFilter) => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateFilter,
  onChangeDateFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(
    dateFilter.startDate || formatDateToYMD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  );
  const [customEnd, setCustomEnd] = useState(
    dateFilter.endDate || formatDateToYMD(new Date())
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'all', label: 'All Time (No Filter)' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '14d', label: 'Last 14 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const currentLabel =
    dateFilter.preset === 'custom' && dateFilter.startDate && dateFilter.endDate
      ? `${dateFilter.startDate} to ${dateFilter.endDate}`
      : presets.find((p) => p.id === dateFilter.preset)?.label || 'All Time';

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      onChangeDateFilter({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
    } else {
      onChangeDateFilter({
        preset,
      });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onChangeDateFilter({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-neutral-700 transition-colors whitespace-nowrap"
      >
        <Calendar className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-mono">{currentLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase font-mono border-b border-neutral-800 mb-1">
            Filter Data By Date
          </div>

          <div className="space-y-0.5">
            {presets.map((p) => {
              const isSelected = dateFilter.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-amber-400/10 text-amber-400 font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter.preset === 'custom' && (
            <div className="mt-2 pt-2 border-t border-neutral-800 space-y-2 px-1">
              <div className="text-[10px] text-neutral-400 font-mono">Custom Range:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block mb-0.5">From</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-100 text-[11px] focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block mb-0.5">To</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-100 text-[11px] focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyCustom}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors mt-1"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import { useState, useRef, useEffect } from 'react';

interface CompanyTypeaheadProps {
  companies: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function CompanyTypeahead({ companies, value, onChange, label }: CompanyTypeaheadProps) {
  const [inputValue, setInputValue] = useState(value === 'all' ? '' : value);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value === 'all' ? '' : value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (inputValue && !companies.includes(inputValue)) {
          setInputValue('');
          onChange('all');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, companies, onChange]);

  const suggestions = inputValue.trim()
    ? companies.filter(c => c.toLowerCase().includes(inputValue.trim().toLowerCase())).slice(0, 8)
    : companies.slice(0, 8);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setInputValue(v);
    setOpen(true);
    setHighlightIndex(-1);
    if (!v.trim()) {
      onChange('all');
    }
  }

  function selectCompany(c: string) {
    setInputValue(c);
    onChange(c);
    setOpen(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && suggestions[highlightIndex]) {
      e.preventDefault();
      selectCompany(suggestions[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Type company name..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((c, i) => (
            <li
              key={c}
              onClick={() => selectCompany(c)}
              className={'px-3 py-2 text-sm cursor-pointer ' + (i === highlightIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50')}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
      {open && suggestions.length === 0 && inputValue.trim() && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <li className="px-3 py-2 text-sm text-gray-400">No matching companies</li>
        </ul>
      )}
    </div>
  );
}
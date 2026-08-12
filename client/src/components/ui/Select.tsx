import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
}

export function Select({ label, options, value, onChange, placeholder = 'Select...', searchable = true, error, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()) || o.sublabel?.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full bg-paper border border-cream-deep rounded-md px-3.5 py-2.5 text-sm text-left
            flex items-center justify-between gap-2
            focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/8
            transition-all duration-150 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-danger' : ''}
          `}
          disabled={disabled}
        >
          <span className={selected ? 'text-ink' : 'text-ink-muted'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={16} className={`text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-paper border border-cream-deep rounded-md shadow-lg max-h-60 overflow-hidden animate-fade-in">
            {searchable && (
              <div className="p-2 border-b border-cream-deep">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-cream rounded border-none outline-none"
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filtered.length === 0 ? (
                <div className="px-3.5 py-3 text-sm text-ink-muted text-center">No results found</div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`
                      w-full px-3.5 py-2.5 text-sm text-left hover:bg-cream transition-colors cursor-pointer
                      ${option.value === value ? 'bg-cream-warm font-medium' : ''}
                    `}
                  >
                    <div>{option.label}</div>
                    {option.sublabel && (
                      <div className="text-xs text-ink-muted mt-0.5">{option.sublabel}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

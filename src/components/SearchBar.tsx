import type { ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { IconButton } from '@/components/IconButton';
import { fr } from '@/i18n/fr';

export interface SearchBarProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({ label, placeholder, value, onChange, onClear }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value);

  return (
    <div className="search-bar surface-inset">
      <Search aria-hidden="true" size={20} />
      <input
        aria-label={label}
        autoComplete="off"
        className="search-bar__input focus-ring"
        onChange={handleChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value && onClear && <IconButton aria-label={fr.design.labels.clearSearch} icon={<X size={18} />} onClick={onClear} />}
    </div>
  );
}

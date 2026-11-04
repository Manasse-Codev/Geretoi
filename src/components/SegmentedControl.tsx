import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

export interface SegmentOption<Value extends string = string> {
  value: Value;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<Value extends string = string> {
  label: string;
  options: readonly SegmentOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
}

export function SegmentedControl<Value extends string>({ label, options, value, onValueChange }: SegmentedControlProps<Value>) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [scrollable, setScrollable] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || typeof ResizeObserver === 'undefined') return;
    const update = () => setScrollable(group.scrollWidth > group.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(group);
    return () => observer.disconnect();
  }, [options.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + options.length) % options.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = options.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    const option = options[nextIndex];
    if (option) {
      onValueChange(option.value);
      buttons.current[nextIndex]?.focus();
    }
  };

  return (
    <div aria-label={label} className={`segmented surface-inset${scrollable ? ' segmented--scrollable' : ''}`} ref={groupRef} role="radiogroup" style={{ '--segmented-count': options.length } as CSSProperties}>
      {options.map((option, index) => (
        <button
          aria-checked={value === option.value}
          className="segmented__option focus-ring"
          key={option.value}
          onClick={() => onValueChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          ref={(element) => { buttons.current[index] = element; }}
          role="radio"
          tabIndex={value === option.value ? 0 : -1}
          type="button"
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

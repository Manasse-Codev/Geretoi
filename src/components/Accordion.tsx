import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionRowProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
}

export function AccordionRow({ title, children, defaultOpen = false, id }: AccordionRowProps) {
  const generatedId = useId();
  const panelId = id ?? `accordion-panel-${generatedId}`;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="accordion-row">
      <h3 className="accordion-row__heading">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          className="accordion-trigger focus-ring"
          id={`${panelId}-trigger`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span>{title}</span>
          <ChevronDown aria-hidden="true" className={open ? 'accordion-chevron is-open' : 'accordion-chevron'} size={20} />
        </button>
      </h3>
      <div aria-labelledby={`${panelId}-trigger`} className="accordion-row__panel" hidden={!open} id={panelId}>
        {children}
      </div>
    </section>
  );
}

export interface AccordionProps {
  label: string;
  children: ReactNode;
}

export function Accordion({ label, children }: AccordionProps) {
  return <div aria-label={label} className="accordion" role="group">{children}</div>;
}

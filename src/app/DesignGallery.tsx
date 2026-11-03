import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Bell, CirclePlus, Search } from 'lucide-react';
import { Accordion, AccordionRow } from '@/components/Accordion';
import { BottomNav, type BottomNavTab } from '@/components/BottomNav';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { NumberBadge } from '@/components/NumberBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing';
import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Sheet } from '@/components/Sheet';
import { Skeleton } from '@/components/Skeleton';
import { TextArea } from '@/components/TextArea';
import { TextField } from '@/components/TextField';
import { Toast } from '@/components/Toast';
import { Toggle } from '@/components/Toggle';
import { fr } from '@/i18n/fr';

type ThemeChoice = 'light' | 'dark' | 'auto';
type ViewChoice = 'list' | 'grid' | 'compact';

function StateTile({ state, children }: { state: string; children: ReactNode }) {
  const stateClass = state === fr.design.states.hover
    ? 'design-state--hover'
    : state === fr.design.states.pressed
      ? 'design-state--pressed'
      : state === fr.design.states.focus
        ? 'design-state--focus'
        : '';
  return (
    <div className={`design-state ${stateClass}`.trim()}>
      <strong>{state}</strong>
      {children}
    </div>
  );
}

export function DesignGallery() {
  const [theme, setTheme] = useState<ThemeChoice>('auto');
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('DayFlow');
  const [view, setView] = useState<ViewChoice>('list');
  const [activeTab, setActiveTab] = useState<BottomNavTab>('today');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { document.documentElement.dataset.theme = 'auto'; };
  }, [theme]);

  return (
    <main className="design-gallery">
      <header className="design-gallery__header">
        <div>
          <h1>{fr.design.title}</h1>
          <p>{fr.design.description}</p>
        </div>
        <label className="design-theme-picker">
          <span>{fr.design.theme.label}</span>
          <select className="text-control focus-ring" onChange={(event) => setTheme(event.currentTarget.value as ThemeChoice)} value={theme}>
            <option value="light">{fr.design.theme.light}</option>
            <option value="dark">{fr.design.theme.dark}</option>
            <option value="auto">{fr.design.theme.auto}</option>
          </select>
        </label>
      </header>

      <section aria-labelledby="design-state-heading" className="design-section surface-raised">
        <h2 id="design-state-heading">{fr.design.headings.stateMatrix}</h2>
        <div className="design-states">
          <StateTile state={fr.design.states.default}><Button variant="secondary">{fr.design.labels.add}</Button></StateTile>
          <StateTile state={fr.design.states.hover}><Button variant="secondary">{fr.design.labels.add}</Button></StateTile>
          <StateTile state={fr.design.states.pressed}><Button variant="secondary">{fr.design.labels.add}</Button></StateTile>
          <StateTile state={fr.design.states.focus}><Button variant="secondary">{fr.design.labels.add}</Button></StateTile>
          <StateTile state={fr.design.states.disabled}><Button disabled>{fr.design.labels.add}</Button></StateTile>
          <StateTile state={fr.design.states.error}><TextField label={fr.design.labels.fieldLabel} defaultValue="" error={fr.design.labels.fieldError} /></StateTile>
        </div>
        <div className="design-grid">
          <Button variant="primary">{fr.design.labels.add}</Button>
          <Button variant="secondary">{fr.design.labels.save}</Button>
          <Button variant="ghost">{fr.design.labels.cancel}</Button>
          <Button variant="destructive">{fr.design.states.error}</Button>
          <Button loading>{fr.design.labels.save}</Button>
          <Button disabled>{fr.design.states.disabled}</Button>
        </div>
      </section>

      <section aria-labelledby="design-icon-heading" className="design-section surface-raised">
        <h2 id="design-icon-heading">{fr.design.headings.iconButton}</h2>
        <div className="design-grid">
          <IconButton aria-label={fr.design.labels.add} icon={<CirclePlus size={20} />} />
          <IconButton aria-label={fr.design.labels.search} disabled icon={<Search size={20} />} />
        </div>
      </section>

      <section aria-labelledby="design-card-heading" className="design-section surface-raised">
        <h2 id="design-card-heading">{fr.design.headings.card}</h2>
        <Card><strong>{fr.design.labels.task}</strong><p>{fr.design.description}</p></Card>
      </section>

      <section aria-labelledby="design-chip-heading" className="design-section surface-raised">
        <h2 id="design-chip-heading">{fr.design.headings.chip}</h2>
        <div className="design-grid">
          <Chip>{fr.design.options.list}</Chip>
          <Chip onClick={() => undefined} selected>{fr.design.options.grid}</Chip>
          <Chip disabled onClick={() => undefined}>{fr.design.states.disabled}</Chip>
        </div>
      </section>

      <section aria-labelledby="design-checkbox-heading" className="design-section surface-raised">
        <h2 id="design-checkbox-heading">{fr.design.headings.checkbox}</h2>
        <div className="design-grid">
          <label className="design-inline-control"><Checkbox checked={checked} label={fr.design.labels.checkbox} onCheckedChange={setChecked} />{fr.design.labels.checkbox}</label>
          <label className="design-inline-control"><Checkbox checked onCheckedChange={() => undefined} label={fr.design.labels.check} />{fr.design.labels.check}</label>
        </div>
      </section>

      <section aria-labelledby="design-toggle-heading" className="design-section surface-raised">
        <h2 id="design-toggle-heading">{fr.design.headings.toggle}</h2>
        <div className="design-grid">
          <div className="design-inline-control"><Toggle checked={enabled} label={fr.design.labels.toggle} onCheckedChange={setEnabled} /><span>{fr.design.labels.toggle}</span></div>
          <div className="design-inline-control"><Toggle checked={false} label={fr.design.labels.focusToggle} onCheckedChange={() => undefined} /><span>{fr.design.labels.focusToggle}</span></div>
          <Toggle checked disabled label={fr.design.labels.toggle} onCheckedChange={() => undefined} />
        </div>
      </section>

      <section aria-labelledby="design-search-heading" className="design-section surface-raised">
        <h2 id="design-search-heading">{fr.design.headings.searchBar}</h2>
        <SearchBar label={fr.design.labels.search} onChange={setQuery} onClear={() => setQuery('')} placeholder={fr.design.labels.searchPlaceholder} value={query} />
      </section>

      <section aria-labelledby="design-field-heading" className="design-section surface-raised">
        <h2 id="design-field-heading">{fr.design.headings.textField}</h2>
        <div className="design-grid">
          <TextField label={fr.design.labels.fieldLabel} defaultValue={fr.design.labels.task} />
          <TextField disabled label={fr.design.labels.fieldLabel} defaultValue={fr.design.labels.task} />
          <TextField label={fr.design.labels.fieldLabel} error={fr.design.labels.fieldError} defaultValue="" />
        </div>
      </section>

      <section aria-labelledby="design-textarea-heading" className="design-section surface-raised">
        <h2 id="design-textarea-heading">{fr.design.headings.textArea}</h2>
        <div className="design-grid">
          <TextArea label={fr.design.labels.textAreaLabel} defaultValue={fr.design.description} />
          <TextArea label={fr.design.labels.textAreaLabel} error={fr.design.labels.textAreaError} defaultValue="" />
        </div>
      </section>

      <section aria-labelledby="design-segment-heading" className="design-section surface-raised">
        <h2 id="design-segment-heading">{fr.design.headings.segmented}</h2>
        <SegmentedControl
          label={fr.design.labels.segmentLabel}
          onValueChange={setView}
          options={[
            { value: 'list', label: fr.design.options.list },
            { value: 'grid', label: fr.design.options.grid },
            { value: 'compact', label: fr.design.options.compact },
          ]}
          value={view}
        />
      </section>

      <section aria-labelledby="design-accordion-heading" className="design-section surface-raised">
        <h2 id="design-accordion-heading">{fr.design.headings.accordion}</h2>
        <Accordion label={fr.design.headings.accordion}>
          <AccordionRow title={fr.design.states.default}>{fr.design.description}</AccordionRow>
          <AccordionRow defaultOpen title={fr.design.states.pressed}>{fr.design.labels.task}</AccordionRow>
        </Accordion>
      </section>

      <section aria-labelledby="design-ring-heading" className="design-section surface-raised">
        <h2 id="design-ring-heading">{fr.design.headings.progressRing}</h2>
        <div className="design-grid">
          <ProgressRing label={fr.design.progress.ring} value={0} />
          <ProgressRing label={fr.design.progress.ring} value={67} />
          <ProgressRing label={fr.design.progress.ring} value={100} />
        </div>
      </section>

      <section aria-labelledby="design-bar-heading" className="design-section surface-raised">
        <h2 id="design-bar-heading">{fr.design.headings.progressBar}</h2>
        <div className="design-progress-list">
          <ProgressBar label={fr.design.progress.bar} value={25} />
          <ProgressBar label={fr.design.progress.bar} value={67} />
          <ProgressBar label={fr.design.progress.bar} value={100} />
        </div>
      </section>

      <section aria-labelledby="design-badge-heading" className="design-section surface-raised">
        <h2 id="design-badge-heading">{fr.design.headings.numberBadge}</h2>
        <NumberBadge aria-label="3">3</NumberBadge>
      </section>

      <section aria-labelledby="design-sheet-heading" className="design-section surface-raised">
        <h2 id="design-sheet-heading">{fr.design.headings.sheet}</h2>
        <Button onClick={() => setSheetOpen(true)} variant="secondary">{fr.design.labels.openSheet}</Button>
        <Sheet label={fr.design.labels.sheet} onClose={() => setSheetOpen(false)} open={sheetOpen}>
          <h3>{fr.design.labels.sheet}</h3>
          <p>{fr.design.description}</p>
          <Button onClick={() => setSheetOpen(false)} variant="primary">{fr.design.labels.closeSheet}</Button>
        </Sheet>
      </section>

      <section aria-labelledby="design-bottom-nav-heading" className="design-section surface-raised">
        <h2 id="design-bottom-nav-heading">{fr.design.headings.bottomNav}</h2>
        <BottomNav active={activeTab} onAdd={() => setSheetOpen(true)} onNavigate={setActiveTab} />
      </section>

      <section aria-labelledby="design-toast-heading" className="design-section surface-raised">
        <h2 id="design-toast-heading">{fr.design.headings.toast}</h2>
        <Button onClick={() => setToastVisible(true)}>{fr.design.labels.showToast}</Button>
        {toastVisible && <Toast message={fr.design.labels.toast} onDismiss={() => setToastVisible(false)} onUndo={() => setToastVisible(false)} />}
      </section>

      <section aria-labelledby="design-skeleton-heading" className="design-section surface-raised">
        <h2 id="design-skeleton-heading">{fr.design.headings.skeleton}</h2>
        <div className="design-skeleton-card"><Skeleton height={22} width="55%" /><Skeleton height={16} width="92%" /><Skeleton height={16} width="72%" /></div>
      </section>

      <section aria-labelledby="design-empty-heading" className="design-section surface-raised">
        <h2 id="design-empty-heading">{fr.design.headings.emptyState}</h2>
        <EmptyState
          action={<Button variant="primary">{fr.design.labels.emptyAction}</Button>}
          description={fr.design.labels.emptyDescription}
          icon={<Bell size={28} />}
          title={fr.design.labels.emptyTitle}
        />
      </section>
    </main>
  );
}

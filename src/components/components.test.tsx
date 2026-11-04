import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Accordion, AccordionRow } from '@/components/Accordion';
import { BottomNav } from '@/components/BottomNav';
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

describe('Button', () => {
  it('supports variants, loading and disabled states', () => {
    render(<><Button variant="primary">Primary</Button><Button variant="destructive">Delete</Button><Button disabled>Disabled</Button><Button loading>Save</Button></>);
    expect(screen.getByRole('button', { name: 'Primary' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Disabled' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: /Save/ }).getAttribute('aria-busy')).toBe('true');
  });
});

describe('IconButton', () => {
  it('requires and exposes an accessible label', () => {
    render(<IconButton aria-label="Add item" icon={<span>+</span>} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeTruthy();
  });
});

describe('Card', () => {
  it('renders its content in a raised surface', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeTruthy();
  });
});

describe('Chip', () => {
  it('renders selected action state and handles activation', () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick} selected>Selected</Chip>);
    const chip = screen.getByRole('button', { name: 'Selected' });
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Checkbox', () => {
  it('exposes a checkbox state and toggles with activation', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} label="Done" onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Done' });
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('Toggle', () => {
  it('exposes a switch state and toggles with activation', () => {
    const onCheckedChange = vi.fn();
    render(<Toggle checked={false} label="Notifications" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    fireEvent.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('SearchBar', () => {
  it('reports text changes and clears its value', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar label="Search" onChange={onChange} onClear={onClear} value="abc" />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'abcd' } });
    expect(onChange).toHaveBeenCalledWith('abcd');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe('TextField', () => {
  it('connects its label and announces an error', () => {
    render(<TextField error="Required" label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Required')).toBeTruthy();
  });
});

describe('TextArea', () => {
  it('connects its label and error description', () => {
    render(<TextArea error="Too short" label="Details" />);
    const field = screen.getByRole('textbox', { name: 'Details' });
    expect(field.getAttribute('aria-describedby')).toContain('error');
    expect(screen.getByText('Too short')).toBeTruthy();
  });
});

describe('SegmentedControl', () => {
  it('supports radio options and arrow-key navigation', () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl label="View" onValueChange={onValueChange} options={[{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }]} value="list" />);
    const list = screen.getByRole('radio', { name: 'List' });
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(onValueChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeTruthy();
  });
});

describe('Accordion', () => {
  it('groups accessible rows', () => {
    render(<Accordion label="Sections"><AccordionRow title="More">More content</AccordionRow></Accordion>);
    expect(screen.getByRole('group', { name: 'Sections' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'More' }).getAttribute('aria-expanded')).toBe('false');
  });
});

describe('AccordionRow', () => {
  it('opens and closes its controlled panel', () => {
    render(<AccordionRow title="Details">Panel content</AccordionRow>);
    const trigger = screen.getByRole('button', { name: 'Details' });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Panel content').closest('[hidden]')).toBeNull();
  });
});

describe('ProgressRing', () => {
  it('exposes a bounded progress value and clamps its range', () => {
    render(<ProgressRing label="Ring" value={120} />);
    expect(screen.getByRole('progressbar', { name: 'Ring' }).getAttribute('aria-valuenow')).toBe('100');
  });
});

describe('ProgressBar', () => {
  it('exposes its progress value', () => {
    render(<ProgressBar label="Bar" value={42} />);
    expect(screen.getByRole('progressbar', { name: 'Bar' }).getAttribute('aria-valuenow')).toBe('42');
  });
});

describe('NumberBadge', () => {
  it('renders its count', () => {
    render(<NumberBadge aria-label="Three items">3</NumberBadge>);
    expect(screen.getByLabelText('Three items').textContent).toBe('3');
  });
});

describe('Sheet', () => {
  it('traps focus and closes with Escape', () => {
    const onClose = vi.fn();
    render(<Sheet label="Dialog" onClose={onClose} open><button type="button">Last action</button></Sheet>);
    const dialog = screen.getByRole('dialog', { name: 'Dialog' });
    const buttons = dialog.querySelectorAll('button');
    fireEvent.keyDown(buttons[buttons.length - 1] as HTMLButtonElement, { key: 'Tab' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('BottomNav', () => {
  it('provides four tabs and an add action', async () => {
    const onAdd = vi.fn();
    render(<BottomNav active="today" onAdd={onAdd} onNavigate={() => undefined} />);
    expect(screen.getByRole('navigation', { name: 'Navigation principale' }).querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    const navigation = screen.getByRole('navigation', { name: 'Navigation principale' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(5);
    fireEvent.click(within(navigation).getByRole('button', { name: 'Nouvelle tâche' }));
    await waitFor(() => expect(onAdd).toHaveBeenCalledOnce());
  });
});

describe('Toast', () => {
  it('announces its message and exposes the undo action', () => {
    const onUndo = vi.fn();
    render(<Toast message="Archived" onDismiss={() => undefined} onUndo={onUndo} />);
    expect(screen.getByRole('status').textContent).toContain('Archived');
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onUndo).toHaveBeenCalledOnce();
  });
});

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('EmptyState', () => {
  it('renders a labelled heading, description and action', () => {
    render(<EmptyState action={<button type="button">Create</button>} description="Nothing here" title="Empty" />);
    expect(screen.getByRole('heading', { name: 'Empty' })).toBeTruthy();
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  });
});

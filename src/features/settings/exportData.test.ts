import { describe, expect, it } from 'vitest';
import { buildCsv, buildTaskRows, buildXlsxBuffer, escapeIcs, escapeSpreadsheetText, EXPORT_TASK_HEADERS } from './exportData';
import type { ExportData } from './exportData';

const date = new Date('2026-01-02T03:04:05.000Z');
const data: ExportData = {
  tasks: [{
    id: 'task-1', title: '=formule', description: '+texte', status: 'done', completedAt: date, deletedAt: null,
    dueDate: date, priority: 1, startTime: '08:30', estimatedMinutes: 45, listId: 'list-1',
    tags: ['Important', 'Équipe'], links: ['https://example.test'], subtasks: [
      { id: 'sub-1', title: 'Sous-tâche', done: true }, { id: 'sub-2', title: 'À faire', done: false },
    ], recurrence: null, reminders: [], createdAt: date, updatedAt: date,
  }],
  lists: [{ id: 'list-1', name: 'Travail', order: 2, color: '#fff', icon: 'briefcase', createdAt: date, updatedAt: date }],
  tags: [{ id: 'tag-1', name: 'Important', order: 1, color: '#f00', createdAt: date, updatedAt: date }],
};

describe('export de données', () => {
  it('construit des lignes avec les libellés, dates et compteurs attendus', () => {
    const [row] = buildTaskRows(data);
    expect(row).toMatchObject({
      status: 'Terminée', priority: 'Urgente', list: 'Travail', tags: 'Important, Équipe',
      dueDate: date, subtaskCount: 2, completedSubtaskCount: 1,
    });
  });

  it('neutralise les valeurs qui pourraient être interprétées comme des formules', () => {
    for (const value of ['=x', '+x', '-x', '@x', '\tx', '\rx']) expect(escapeSpreadsheetText(value)).toBe(`'${value}`);
    expect(escapeSpreadsheetText('Équipe')).toBe('Équipe');
    expect(buildCsv(data)).toContain(`"'=formule"`);
  });

  it('neutralise les retours chariot et les sauts de ligne dans les propriétés calendrier', () => {
    expect(escapeIcs('Résumé\r\nBEGIN:VEVENT\rFIN')).toBe('Résumé\\nBEGIN:VEVENT\\nFIN');
  });

  it('produit un CSV UTF-8 BOM séparé par des points-virgules', () => {
    const csv = buildCsv(data);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.split('\r\n')[0]).toContain('Priorité');
    expect(csv).toContain(';');
    expect(csv).toContain('2026-01-02');
  });

  it('génère un classeur relisible avec les quatre feuilles et les en-têtes', async () => {
    const { Workbook } = await import('exceljs-hardened');
    const buffer = await buildXlsxBuffer(data);
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer);
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Tâches', 'Sous-tâches', 'Listes', 'Étiquettes']);
    const taskSheet = workbook.getWorksheet('Tâches');
    expect(EXPORT_TASK_HEADERS.map((_, index) => taskSheet?.getCell(1, index + 1).value)).toEqual([...EXPORT_TASK_HEADERS]);
    expect(taskSheet?.getCell('H2').value).toBeInstanceOf(Date);
    expect(taskSheet?.autoFilter).toBeDefined();
    expect(taskSheet?.views[0]?.state).toBe('frozen');
  });
});

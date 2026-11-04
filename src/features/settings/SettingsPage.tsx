import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, Cloud, Download, LogOut, Monitor, Moon, Palette, Sun, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/features/auth/useAuth';
import { downloadCalendar, downloadCsv, downloadXlsx, exportAccountData, type ExportOptions, type ExportProgress } from '@/features/settings/exportData';
import { usePreferences } from '@/features/settings/usePreferences';
import { useInstallPrompt } from '@/features/install/useInstallPrompt';
import { fr } from '@/i18n/fr';

export function SettingsPage() {
  const { user, signOut, errorMessage: authErrorMessage } = useAuth();
  const navigate = useNavigate();
  const { preferences, update } = usePreferences();
  const install = useInstallPrompt();
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({ includeHistory: true, includeTrash: false });
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const exportAbort = useRef<AbortController | null>(null);
  const provider = user?.providerData.find((item) => item.providerId === 'google.com') ? 'Google' : fr.settingsPage.email;

  async function exportData(format: 'xlsx' | 'csv') {
    if (!user) return;
    const controller = new AbortController();
    exportAbort.current = controller;
    setBusy(true); setError(''); setProgress({ current: 0, total: 0, phase: 'preparation' });
    try {
      const data = await exportAccountData(user.uid, exportOptions, setProgress, controller.signal);
      const date = new Date().toISOString().slice(0, 10);
      if (format === 'xlsx') await downloadXlsx(`dayflow-taches-${date}.xlsx`, data);
      else downloadCsv(`dayflow-taches-${date}.csv`, data);
      setToast(fr.settingsPage.exportDone);
    } catch (caught) {
      if (!(caught instanceof DOMException && caught.name === 'AbortError')) setError(fr.settingsPage.exportError);
    } finally {
      exportAbort.current = null;
      setBusy(false); setProgress(null);
    }
  }
  function cancelExport() { exportAbort.current?.abort(); }
  async function exportIcs() {
    if (!user) return;
    setBusy(true); setError('');
    try { const data = await exportAccountData(user.uid); downloadCalendar(data.tasks); setToast(fr.settingsPage.calendarDone); }
    catch { setError(fr.settingsPage.calendarError); }
    finally { setBusy(false); }
  }
  async function save<K extends 'theme' | 'firstDayOfWeek' | 'timeFormat' | 'density'>(key: K, value: Parameters<typeof update>[0][K]) {
    try { await update({ [key]: value }); }
    catch { setError(fr.settingsPage.saveError); }
  }

  const themeOptions = [
    { value: 'light', label: fr.settingsPage.themeLight, icon: <Sun aria-hidden="true" size={16} /> },
    { value: 'dark', label: fr.settingsPage.themeDark, icon: <Moon aria-hidden="true" size={16} /> },
    { value: 'auto', label: fr.settingsPage.themeAuto, icon: <Monitor aria-hidden="true" size={16} /> },
  ];
  return <div className="screen screen--settings">
    <header className="screen-heading"><p className="eyebrow">DayFlow</p><h1>{fr.pages.settings}</h1><p className="muted">{fr.settingsPage.description}</p></header>
    <Card className="profile-card"><span className="profile-avatar"><UserRound size={23} /></span><div className="profile-card__identity"><strong>{user?.displayName || fr.settingsPage.account}</strong><span>{user?.email}</span></div></Card>
    <SettingsSection icon={<Palette size={17} />} title={fr.settingsPage.appearance}>
      <div className="settings-row settings-row--stack"><span>{fr.settingsPage.theme}</span><SegmentedControl label={fr.settingsPage.theme} onValueChange={(value) => void save('theme', value as 'light' | 'dark' | 'auto')} options={themeOptions} value={preferences.theme} /></div>
      <div className="settings-row"><span>{fr.settingsPage.density}</span><SegmentedControl label={fr.settingsPage.density} onValueChange={(value) => void save('density', value as 'compact' | 'comfortable')} options={[{ value: 'compact', label: fr.settingsPage.compact }, { value: 'comfortable', label: fr.settingsPage.comfortable }]} value={preferences.density} /></div>
    </SettingsSection>
    <SettingsSection icon={<CalendarDays size={17} />} title={fr.settingsPage.planning}>
      <div className="settings-row"><span>{fr.settingsPage.weekStart}</span><SegmentedControl label={fr.settingsPage.weekStart} onValueChange={(value) => void save('firstDayOfWeek', value as 'monday' | 'sunday')} options={[{ value: 'monday', label: fr.settingsPage.monday }, { value: 'sunday', label: fr.settingsPage.sunday }]} value={preferences.firstDayOfWeek} /></div>
      <div className="settings-row"><span>{fr.settingsPage.timeFormat}</span><SegmentedControl label={fr.settingsPage.timeFormat} onValueChange={(value) => void save('timeFormat', value as '12h' | '24h')} options={[{ value: '24h', label: '24 h' }, { value: '12h', label: '12 h' }]} value={preferences.timeFormat} /></div>
    </SettingsSection>
    <SettingsSection icon={<Cloud size={17} />} title={fr.settingsPage.accountSync}>
      <div className="settings-row"><span className="settings-row__icon">{provider === 'Google' ? 'G' : <UserRound size={17} />}</span><span className="settings-row__label">{fr.settingsPage.account} {provider}<small>{user?.email}</small></span><strong className="connected-state"><Check size={14} />{fr.settingsPage.connected}</strong></div>
    </SettingsSection>
    <SettingsSection icon={<Download size={17} />} title={fr.settingsPage.data}>
      {install.isInstallAvailable && <button className="settings-row settings-row--button" onClick={install.requestInstall} type="button"><span><Download size={17} />{fr.install.settings}</span><ArrowRight size={16} /></button>}
      <div className="settings-export-options">
        <label><input checked={exportOptions.includeHistory} disabled={busy} onChange={(event) => setExportOptions((current) => ({ ...current, includeHistory: event.target.checked }))} type="checkbox" />{fr.settingsPage.includeHistory}</label>
        <label><input checked={exportOptions.includeTrash} disabled={busy} onChange={(event) => setExportOptions((current) => ({ ...current, includeTrash: event.target.checked }))} type="checkbox" />{fr.settingsPage.includeTrash}</label>
      </div>
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportData('xlsx')} type="button"><span><Download size={17} />{fr.settingsPage.exportXlsx}</span><span>XLSX <ArrowRight size={16} /></span></button>
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportData('csv')} type="button"><span><Download size={17} />{fr.settingsPage.exportCsv}</span><span>CSV <ArrowRight size={16} /></span></button>
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportIcs()} type="button"><span><CalendarDays size={17} />{fr.settingsPage.exportCalendar}</span><ArrowRight size={16} /></button>
      {busy && progress && <div className="settings-export-progress" role="status"><span>{fr.settingsPage.exportProgress}</span><span>{progress.current}{progress.total > 1 ? ` / ${progress.total}` : ''}</span><button className="link-button" onClick={cancelExport} type="button">{fr.settingsPage.cancelExport}</button></div>}
      <button className="settings-row settings-row--button" onClick={() => navigate('/trash')} type="button"><span><Trash2 size={17} />{fr.settingsPage.trash}</span><span>{fr.settingsPage.retention30}<ArrowRight size={16} /></span></button>
    </SettingsSection>
    <div className="sensitive-actions"><Button onClick={() => void signOut()} variant="secondary"><LogOut size={17} />{fr.settingsPage.signOut}</Button></div>
    {(error || authErrorMessage) && <p className="inline-error" role="alert">{error || authErrorMessage}</p>}
    {toast && <Toast message={toast} onDismiss={() => setToast('')} onUndo={() => setToast('')} />}
  </div>;
}

function SettingsSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="settings-section"><h2>{icon}{title}</h2><Card>{children}</Card></section>;
}

export function AccountDeletionPage() {
  return <Navigate replace to="/settings" />;
}

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, Cloud, Download, LogOut, Palette, Trash2, UserRound } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/features/auth/useAuth';
import { downloadCalendar, downloadJson, exportAccountData } from '@/features/settings/exportData';
import { usePreferences } from '@/features/settings/usePreferences';
import { fr } from '@/i18n/fr';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { preferences, update } = usePreferences();
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const provider = user?.providerData.find((item) => item.providerId === 'google.com') ? 'Google' : fr.settingsPage.email;

  useEffect(() => {
    document.documentElement.dataset.density = preferences.density;
    return () => { delete document.documentElement.dataset.density; };
  }, [preferences.density]);

  async function exportJson() {
    if (!user) return;
    setBusy(true); setError('');
    try { const data = await exportAccountData(user.uid); downloadJson('dayflow-export.json', { version: 1, exportedAt: new Date().toISOString(), ...data }); setToast(fr.settingsPage.exportDone); }
    catch { setError(fr.settingsPage.exportError); }
    finally { setBusy(false); }
  }
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
    { value: 'light', label: fr.settingsPage.themeLight },
    { value: 'dark', label: fr.settingsPage.themeDark },
    { value: 'auto', label: fr.settingsPage.themeAuto },
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
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportJson()} type="button"><span><Download size={17} />{fr.settingsPage.export}</span><span>JSON <ArrowRight size={16} /></span></button>
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportIcs()} type="button"><span><CalendarDays size={17} />{fr.settingsPage.exportCalendar}</span><ArrowRight size={16} /></button>
      <button className="settings-row settings-row--button" onClick={() => navigate('/trash')} type="button"><span><Trash2 size={17} />{fr.settingsPage.trash}</span><span>{fr.settingsPage.retention30}<ArrowRight size={16} /></span></button>
    </SettingsSection>
    <div className="sensitive-actions"><Button onClick={() => void signOut()} variant="secondary"><LogOut size={17} />{fr.settingsPage.signOut}</Button></div>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {toast && <Toast message={toast} onDismiss={() => setToast('')} onUndo={() => setToast('')} />}
  </div>;
}

function SettingsSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="settings-section"><h2>{icon}{title}</h2><Card>{children}</Card></section>;
}

export function AccountDeletionPage() {
  return <Navigate replace to="/settings" />;
}

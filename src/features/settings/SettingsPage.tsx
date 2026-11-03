import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CalendarDays, Check, Cloud, Download, FileUp, Flame, HelpCircle, LogOut, Moon, Palette, Settings2, Sun, Trash2, UserRound, Volume2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Sheet } from '@/components/Sheet';
import { SyncIndicator } from '@/components/SyncIndicator';
import { Toast } from '@/components/Toast';
import { Toggle } from '@/components/Toggle';
import { useAuth } from '@/features/auth/useAuth';
import { useTodayTasks } from '@/features/tasks';
import { downloadCalendar, downloadJson, exportAccountData } from '@/features/settings/exportData';
import { usePreferences } from '@/features/settings/usePreferences';
import { fr } from '@/i18n/fr';

export function SettingsPage() {
  const navigate = useNavigate(); const { user, signOut } = useAuth(); const { preferences, update } = usePreferences(); const today = useTodayTasks();
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [morning, setMorning] = useState(false); const [evening, setEvening] = useState(false); const [sound, setSound] = useState(false); const [quiet, setQuiet] = useState(false);
  const [toast, setToast] = useState(''); const [sheet, setSheet] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const provider = user?.providerData.find((item) => item.providerId === 'google.com') ? 'Google' : 'E-mail';

  useEffect(() => { document.documentElement.dataset.density = density; return () => { delete document.documentElement.dataset.density; }; }, [density]);

  function showInfo(message: string) { setToast(message); }
  async function exportJson() {
    if (!user) return;
    setBusy(true); setError('');
    try { const data = await exportAccountData(user.uid); downloadJson('dayflow-export.json', { version: 1, exportedAt: new Date().toISOString(), ...data }); showInfo(fr.settingsPage.exportDone); }
    catch { setError(fr.settingsPage.exportError); }
    finally { setBusy(false); }
  }
  async function exportIcs() {
    if (!user) return;
    setBusy(true); setError('');
    try { const data = await exportAccountData(user.uid); downloadCalendar(data.tasks); showInfo(fr.settingsPage.calendarDone); }
    catch { setError(fr.settingsPage.calendarError); }
    finally { setBusy(false); }
  }
  async function chooseTheme(value: string) {
    try { await update({ theme: value as 'light' | 'dark' | 'auto' }); }
    catch { setError(fr.settingsPage.themeError); }
  }
  async function chooseWeek(value: string) {
    try { await update({ firstDayOfWeek: value as 'monday' | 'sunday' }); }
    catch { setError(fr.settingsPage.weekError); }
  }
  async function chooseTimeFormat(value: string) {
    try { await update({ timeFormat: value as '12h' | '24h' }); }
    catch { setError(fr.settingsPage.timeError); }
  }

  const themeOptions = [{ value: 'light', label: fr.settingsPage.themeLight }, { value: 'dark', label: fr.settingsPage.themeDark }, { value: 'auto', label: fr.settingsPage.themeAuto }] as const;
  const future = (label: string, detail: string, icon: ReactNode) => <button className="settings-row settings-row--button" onClick={() => setSheet(`${label} — ${detail}`)} type="button"><span className="settings-row__icon">{icon}</span><span className="settings-row__label">{label}<small>{detail}</small></span><ArrowRight size={17} /></button>;

  return <div className="screen screen--settings">
    <header className="screen-heading screen-heading--row"><div><p className="eyebrow">DayFlow</p><h1>{fr.pages.settings}</h1><p className="muted">{fr.settingsPage.description}</p></div><Button aria-label={fr.settingsPage.help} onClick={() => setSheet(`${fr.settingsPage.help} · Les fonctionnalités indisponibles sont signalées dans leurs sections.`)}><HelpCircle size={18} /></Button></header>
    <Card className="profile-card"><span className="profile-avatar"><UserRound size={23} /></span><div className="profile-card__identity"><strong>{user?.displayName || fr.settingsPage.account}</strong><span>{user?.email}</span><SyncIndicator sync={today.sync} /></div><Button onClick={() => setSheet(`${fr.settingsPage.providerAccount} ${provider} · ${user?.email ?? ''}`)} variant="ghost">{fr.settingsPage.manage}<ArrowRight size={15} /></Button></Card>
    <SettingsSection icon={<Palette size={17} />} title={fr.settingsPage.appearance}>
      <div className="settings-row settings-row--stack"><span>{fr.settingsPage.theme}</span><SegmentedControl label={fr.settingsPage.theme} onValueChange={(value) => void chooseTheme(value)} options={themeOptions} value={preferences.theme} /></div>
      {future(fr.settingsPage.accent, fr.settingsPage.accentNote, <Palette size={17} />)}
      <div className="settings-row"><span>{fr.settingsPage.density}</span><SegmentedControl label={fr.settingsPage.density} onValueChange={(value) => setDensity(value as 'compact' | 'comfortable')} options={[{ value: 'compact', label: fr.settingsPage.compact }, { value: 'comfortable', label: fr.settingsPage.comfortable }]} value={density} /></div>
      {future(fr.settingsPage.home, fr.settingsPage.homeNote, <CalendarDays size={17} />)}
    </SettingsSection>
    <p className="feature-help">{fr.settingsPage.savedPrefs}</p>
    <SettingsSection icon={<Bell size={17} />} title={fr.settingsPage.notifications}>
      <SettingToggle label={fr.settingsPage.morning} detail={`08:00 · ${fr.settingsPage.sessionPreview.toLowerCase()}`} checked={morning} onChange={setMorning} icon={<Sun size={17} />} />
      <SettingToggle label={fr.settingsPage.evening} detail={`20:30 · ${fr.settingsPage.sessionPreview.toLowerCase()}`} checked={evening} onChange={setEvening} icon={<Moon size={17} />} />
      {future(fr.settingsPage.reminder, fr.settingsPage.noReminders, <Bell size={17} />)}
      <SettingToggle label={fr.settingsPage.doNotDisturb} detail={fr.settingsPage.sessionPreview} checked={quiet} onChange={setQuiet} icon={<Flame size={17} />} />
      <SettingToggle label={fr.settingsPage.sound} detail={fr.settingsPage.sessionPreview} checked={sound} onChange={setSound} icon={<Volume2 size={17} />} />
      <p className="feature-help">{fr.settingsPage.notificationNote}</p>
    </SettingsSection>
    <SettingsSection icon={<CalendarDays size={17} />} title="Planification">
      <div className="settings-row"><span>Premier jour de la semaine</span><SegmentedControl label="Premier jour de la semaine" onValueChange={(value) => void chooseWeek(value)} options={[{ value: 'monday', label: 'Lundi' }, { value: 'sunday', label: 'Dimanche' }]} value={preferences.firstDayOfWeek} /></div>
      <div className="settings-row"><span>Format de l’heure</span><SegmentedControl label="Format de l’heure" onValueChange={(value) => void chooseTimeFormat(value)} options={[{ value: '24h', label: '24 h' }, { value: '12h', label: '12 h' }]} value={preferences.timeFormat} /></div>
      {future('Durée par défaut', '30 min · non enregistrée', <Settings2 size={17} />)}
      {future('Report automatique', 'Indisponible sans règle de planification', <CalendarDays size={17} />)}
    </SettingsSection>
    <SettingsSection icon={<Cloud size={17} />} title="Compte & synchronisation">
      <div className="settings-row"><span className="settings-row__icon">G</span><span className="settings-row__label">Compte {provider}<small>{user?.email}</small></span><strong className="connected-state"><Check size={14} />Connecté</strong></div>
      <div className="settings-row"><span>Dernière synchronisation</span><span>{today.sync.isOffline ? 'Hors ligne' : today.sync.hasPendingWrites ? 'En attente' : 'Connecté'}</span></div>
      <div className="settings-row"><span>Mode hors ligne</span><span>{today.sync.fromCache ? 'Données locales' : 'Disponible'}</span></div>
    </SettingsSection>
    <SettingsSection icon={<Download size={17} />} title="Données">
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportJson()} type="button"><span><Download size={17} />Exporter mes données</span><span>JSON <ArrowRight size={16} /></span></button>
      {future('Importer une sauvegarde', 'Importation indisponible', <FileUp size={17} />)}
      <button className="settings-row settings-row--button" disabled={busy} onClick={() => void exportIcs()} type="button"><span><CalendarDays size={17} />Exporter le calendrier (.ics)</span><ArrowRight size={16} /></button>
      <button className="settings-row settings-row--button" onClick={() => navigate('/trash')} type="button"><span><Trash2 size={17} />Corbeille</span><span>30 jours<ArrowRight size={16} /></span></button>
    </SettingsSection>
    <SettingsSection icon={<HelpCircle size={17} />} title="À propos">
      <div className="settings-row"><span>Version de l’application</span><span>DayFlow</span></div>{future('Aide & support', 'Aide locale', <HelpCircle size={17} />)}{future('Politique de confidentialité', 'Document non fourni dans le projet', <Cloud size={17} />)}
    </SettingsSection>
    <div className="sensitive-actions"><Button onClick={() => void signOut()} variant="secondary"><LogOut size={17} />Se déconnecter</Button><Button onClick={() => navigate('/settings/delete-account')} variant="ghost"><Trash2 size={17} />Supprimer mon compte</Button></div>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {toast && <Toast message={toast} onDismiss={() => setToast('')} onUndo={() => setToast('')} />}
    <Sheet label="Information" onClose={() => setSheet('')} open={Boolean(sheet)}><h2>{sheet}</h2><p className="feature-help">Cette option n’écrit pas de données dans Firebase.</p><Button onClick={() => setSheet('')} variant="primary">Fermer</Button></Sheet>
  </div>;
}

function SettingsSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="settings-section"><h2>{icon}{title}</h2><Card>{children}</Card></section>;
}

function SettingToggle({ label, detail, checked, onChange, icon }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void; icon: ReactNode }) {
  return <div className="settings-row"><span className="settings-row__icon">{icon}</span><span className="settings-row__label">{label}<small>{detail}</small></span><Toggle checked={checked} label={`${label} (${detail})`} onCheckedChange={onChange} /></div>;
}

export function AccountDeletionPage() {
  const navigate = useNavigate();
  return <div className="screen screen--delete-account"><Card className="deletion-card"><Button onClick={() => navigate('/settings')} variant="ghost">Annuler</Button><p className="eyebrow">Zone de danger</p><Trash2 aria-hidden="true" size={42} /><h1>Supprimer mon compte</h1><p>La suppression définitive du compte n’est pas disponible dans la version actuelle. Les règles Firestore imposent une conservation des tâches de 30 jours, et cette application ne dispose pas d’un processus sécurisé de suppression complète.</p><p>Aucune donnée ne sera modifiée depuis cet écran. Contactez le support avant d’effacer vos données de connexion.</p><Button onClick={() => navigate('/settings')} variant="secondary">Conserver mon compte et annuler</Button></Card></div>;
}

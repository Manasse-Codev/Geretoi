import { useState } from 'react';
import { ArrowDown, ArrowUp, FolderOpen, ListChecks, Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { GuestState } from '@/components/GuestState';
import { TextField } from '@/components/TextField';
import { RetryNotice } from '@/components/RetryNotice';
import { useAuth } from '@/features/auth/useAuth';
import { useLists, createList, deleteList, renameList, reorderLists } from '@/features/lists';
import { createTag, deleteTag, renameTag, reorderTags, useTags } from '@/features/tags';
import { fr } from '@/i18n/fr';

type CollectionTab = 'lists' | 'tags';

export function ListsPage() {
  const { user } = useAuth(); const listsState = useLists(); const tagsState = useTags();
  const [tab, setTab] = useState<CollectionTab>('lists'); const [draft, setDraft] = useState(''); const [error, setError] = useState<string | null>(null); const [editing, setEditing] = useState<string | null>(null);

  async function add() {
    const name = draft.trim(); if (!name || !user) return;
    try { if (tab === 'lists') await createList(user.uid, { name, order: listsState.lists.length }); else await createTag(user.uid, { name, order: tagsState.tags.length }); setDraft(''); setError(null); }
    catch { setError(fr.listsPage.createError); }
  }
  async function changeName(id: string, value: string) {
    if (!user || !value.trim()) return;
    try { if (tab === 'lists') await renameList(user.uid, id, value); else await renameTag(user.uid, id, value); setEditing(null); setError(null); }
    catch { setError(fr.listsPage.renameError); }
  }
  async function remove(id: string, name: string) {
    if (!user || !window.confirm(`${fr.listsPage.confirmDelete} « ${name} » ? ${fr.listsPage.deleteNote}`)) return;
    try { if (tab === 'lists') await deleteList(user.uid, id); else await deleteTag(user.uid, id); setError(null); }
    catch { setError(fr.listsPage.deleteError); }
  }
  async function move(index: number, direction: -1 | 1) {
    if (!user) return;
    const entries = tab === 'lists' ? listsState.lists : tagsState.tags; const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= entries.length) return;
    const reordered = [...entries]; const current = reordered[index]; const next = reordered[nextIndex];
    if (!current || !next) return;
    reordered[index] = next; reordered[nextIndex] = current;
    try { if (tab === 'lists') await reorderLists(user.uid, reordered.map((item, order) => ({ id: item.id, order }))); else await reorderTags(user.uid, reordered.map((item, order) => ({ id: item.id, order }))); }
    catch { setError(fr.listsPage.reorderError); }
  }

  const entries = tab === 'lists' ? listsState.lists : tagsState.tags; const loading = tab === 'lists' ? listsState.loading : tagsState.loading; const stateError = tab === 'lists' ? listsState.errorMessage : tagsState.errorMessage;
  if (!user) return <div className="screen screen--lists"><header className="screen-heading"><p className="eyebrow"><ListChecks size={18} />{fr.listsPage.title}</p><h1>{fr.pages.lists}</h1><p className="muted">{fr.listsPage.description}</p></header><GuestState /></div>;

  return <div className="screen screen--lists">
    <header className="screen-heading"><p className="eyebrow"><ListChecks size={18} />{fr.listsPage.title}</p><h1>{fr.pages.lists}</h1><p className="muted">{fr.listsPage.description}</p></header>
    <div className="segmented collection-tabs" role="group" aria-label={fr.listsPage.type}><button aria-pressed={tab === 'lists'} className="filter-chip surface-raised" onClick={() => setTab('lists')} type="button"><FolderOpen size={16} />{fr.listsPage.lists}</button><button aria-pressed={tab === 'tags'} className="filter-chip surface-raised" onClick={() => setTab('tags')} type="button"><Tag size={16} />{fr.listsPage.tags}</button></div>
    <Card className="create-collection"><TextField label={tab === 'lists' ? fr.listsPage.listName : fr.listsPage.tagName} onChange={(event) => setDraft(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void add(); } }} placeholder={tab === 'lists' ? fr.listsPage.listExample : fr.listsPage.tagExample} value={draft} /><Button onClick={() => void add()} variant="primary"><Plus size={18} />{fr.listsPage.create}</Button></Card>
    {loading && entries.length === 0 ? <div className="task-skeleton surface-raised" aria-busy="true" /> : entries.length === 0 ? <EmptyState title={tab === 'lists' ? fr.listsPage.noLists : fr.listsPage.noTags} description={fr.pagesContent.emptyLists} /> : <div className="collection-list">{entries.map((entry, index) => <Card className="collection-row" key={entry.id}>{editing === entry.id ? <TextField label={fr.listsPage.rename} defaultValue={entry.name} onBlur={(event) => void changeName(entry.id, event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') void changeName(entry.id, event.currentTarget.value); if (event.key === 'Escape') setEditing(null); }} /> : <button className="collection-name" onClick={() => setEditing(entry.id)} type="button">{tab === 'lists' ? <FolderOpen size={19} /> : <Tag size={19} />}{entry.name}<span>{fr.listsPage.edit}</span></button>}<div className="collection-actions"><button aria-label={`${fr.listsPage.moveUp} ${entry.name}`} className="icon-button surface-raised" disabled={index === 0} onClick={() => void move(index, -1)} type="button"><ArrowUp size={17} /></button><button aria-label={`${fr.listsPage.moveDown} ${entry.name}`} className="icon-button surface-raised" disabled={index === entries.length - 1} onClick={() => void move(index, 1)} type="button"><ArrowDown size={17} /></button><button aria-label={`${fr.listsPage.delete} ${entry.name}`} className="icon-button surface-raised" onClick={() => void remove(entry.id, entry.name)} type="button"><Trash2 size={17} /></button></div></Card>)}</div>}
    {stateError && <RetryNotice loading={loading} message={stateError} onRetry={() => (tab === 'lists' ? listsState.retry : tagsState.retry)()} />}
    {error && <p className="inline-error" role="alert">{error}</p>}
  </div>;
}

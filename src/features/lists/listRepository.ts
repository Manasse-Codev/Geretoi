import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import type { CollectionReference, QuerySnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firestore';
import type { List, ListInput } from '@/types/models';
import type { SyncMetadata } from '@/features/tasks/taskRepository';
import { listConverter } from './listConverter';

const LIST_LIMIT = 100;
export function getListsCollection(uid: string): CollectionReference<List> {
  return collection(firestore, 'users', uid, 'lists').withConverter(listConverter);
}

function toSyncMetadata(snapshot: QuerySnapshot<List>): SyncMetadata {
  return { fromCache: snapshot.metadata.fromCache, hasPendingWrites: snapshot.metadata.hasPendingWrites, isOffline: typeof navigator !== 'undefined' && !navigator.onLine };
}

export function subscribeLists(uid: string, onData: (lists: List[], sync: SyncMetadata) => void, onError: (error: unknown) => void): () => void {
  return onSnapshot(query(getListsCollection(uid), orderBy('order', 'asc'), limit(LIST_LIMIT)), { includeMetadataChanges: true }, (snapshot) => {
    onData(snapshot.docs.map((item) => item.data()), toSyncMetadata(snapshot));
  }, onError);
}

export async function createList(uid: string, input: ListInput, now = new Date()): Promise<List> {
  const reference = doc(getListsCollection(uid));
  const list: List = { id: reference.id, name: input.name.trim(), ...(input.color ? { color: input.color } : {}), ...(input.icon ? { icon: input.icon } : {}), order: input.order ?? 0, createdAt: now, updatedAt: now };
  const batch = writeBatch(firestore);
  batch.set(reference, list);
  await batch.commit();
  return list;
}

export async function renameList(uid: string, id: string, name: string, now = new Date()): Promise<void> {
  await updateDoc(doc(getListsCollection(uid), id), { name: name.trim(), updatedAt: now });
}

export async function updateList(uid: string, id: string, changes: Pick<ListInput, 'name' | 'color' | 'icon'>, now = new Date()): Promise<void> {
  const fields = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
  await updateDoc(doc(getListsCollection(uid), id), { ...fields, updatedAt: now });
}

export async function reorderLists(uid: string, order: Array<{ id: string; order: number }>, now = new Date()): Promise<void> {
  const batch = writeBatch(firestore);
  for (const item of order) batch.update(doc(getListsCollection(uid), item.id), { order: item.order, updatedAt: now });
  await batch.commit();
}

export function deleteList(uid: string, id: string): Promise<void> {
  return deleteDoc(doc(getListsCollection(uid), id));
}

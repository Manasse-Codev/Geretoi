import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import type { CollectionReference, QuerySnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firestore';
import { shareSubscription } from '@/lib/sharedSubscription';
import type { Tag, TagInput } from '@/types/models';
import type { SyncMetadata } from '@/features/tasks/taskRepository';
import { tagConverter } from './tagConverter';

const TAG_LIMIT = 100;
export function getTagsCollection(uid: string): CollectionReference<Tag> {
  return collection(firestore, 'users', uid, 'tags').withConverter(tagConverter);
}

function toSyncMetadata(snapshot: QuerySnapshot<Tag>): SyncMetadata {
  return { fromCache: snapshot.metadata.fromCache, hasPendingWrites: snapshot.metadata.hasPendingWrites, isOffline: typeof navigator !== 'undefined' && !navigator.onLine };
}

export function subscribeTags(uid: string, onData: (tags: Tag[], sync: SyncMetadata) => void, onError: (error: unknown) => void): () => void {
  const queryRef = query(getTagsCollection(uid), orderBy('order', 'asc'), limit(TAG_LIMIT));
  return shareSubscription<{ tags: Tag[]; sync: SyncMetadata }>(`${uid}:tags`, (next, error) => onSnapshot(queryRef, { includeMetadataChanges: true }, (snapshot) => {
    next({ tags: snapshot.docs.map((item) => item.data()), sync: toSyncMetadata(snapshot) });
  }, error), (value) => onData(value.tags, value.sync), onError);
}

export async function createTag(uid: string, input: TagInput, now = new Date()): Promise<Tag> {
  const reference = doc(getTagsCollection(uid));
  const tag: Tag = { id: reference.id, name: input.name.trim(), ...(input.color ? { color: input.color } : {}), order: input.order ?? 0, createdAt: now, updatedAt: now };
  const batch = writeBatch(firestore);
  batch.set(reference, tag);
  await batch.commit();
  return tag;
}

export async function renameTag(uid: string, id: string, name: string, now = new Date()): Promise<void> {
  await updateDoc(doc(getTagsCollection(uid), id), { name: name.trim(), updatedAt: now });
}

export async function updateTag(uid: string, id: string, changes: TagInput, now = new Date()): Promise<void> {
  const fields = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
  await updateDoc(doc(getTagsCollection(uid), id), { ...fields, updatedAt: now });
}

export async function reorderTags(uid: string, order: Array<{ id: string; order: number }>, now = new Date()): Promise<void> {
  const batch = writeBatch(firestore);
  for (const item of order) batch.update(doc(getTagsCollection(uid), item.id), { order: item.order, updatedAt: now });
  await batch.commit();
}

export function deleteTag(uid: string, id: string): Promise<void> {
  return deleteDoc(doc(getTagsCollection(uid), id));
}

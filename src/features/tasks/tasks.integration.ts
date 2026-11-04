import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { disableNetwork, doc, getDoc, getDocFromServer, enableNetwork, writeBatch } from 'firebase/firestore';
import { auth, firebaseApp } from '@/lib/firebase';
import type { Task } from '@/types/models';
import {
  completeTask, createTask, getCompletedTasksInPeriod, getHistoryPage, getTask, getTasksCollection, getTrashPage, purgeExpiredTasks, reopenTask,
  restoreTask, softDeleteTask, subscribeOverdueTasks, subscribeTodayTasks, subscribeUpcomingTasks,
} from './taskRepository';
import { createList, deleteList, getListsCollection, renameList, reorderLists } from '@/features/lists/listRepository';
import { createTag, deleteTag, getTagsCollection, renameTag, reorderTags } from '@/features/tags/tagRepository';
import { firestore } from '@/lib/firestore';

if (import.meta.env.VITE_USE_EMULATORS !== 'true') {
  throw new Error('Les tests d’intégration des tâches exigent VITE_USE_EMULATORS=true.');
}
const firebaseProjectConfig = JSON.parse(readFileSync(resolve(process.cwd(), '.firebaserc'), 'utf8')) as { projects?: { default?: string } };
if (firebaseApp.options.projectId !== firebaseProjectConfig.projects?.default) {
  throw new Error('Les tests d’intégration doivent utiliser le projet Firebase de développement déclaré dans .firebaserc.');
}

let currentUid: string | null = null;
const createdUsers: Array<{ uid: string; email: string; password: string }> = [];

async function createTestUser(): Promise<string> {
  const suffix = `${Date.now()}-${crypto.randomUUID()}`;
  const email = `dayflow-${suffix}@example.test`;
  const password = 'Test-password-123';
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  currentUid = credential.user.uid;
  createdUsers.push({ uid: credential.user.uid, email, password });
  return currentUid;
}

function listenUntil(
  subscribe: (onData: (tasks: Task[]) => void, onError: (error: unknown) => void) => () => void,
  predicate: (tasks: Task[]) => boolean,
): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    let unsubscribe: () => void = () => undefined;
    const timeout = setTimeout(() => { unsubscribe(); reject(new Error('Délai dépassé en attendant la requête temps réel.')); }, 5000);
    unsubscribe = subscribe((tasks) => {
      if (!predicate(tasks)) return;
      clearTimeout(timeout); unsubscribe(); resolve(tasks);
    }, (error) => { clearTimeout(timeout); unsubscribe(); reject(error); });
  });
}

beforeEach(async () => { await createTestUser(); });
afterEach(async () => {
  for (const testUser of createdUsers) {
    if (auth.currentUser?.uid !== testUser.uid) {
      if (auth.currentUser) await signOut(auth);
      const credential = await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
      await deleteUser(credential.user);
    } else if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  }
  createdUsers.length = 0;
  currentUid = null;
});

describe('dépôt des tâches sur les émulateurs Auth et Firestore', () => {
  it('conserve une création hors ligne localement puis la synchronise au retour du réseau', async () => {
    const uid = currentUid as string;
    await disableNetwork(firestore);
    try {
      const task = await createTask(uid, { title: 'Créée sans réseau' }, new Date(), false);
      expect((await getTask(uid, task.id)).title).toBe('Créée sans réseau');

      await enableNetwork(firestore);
      const serverSnapshot = await getDocFromServer(doc(getTasksCollection(uid), task.id));
      expect(serverSnapshot.data()?.title).toBe('Créée sans réseau');
    } finally {
      await enableNetwork(firestore);
    }
  });

  it('crée, complète, rouvre, supprime en douceur et restaure une tâche', async () => {
    const uid = currentUid as string;
    const task = await createTask(uid, { title: 'Vérifier le dépôt' });
    expect(task.priority).toBe(3);
    expect((await getTask(uid, task.id)).status).toBe('active');

    await completeTask(uid, task.id);
    const completed = await getTask(uid, task.id);
    expect(completed.completedAt).toBeInstanceOf(Date);
    expect(completed.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
    await reopenTask(uid, task.id);
    expect((await getTask(uid, task.id)).completedAt).toBeNull();

    await softDeleteTask(uid, task.id);
    expect((await getTrashPage(uid)).tasks.map((item) => item.id)).toContain(task.id);
    await restoreTask(uid, task.id);
    expect((await getTask(uid, task.id)).deletedAt).toBeNull();
  });

  it('alimente les requêtes temps réel Aujourd’hui et En retard', async () => {
    const uid = currentUid as string;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const overdueDate = new Date(today);
    overdueDate.setDate(overdueDate.getDate() - 2);
    const upcomingDate = new Date(today);
    upcomingDate.setDate(upcomingDate.getDate() + 2);
    const todayTask = await createTask(uid, { title: 'Aujourd’hui', dueDate: today });
    const overdueTask = await createTask(uid, { title: 'En retard', dueDate: overdueDate });
    const upcomingTask = await createTask(uid, { title: 'À venir', dueDate: upcomingDate });

    const [todayResult, overdueResult, upcomingResult] = await Promise.all([
      listenUntil((onData, onError) => subscribeTodayTasks(uid, new Date(), (tasks) => onData(tasks), onError), (tasks) => tasks.some((task) => task.id === todayTask.id)),
      listenUntil((onData, onError) => subscribeOverdueTasks(uid, new Date(), (tasks) => onData(tasks), onError), (tasks) => tasks.some((task) => task.id === overdueTask.id)),
      listenUntil((onData, onError) => subscribeUpcomingTasks(uid, new Date(), (tasks) => onData(tasks), onError), (tasks) => tasks.some((task) => task.id === upcomingTask.id)),
    ]);
    expect(todayResult.map((task) => task.id)).toContain(todayTask.id);
    expect(overdueResult.map((task) => task.id)).toContain(overdueTask.id);
    expect(upcomingResult.map((task) => task.id)).toContain(upcomingTask.id);
  });

  it.each([{ count: 120, expectedMinutes: 1800 }, { count: 250, expectedMinutes: 3750 }])('calcule les totaux exacts avec $count tâches terminées', async ({ count, expectedMinutes }) => {
    const uid = currentUid as string;
    const now = new Date();
    const batch = writeBatch(firestore);
    for (let index = 0; index < count; index += 1) {
      const reference = doc(getTasksCollection(uid));
      batch.set(reference, {
        id: reference.id,
        title: `Tâche terminée ${index}`,
        status: 'done',
        completedAt: now,
        deletedAt: null,
        dueDate: null,
        priority: 3,
        estimatedMinutes: 15,
        listId: null,
        tags: [],
        links: [],
        subtasks: [],
        recurrence: null,
        reminders: [],
        createdAt: now,
        updatedAt: now,
      } satisfies Task);
    }
    await batch.commit();

    const periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const result = await getCompletedTasksInPeriod(uid, periodStart, now, 7);
    expect(result.tasks).toHaveLength(5);
    expect(result.completedCount).toBe(count);
    expect(result.estimatedMinutes).toBe(expectedMinutes);
    expect(result.dailyCounts.reduce((total, value) => total + value, 0)).toBe(count);
  });

  it('pagine l’historique par 20 tâches terminées', async () => {
    const uid = currentUid as string;
    const completedAt = new Date();
    for (let index = 0; index < 21; index += 1) {
      const task = await createTask(uid, { title: `Historique ${index}` });
      await completeTask(uid, task.id, new Date(completedAt.getTime() + index));
    }
    const first = await getHistoryPage(uid);
    expect(first.tasks).toHaveLength(20);
    expect(first.hasMore).toBe(true);
    expect(first.tasks.every((task) => task.status === 'done' && task.completedAt !== null)).toBe(true);
    const second = await getHistoryPage(uid, first.cursor);
    expect(second.tasks).toHaveLength(1);
    expect(second.hasMore).toBe(false);
  });

  it('pagine la corbeille par 20 tâches supprimées', async () => {
    const uid = currentUid as string;
    for (let index = 0; index < 21; index += 1) {
      const task = await createTask(uid, { title: `Corbeille ${index}` });
      await softDeleteTask(uid, task.id, new Date(Date.now() - index));
    }
    const first = await getTrashPage(uid);
    expect(first.tasks).toHaveLength(20);
    expect(first.hasMore).toBe(true);
    const second = await getTrashPage(uid, first.cursor);
    expect(second.tasks).toHaveLength(1);
    expect(second.hasMore).toBe(false);
  });

  it('purge seulement les tâches de corbeille dont la rétention est échue', async () => {
    const uid = currentUid as string;
    const now = new Date();
    const expired = await createTask(uid, { title: 'À purger' }, new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000));
    const recent = await createTask(uid, { title: 'À conserver' }, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000));
    await softDeleteTask(uid, expired.id, new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000));
    await softDeleteTask(uid, recent.id, new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));

    expect(await purgeExpiredTasks(uid, now)).toBe(1);
    await expect(getTask(uid, expired.id)).rejects.toMatchObject({ code: 'notFound' });
    expect((await getTask(uid, recent.id)).deletedAt).toBeInstanceOf(Date);
  });

  it('isole les données entre deux utilisateurs', async () => {
    const ownerUid = currentUid as string;
    const ownerTask = await createTask(ownerUid, { title: 'Privée' });
    await signOut(auth);
    const otherUid = await createTestUser();
    const otherTask = await createTask(otherUid, { title: 'Autre utilisateur' });
    await signOut(auth);
    // Reconnect the original owner through the Auth Emulator.
    const owner = createdUsers.find((item) => item.uid === ownerUid);
    if (!owner) throw new Error('Utilisateur de test introuvable.');
    await signInWithEmailAndPassword(auth, owner.email, owner.password);
    // The owner UID is supplied to the repository; Firestore rules still enforce the active token.
    await expect(getTask(otherUid, otherTask.id)).rejects.toMatchObject({ code: 'permission-denied' });
    expect((await getTask(ownerUid, ownerTask.id)).title).toBe('Privée');
  });

  it('crée et met à jour les listes et tags avec updatedAt', async () => {
    const uid = currentUid as string;
    const list = await createList(uid, { name: 'Perso', order: 2 });
    const secondList = await createList(uid, { name: 'Travail', order: 1 });
    await renameList(uid, list.id, 'Personnel');
    await reorderLists(uid, [{ id: list.id, order: 0 }, { id: secondList.id, order: 1 }]);
    const tag = await createTag(uid, { name: 'Maison', order: 2 });
    const secondTag = await createTag(uid, { name: 'Travail', order: 1 });
    await renameTag(uid, tag.id, 'Domicile');
    await reorderTags(uid, [{ id: tag.id, order: 0 }, { id: secondTag.id, order: 1 }]);
    const updatedList = await getDoc(doc(getListsCollection(uid), list.id));
    const updatedTag = await getDoc(doc(getTagsCollection(uid), tag.id));
    expect(updatedList.data()?.updatedAt.getTime()).toBeGreaterThanOrEqual(list.updatedAt.getTime());
    expect(updatedTag.data()?.updatedAt.getTime()).toBeGreaterThanOrEqual(tag.updatedAt.getTime());
    await deleteList(uid, secondList.id);
    await deleteTag(uid, tag.id);
    await deleteTag(uid, secondTag.id);
  });
});

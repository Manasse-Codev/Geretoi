import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

function configuredProjectId(): string {
  const envProjectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;
  if (envProjectId) return envProjectId;
  const config = JSON.parse(readFileSync(resolve(process.cwd(), '.firebaserc'), 'utf8')) as {
    projects?: { default?: string };
  };
  const defaultProjectId = config.projects?.default;
  if (!defaultProjectId) throw new Error('Un projet par défaut doit être défini pour les émulateurs Firebase.');
  return defaultProjectId;
}

const projectId = configuredProjectId();
let testEnvironment: RulesTestEnvironment;

const validTask = {
  title: 'Préparer le repas',
  status: 'active',
  priority: 1,
  completedAt: null,
  deletedAt: null,
  dueDate: null,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  listId: null,
  tags: [],
  links: [],
  subtasks: [],
  recurrence: null,
  reminders: [],
};

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: '127.0.0.1',
      port: 18080,
      rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
    },
  });
});

afterEach(async () => testEnvironment.clearFirestore());
afterAll(async () => testEnvironment.cleanup());

describe('règles Firestore (émulateur)', () => {
  it('refuse les lectures sans authentification', async () => {
    const db = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'users/owner/tasks/task-1')));
  });

  it('refuse la lecture et l’écriture sur le compte d’un autre uid', async () => {
    const db = testEnvironment.authenticatedContext('visitor').firestore();
    const task = doc(db, 'users/owner/tasks/task-1');
    await assertFails(getDoc(task));
    await assertFails(setDoc(task, validTask));
  });

  it('autorise le propriétaire à lire et écrire une tâche valide', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const task = doc(db, 'users/owner/tasks/task-1');
    await assertSucceeds(setDoc(task, validTask));
    await assertSucceeds(getDoc(task));
  });

  it('autorise le propriétaire à créer ses préférences et ses collections', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const profile = doc(db, 'users/owner/profile/preferences');
    await assertSucceeds(setDoc(profile, {
      theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'comfortable',
    }));
    await assertSucceeds(setDoc(doc(db, 'users/owner/lists/list-1'), { name: 'Personnel' }));
    await assertSucceeds(setDoc(doc(db, 'users/owner/tags/tag-1'), { name: 'Maison' }));
    await assertFails(getDoc(doc(testEnvironment.authenticatedContext('visitor').firestore(), 'users/owner/profile/preferences')));
  });

  it('valide la densité du profil', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const profile = doc(db, 'users/owner/profile/preferences');
    await assertSucceeds(setDoc(profile, {
      theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'compact',
    }));
    await assertFails(setDoc(profile, {
      theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'tiny',
    }));
  });

  it.each([
    ['un titre vide', { ...validTask, title: '' }],
    ['un statut inconnu', { ...validTask, status: 'archived' }],
    ['une tâche terminée sans date de complétion', { ...validTask, status: 'done' }],
    ['une priorité hors limites', { ...validTask, priority: 9 }],
    ['un champ non prévu', { ...validTask, internalFlag: true }],
    ['une liste de sous-tâches trop longue', { ...validTask, subtasks: Array.from({ length: 51 }, () => ({})) }],
    ['une référence de liste non textuelle', { ...validTask, listId: 12 }],
  ])('refuse une tâche invalide (%s)', async (_description, taskData) => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(db, 'users/owner/tasks/invalid'), taskData));
  });

  it('refuse une collection non déclarée, même sous le uid du propriétaire', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(db, 'users/owner/privateNotes/note-1'), { note: 'non autorisée' }));
  });

  it('refuse la suppression définitive immédiate d’une tâche', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/owner/tasks/task-1'), validTask);
    });
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(deleteDoc(doc(db, 'users/owner/tasks/task-1')));
  });

  it('autorise la purge d’une tâche en corbeille depuis plus de 30 jours', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/owner/tasks/task-1'), {
        ...validTask,
        deletedAt: Timestamp.fromMillis(Date.now() - 31 * 24 * 60 * 60 * 1000),
      });
    });
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertSucceeds(deleteDoc(doc(db, 'users/owner/tasks/task-1')));
  });
});

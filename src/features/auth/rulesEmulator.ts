import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

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
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
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

  it('refuse une liste sans limite et autorise une requête bornée', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/owner/tasks/task-1'), validTask);
    });
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const tasks = collection(db, 'users/owner/tasks');
    await assertFails(getDocs(tasks));
    await assertSucceeds(getDocs(query(tasks, limit(100))));
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
    await assertSucceeds(setDoc(doc(db, 'users/owner/lists/list-1'), { name: 'Personnel', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
    await assertSucceeds(setDoc(doc(db, 'users/owner/tags/tag-1'), { name: 'Maison', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
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
    ['un titre surdimensionné', { ...validTask, title: 'x'.repeat(201) }],
    ['une description surdimensionnée', { ...validTask, description: 'x'.repeat(10001) }],
    ['un mauvais type de date', { ...validTask, dueDate: 'demain' }],
    ['un tableau de liens surdimensionné', { ...validTask, links: Array.from({ length: 21 }, () => 'https://example.test') }],
    ['une date de complétion sur une tâche active', { ...validTask, completedAt: Timestamp.now() }],
    ['un champ de rôle inattendu', { ...validTask, isAdmin: true }],
  ])('refuse une tâche invalide (%s)', async (_description, taskData) => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(db, 'users/owner/tasks/invalid'), taskData));
  });

  it.each([
    ['zéro', 0],
    ['négatif', -5],
    ['au-delà de 24 heures', 1441],
    ['décimal', 12.5],
    ['chaîne', '30'],
    ['très grand nombre', Number.MAX_SAFE_INTEGER],
  ])('refuse estimatedMinutes invalide (%s)', async (_description, estimatedMinutes) => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(db, 'users/owner/tasks/invalid-duration'), { ...validTask, estimatedMinutes }));
  });

  it('autorise estimatedMinutes absent, null et borné', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertSucceeds(setDoc(doc(db, 'users/owner/tasks/no-duration'), validTask));
    await assertSucceeds(setDoc(doc(db, 'users/owner/tasks/null-duration'), { ...validTask, estimatedMinutes: null }));
    await assertSucceeds(setDoc(doc(db, 'users/owner/tasks/min-duration'), { ...validTask, estimatedMinutes: 1 }));
    await assertSucceeds(setDoc(doc(db, 'users/owner/tasks/max-duration'), { ...validTask, estimatedMinutes: 1440 }));
  });

  it('refuse une collection non déclarée, même sous le uid du propriétaire', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    await assertFails(setDoc(doc(db, 'users/owner/privateNotes/note-1'), { note: 'non autorisée' }));
  });

  it('traite un identifiant contenant des séparateurs encodés comme une valeur locale au document', async () => {
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const reference = doc(db, 'users/owner/tasks/uid%2Fvisitor..task-1');
    await assertSucceeds(setDoc(reference, validTask));
    await assertSucceeds(getDoc(reference));
    await assertFails(getDoc(doc(db, 'users/visitor/tasks/task-1')));
  });

  it('refuse la modification de createdAt mais permet la modification de updatedAt', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/owner/tasks/task-1'), validTask);
    });
    const db = testEnvironment.authenticatedContext('owner').firestore();
    const reference = doc(db, 'users/owner/tasks/task-1');
    await assertFails(updateDoc(reference, { createdAt: Timestamp.fromMillis(1), updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(reference, { updatedAt: Timestamp.now() }));
    await assertSucceeds(updateDoc(reference, { title: 'Titre valide', updatedAt: serverTimestamp() }));
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

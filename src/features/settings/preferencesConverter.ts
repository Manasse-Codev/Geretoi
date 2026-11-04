import type { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase/firestore';
import type { UserPreferences } from '@/types/models';

export type PreferencesDocument = UserPreferences;

export const preferencesConverter: FirestoreDataConverter<UserPreferences, PreferencesDocument> = {
  toFirestore(model: WithFieldValue<UserPreferences>): WithFieldValue<PreferencesDocument> {
    return model;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): UserPreferences {
    const data = snapshot.data();
    return {
      theme: data.theme as UserPreferences['theme'],
      language: data.language as UserPreferences['language'],
      firstDayOfWeek: data.firstDayOfWeek as UserPreferences['firstDayOfWeek'],
      timeFormat: data.timeFormat as UserPreferences['timeFormat'],
      density: data.density === 'compact' ? 'compact' : 'comfortable',
    };
  },
};

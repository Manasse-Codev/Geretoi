import { Timestamp } from 'firebase/firestore';
import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from 'firebase/firestore';
import type { List } from '@/types/models';

type ListDocument = Omit<List, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: Timestamp; updatedAt: Timestamp };
const epoch = new Date(0);
const toDate = (value: unknown): Date => value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : epoch;

export const listConverter: FirestoreDataConverter<List, ListDocument> = {
  toFirestore(model: WithFieldValue<List>): WithFieldValue<ListDocument> {
    const { id, ...fields } = model;
    void id;
    return {
      ...fields,
      createdAt: fields.createdAt instanceof Date ? Timestamp.fromDate(fields.createdAt) : fields.createdAt,
      updatedAt: fields.updatedAt instanceof Date ? Timestamp.fromDate(fields.updatedAt) : fields.updatedAt,
    } as WithFieldValue<ListDocument>;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): List {
    const data = snapshot.data(options) as Partial<ListDocument>;
    return {
      id: snapshot.id,
      name: typeof data.name === 'string' ? data.name : '',
      ...(typeof data.color === 'string' ? { color: data.color } : {}),
      ...(typeof data.icon === 'string' ? { icon: data.icon } : {}),
      order: typeof data.order === 'number' ? data.order : 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

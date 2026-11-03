import { Timestamp } from 'firebase/firestore';
import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from 'firebase/firestore';
import type { Tag } from '@/types/models';

type TagDocument = Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: Timestamp; updatedAt: Timestamp };
const epoch = new Date(0);
const toDate = (value: unknown): Date => value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : epoch;

export const tagConverter: FirestoreDataConverter<Tag, TagDocument> = {
  toFirestore(model: WithFieldValue<Tag>): WithFieldValue<TagDocument> {
    const { id, ...fields } = model;
    void id;
    return {
      ...fields,
      createdAt: fields.createdAt instanceof Date ? Timestamp.fromDate(fields.createdAt) : fields.createdAt,
      updatedAt: fields.updatedAt instanceof Date ? Timestamp.fromDate(fields.updatedAt) : fields.updatedAt,
    } as WithFieldValue<TagDocument>;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Tag {
    const data = snapshot.data(options) as Partial<TagDocument>;
    return {
      id: snapshot.id,
      name: typeof data.name === 'string' ? data.name : '',
      ...(typeof data.color === 'string' ? { color: data.color } : {}),
      order: typeof data.order === 'number' ? data.order : 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import app from '../config/firebase';

const db = getFirestore(app);
const MAX_VERSIONS = 30;

export interface DiagramVersion {
  id: string;
  code: string;
  title: string;
  createdAt: Date;
}

interface VersionDoc {
  code: string;
  title: string;
  createdAt: unknown;
}

function versionsRef(userId: string) {
  return collection(db, 'users', userId, 'diagrams', 'current', 'versions');
}

/** Save a new version snapshot */
export async function saveVersion(userId: string, code: string, title: string): Promise<void> {
  await addDoc(versionsRef(userId), { code, title, createdAt: serverTimestamp() });
  await pruneOldVersions(userId);
}

/** List versions ordered by most recent first */
export async function listVersions(userId: string, max = MAX_VERSIONS): Promise<DiagramVersion[]> {
  const q = query(versionsRef(userId), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as VersionDoc;
    return {
      id: d.id,
      code: data.code,
      title: data.title,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
}

/** Delete a specific version */
export async function deleteVersion(userId: string, versionId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'diagrams', 'current', 'versions', versionId));
}

/** Keep only the most recent MAX_VERSIONS */
async function pruneOldVersions(userId: string): Promise<void> {
  const all = await listVersions(userId, MAX_VERSIONS + 10);
  if (all.length <= MAX_VERSIONS) return;
  const toDelete = all.slice(MAX_VERSIONS);
  await Promise.all(toDelete.map((v) => deleteVersion(userId, v.id)));
}

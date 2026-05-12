import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import app from '../config/firebase';

const db = getFirestore(app);

export interface CloudDiagram {
  code: string;
  title: string;
  updatedAt: unknown;
}

/** Save current diagram to user's cloud storage */
export async function saveToCloud(userId: string, code: string, title: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'diagrams', 'current');
  await setDoc(ref, { code, title, updatedAt: serverTimestamp() }, { merge: true });
}

/** Load user's last saved diagram from cloud */
export async function loadFromCloud(userId: string): Promise<CloudDiagram | null> {
  const ref = doc(db, 'users', userId, 'diagrams', 'current');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as CloudDiagram) : null;
}

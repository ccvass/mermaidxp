import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setMermaidCode } from '../store/slices/diagramSlice';
import { showNotification } from '../store/slices/uiSlice';
import { useAuth } from '../contexts/AuthContext';
import { saveToCloud, loadFromCloud } from '../services/cloudSaveService';
import { saveVersion } from '../services/versionHistoryService';

/** Auto-saves diagram to Firebase when user is authenticated. Debounced 5s. */
export function useCloudSync() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const mermaidCode = useAppSelector((s) => s.diagram.mermaidCode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedRef = useRef(false);
  const lastSavedRef = useRef<string>('');

  // Load from cloud on first auth
  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    loadFromCloud(user.uid).then((data) => {
      if (data?.code) {
        dispatch(setMermaidCode(data.code));
        lastSavedRef.current = data.code;
        dispatch(showNotification({ message: 'Diagram loaded from cloud', type: 'info' }));
      }
    }).catch(() => { /* silent */ });
  }, [user, dispatch]);

  // Auto-save on code change (debounced 5s) + save version
  useEffect(() => {
    if (!user || !mermaidCode.trim()) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveToCloud(user.uid, mermaidCode, 'Current Diagram').catch(() => { /* silent */ });
      // Save version only if code actually changed
      if (mermaidCode !== lastSavedRef.current) {
        lastSavedRef.current = mermaidCode;
        saveVersion(user.uid, mermaidCode, 'Auto-save').catch(() => { /* silent */ });
      }
    }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [user, mermaidCode]);
}

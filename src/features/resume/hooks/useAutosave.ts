import { useEffect, useRef } from 'react';
import { useResumeStore } from '../store/useResumeStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

const AUTOSAVE_DEBOUNCE_MS = 2000;

export const useAutosave = () => {
  const { resume, isDirty, saveResume } = useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only trigger autosave if state is dirty (has changes)
    if (!isDirty) return;

    // Clear previous pending debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set 2-second debounced background save
    timerRef.current = setTimeout(() => {
      // Check network connectivity before saving
      if (typeof window !== 'undefined' && !navigator.onLine && isAuthenticated) {
        console.warn('Network offline. Autosave deferred.');
        return;
      }

      saveResume(isAuthenticated);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resume, isDirty, isAuthenticated, saveResume]);

  // Window unload listener to flush unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        saveResume(isAuthenticated);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isAuthenticated, saveResume]);
};

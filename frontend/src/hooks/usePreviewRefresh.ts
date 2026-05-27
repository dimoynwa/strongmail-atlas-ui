import { useCallback, useEffect, useRef } from 'react';
import { useSessionStore } from '../store/sessionStore';

export function usePreviewRefresh(): void {
  const workingCopy = useSessionStore((state) => state.workingCopy);
  const refreshPreview = useSessionStore((state) => state.refreshPreview);
  const sessionId = useSessionStore((state) => state.sessionId);
  const isFirstRun = useRef(true);

  const debouncedRefresh = useCallback(() => {
    void refreshPreview();
  }, [refreshPreview]);

  useEffect(() => {
    if (!sessionId) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    debouncedRefresh();
  }, [workingCopy, sessionId, debouncedRefresh]);
}

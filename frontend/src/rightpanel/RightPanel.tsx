import { WorkingCopySection } from './WorkingCopySection';
import { ToneSection } from './ToneSection';
import { StaleSessionBanner } from './StaleSessionBanner';
import { useAppStore } from '../store/appStore';
import { useSessionStore } from '../store/sessionStore';

export function RightPanel() {
  const staleSessionBannerTarget = useAppStore((state) => state.staleSessionBannerTarget);
  const dismissStaleSessionBanner = useAppStore((state) => state.dismissStaleSessionBanner);
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);
  const openTemplate = useSessionStore((state) => state.openTemplate);

  const showBanner =
    sessionId !== null &&
    staleSessionBannerTarget !== null &&
    templateName === staleSessionBannerTarget;

  const handleReopen = () => {
    if (!staleSessionBannerTarget) return;
    dismissStaleSessionBanner();
    void openTemplate(staleSessionBannerTarget);
  };

  return (
    <>
      {showBanner && staleSessionBannerTarget && (
        <StaleSessionBanner
          templateName={staleSessionBannerTarget}
          onReopen={handleReopen}
          onDismiss={dismissStaleSessionBanner}
        />
      )}
      <WorkingCopySection />
      <ToneSection />
    </>
  );
}

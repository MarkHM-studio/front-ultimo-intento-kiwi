import { useAccessibilityStore } from '@/stores/accessibilityStore';

export function AccessibilityAnnouncer() {
  const liveMessage = useAccessibilityStore((state) => state.liveMessage);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {liveMessage}
    </div>
  );
}
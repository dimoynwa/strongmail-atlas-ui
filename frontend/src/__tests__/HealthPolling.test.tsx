import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from '../shell/AppShell';
import { useAppStore } from '../store/appStore';

describe('Health polling', () => {
  afterEach(() => {
    useAppStore.getState().stopPolling();
    vi.useRealTimers();
  });

  it('cleans up the polling interval on unmount', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    const { unmount } = render(<AppShell />);

    expect(useAppStore.getState().healthPollIntervalId).not.toBeNull();

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(useAppStore.getState().healthPollIntervalId).toBeNull();
  });
});

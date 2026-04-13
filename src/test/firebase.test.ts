import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initFirebase, trackEvent, trackScreenView, firebaseConfig } from '@/lib/firebase';

describe('Firebase Module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports firebaseConfig with required fields', () => {
    expect(firebaseConfig).toBeDefined();
    expect(firebaseConfig.projectId).toBe('prompt-wars-493103');
    expect(firebaseConfig.authDomain).toContain('firebaseapp.com');
    expect(firebaseConfig.measurementId).toBeDefined();
  });

  it('initFirebase does not throw', async () => {
    await expect(initFirebase()).resolves.not.toThrow();
  });

  it('trackEvent does not throw when analytics is not available', () => {
    expect(() => trackEvent('test_event', { key: 'value' })).not.toThrow();
  });

  it('trackScreenView does not throw', () => {
    expect(() => trackScreenView('home')).not.toThrow();
  });

  it('trackEvent logs to console in dev mode', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    trackEvent('test_event', { key: 'value' });
    // In dev mode (vitest), should log to console
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

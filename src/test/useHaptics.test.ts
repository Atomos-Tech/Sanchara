import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHaptics } from '@/hooks/useHaptics';

describe('useHaptics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Replace navigator.vibrate with a spy for assertion tracking
    const vibrateSpy = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateSpy,
      writable: true,
      configurable: true,
    });
  });

  it('returns playChime and vibrate functions', () => {
    const { result } = renderHook(() => useHaptics());
    expect(typeof result.current.playChime).toBe('function');
    expect(typeof result.current.vibrate).toBe('function');
  });

  it('vibrate calls navigator.vibrate with single value', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.vibrate(50);
    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it('vibrate calls navigator.vibrate with pattern array', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.vibrate([30, 50, 30]);
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30]);
  });

  it('playChime success type does not throw', () => {
    const { result } = renderHook(() => useHaptics());
    expect(() => result.current.playChime('success')).not.toThrow();
  });

  it('playChime tap type does not throw', () => {
    const { result } = renderHook(() => useHaptics());
    expect(() => result.current.playChime('tap')).not.toThrow();
  });

  it('playChime alert type does not throw', () => {
    const { result } = renderHook(() => useHaptics());
    expect(() => result.current.playChime('alert')).not.toThrow();
  });

  it('playChime success triggers vibration pattern', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.playChime('success');
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30]);
  });
});

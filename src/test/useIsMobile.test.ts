import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.innerWidth = originalInnerWidth;
  });

  it('should return true for mobile viewport (< 768px)', () => {
    window.innerWidth = 500;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport (>= 768px)', () => {
    window.innerWidth = 1024;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});


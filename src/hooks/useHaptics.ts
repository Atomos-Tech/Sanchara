import { useCallback } from 'react';

/**
 * Singleton AudioContext to prevent multiple browser audio instances.
 * Lazily initialized on first use.
 */
let audioCtx: AudioContext | null = null;

/** Get or create the shared AudioContext instance */
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
};

/**
 * Hook providing haptic feedback (vibration) and audio chime capabilities.
 *
 * Uses the Web Vibration API and Web Audio API to create tactile/audio feedback
 * for user interactions. Gracefully degrades on unsupported devices.
 *
 * @returns Object with `playChime` and `vibrate` functions
 *
 * @example
 * ```tsx
 * const { playChime, vibrate } = useHaptics();
 * playChime('success'); // Plays ascending tone + vibration
 * vibrate(50);          // Quick vibration pulse
 * ```
 */
export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch(e) {}
    }
  }, []);

  const playChime = useCallback((types: 'success' | 'tap' | 'alert') => {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (types === 'success') {
      // Pleasant dual tone ascending
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.5);
      vibrate([30, 50, 30]);
    } 
    else if (types === 'tap') {
      // Subtle click
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.06);
      vibrate(10);
    }
    else if (types === 'alert') {
      // Attention chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(739.99, now + 0.1); // F#5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.6);
      vibrate([50, 50, 50]);
    }
  }, [vibrate]);

  return { playChime, vibrate };
}

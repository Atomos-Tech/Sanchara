import "@testing-library/jest-dom";

// Mock window.matchMedia for responsive hook tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock navigator.vibrate for haptics tests (configurable for per-test spying)
Object.defineProperty(navigator, "vibrate", {
  writable: true,
  configurable: true,
  value: () => true,
});

// Mock AudioContext for haptics tests
class MockAudioContext {
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
    };
  }
  get destination() { return {}; }
  get currentTime() { return 0; }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

// Mock navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: (success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    },
    watchPosition: () => 0,
    clearWatch: () => {},
  },
});

// Mock localStorage
const store: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  },
});

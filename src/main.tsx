import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebase } from "./lib/firebase";

// Initialize Firebase services (Analytics, etc.) — free Spark plan
try {
  initFirebase();
} catch (e) {
  console.error('[Firebase] Init failed', e);
}

// Global storage safety check — clears obsolete/corrupted persisted state if it blocks the app
try {
  const version = localStorage.getItem('sanchara_data_version');
  if (version !== '2.1') {
    // We don't wipe everything to preserve UX, but we can clear specific risk keys here if needed
    localStorage.setItem('sanchara_data_version', '2.1');
  }
} catch (e) {
  console.error('[Storage] Safety check failed', e);
}

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}

import { useArenaStore } from '@/stores/arenaStore';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy, useEffect, useState, useMemo } from 'react';
import { DashboardSkeleton, ExploreSkeleton, OrderSkeleton, GenericSkeleton } from '@/components/PageSkeleton';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import OfflineNotice from '@/components/OfflineNotice';
import { trackScreenView } from '@/lib/firebase';

// Code splitting — each page is lazy loaded for optimal bundle size
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const HeatmapPage = lazy(() => import('@/pages/HeatmapPage'));
const OrderPage = lazy(() => import('@/pages/OrderPage'));
const WalletPage = lazy(() => import('@/pages/WalletPage'));
const AlertsPage = lazy(() => import('@/pages/AlertsPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

const pages: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: DashboardPage,
  explore: ExplorePage,
  map: HeatmapPage,
  order: OrderPage,
  wallet: WalletPage,
  alerts: AlertsPage,
  profile: ProfilePage,
};

const skeletons: Record<string, React.ComponentType> = {
  home: DashboardSkeleton,
  explore: ExploreSkeleton,
  order: OrderSkeleton,
};

/** Check if user prefers reduced motion */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}

export default function Index() {
  const { activeTab } = useArenaStore();
  useSimulationEngine();
  const Page = pages[activeTab] || DashboardPage;
  const LoadingSkeleton = skeletons[activeTab] || GenericSkeleton;
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Track screen views in Firebase Analytics (free tier)
  useEffect(() => {
    trackScreenView(activeTab);
  }, [activeTab]);

  // Simulate initial data loading for production feel
  useEffect(() => {
    // Primary timer for the "smooth" experience
    const timer = setTimeout(() => setIsLoading(false), 800);
    
    // Safety guard: even if rehydration or other effects take time, force render
    const safetyTimer = setTimeout(() => {
      setIsLoading(prev => {
        if (prev) console.warn('[Index] Loading exceeded 2s limit, forcing render.');
        return false;
      });
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const pageTransition = useMemo(() => (
    prefersReducedMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } }
  ), [prefersReducedMotion]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading Sanchara">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4 glow-cyan"
          >
            <span className="text-3xl" role="img" aria-label="Stadium">🏟️</span>
          </motion.div>
          <h1 className="text-lg font-display font-bold text-foreground">Sanchara</h1>
          <p className="text-xs text-muted-foreground mt-1">Loading your experience...</p>
          <div className="mt-4 mx-auto w-32 h-1 rounded-full bg-secondary overflow-hidden" aria-hidden="true">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-1/2 h-full bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative" style={{ overflow: 'hidden' }}>
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      {!isOnline && <OfflineNotice />}
      <main
        id="main-content"
        role="main"
        className="max-w-lg mx-auto px-4 pt-6 pb-24 h-[100dvh] overflow-y-auto overflow-x-hidden sanchara-scroll relative"
      >
        <ErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                {...pageTransition}
                role="region"
                aria-label={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page`}
                tabIndex={-1}
              >
                <Page />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}


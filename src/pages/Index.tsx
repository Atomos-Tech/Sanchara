import { useArenaStore } from '@/stores/arenaStore';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import DashboardPage from '@/pages/DashboardPage';
import HeatmapPage from '@/pages/HeatmapPage';
import OrderPage from '@/pages/OrderPage';
import WalletPage from '@/pages/WalletPage';
import AlertsPage from '@/pages/AlertsPage';
import ExplorePage from '@/pages/ExplorePage';
import ProfilePage from '@/pages/ProfilePage';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy, useEffect, useState } from 'react';
import { DashboardSkeleton, ExploreSkeleton, OrderSkeleton, GenericSkeleton } from '@/components/PageSkeleton';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';

const pages: Record<string, React.ComponentType> = {
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

export default function Index() {
  const { activeTab } = useArenaStore();
  useSimulationEngine();
  const Page = pages[activeTab] || DashboardPage;
  const LoadingSkeleton = skeletons[activeTab] || GenericSkeleton;
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading for production feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Reset loading on tab change for a native app feel
  const [tabLoading, setTabLoading] = useState(false);
  useEffect(() => {
    setTabLoading(true);
    const t = setTimeout(() => setTabLoading(false), 150);
    return () => clearTimeout(t);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4 glow-cyan"
          >
            <span className="text-3xl">🏟️</span>
          </motion.div>
          <h1 className="text-lg font-display font-bold text-foreground">Sanchara</h1>
          <p className="text-xs text-muted-foreground mt-1">Loading your experience...</p>
          <div className="mt-4 mx-auto w-32 h-1 rounded-full bg-secondary overflow-hidden">
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
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Page />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  );
}

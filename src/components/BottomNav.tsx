import { motion } from 'framer-motion';
import { Home, Compass, Map, ShoppingBag, Wallet, Bell, User } from 'lucide-react';
import { useArenaStore } from '@/stores/arenaStore';
import { memo } from 'react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'order', label: 'Order', icon: ShoppingBag },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export default memo(function BottomNav() {
  const { activeTab, setActiveTab, alerts, cart } = useArenaStore();
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 backdrop-blur-2xl safe-area-bottom shadow-lg"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2.5 max-w-lg md:max-w-3xl lg:max-w-6xl w-full mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badge = tab.id === 'order' ? cartCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${tab.label}${badge > 0 ? `, ${badge} items in cart` : ''}`}
              title={tab.label}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground scale-100'}`}
                aria-hidden="true"
              />
              <span className={`relative z-10 text-[10px] font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
              {badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 right-2 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[9px] font-black text-accent-foreground border-2 border-background"
                  aria-hidden="true"
                >
                  {badge}
                </motion.span>
              )}
            </button>
          );
        })}

        {/* Alerts button */}
        <button
          onClick={() => setActiveTab('alerts')}
          role="tab"
          aria-selected={activeTab === 'alerts'}
          aria-current={activeTab === 'alerts' ? 'page' : undefined}
          aria-label={`Alerts${unreadAlerts > 0 ? `, ${unreadAlerts} unread alert notifications` : ''}`}
          title="Alerts"
          className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300"
        >
          {activeTab === 'alerts' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20 pointer-events-none"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Bell
            size={22}
            className={`relative z-10 transition-transform duration-300 ${activeTab === 'alerts' ? 'text-primary scale-110' : 'text-muted-foreground scale-100'}`}
            aria-hidden="true"
          />
          <span className={`relative z-10 text-[10px] font-bold tracking-tight transition-colors duration-300 ${activeTab === 'alerts' ? 'text-primary' : 'text-muted-foreground'}`}>
            Alerts
          </span>
          {unreadAlerts > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 right-2 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground border-2 border-background"
              aria-hidden="true"
            >
              {unreadAlerts}
            </motion.span>
          )}
        </button>
      </div>
    </nav>
  );
});


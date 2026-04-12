import { motion } from 'framer-motion';
import { Home, Compass, Map, ShoppingBag, Wallet, Bell, User } from 'lucide-react';
import { useArenaStore } from '@/stores/arenaStore';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'order', label: 'Order', icon: ShoppingBag },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { activeTab, setActiveTab, alerts, cart } = useArenaStore();
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 backdrop-blur-2xl safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badge = tab.id === 'order' ? cartCount : 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                className={`relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span className={`relative z-10 text-[9px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
              {badge > 0 && (
                <span className="absolute -top-0.5 right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Alerts button */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
        >
          {activeTab === 'alerts' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-primary/10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Bell
            size={20}
            className={`relative z-10 transition-colors ${activeTab === 'alerts' ? 'text-primary' : 'text-muted-foreground'}`}
          />
          <span className={`relative z-10 text-[9px] font-medium ${activeTab === 'alerts' ? 'text-primary' : 'text-muted-foreground'}`}>
            Alerts
          </span>
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}

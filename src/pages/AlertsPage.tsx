import { motion } from 'framer-motion';
import { useArenaStore } from '@/stores/arenaStore';
import { Bell, Zap, Users, Tag, Gift, Check, CheckCheck } from 'lucide-react';

const typeConfig = {
  game: { icon: Zap, color: 'text-primary', bg: 'bg-primary/15' },
  crowd: { icon: Users, color: 'text-arena-yellow', bg: 'bg-arena-yellow/15' },
  sale: { icon: Tag, color: 'text-arena-green', bg: 'bg-arena-green/15' },
  reward: { icon: Gift, color: 'text-accent', bg: 'bg-accent/15' },
};

function timeAgo(dateInput: Date | string) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AlertsPage() {
  const { alerts, markAlertRead, markAllAlertsRead } = useArenaStore();
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <Bell size={20} className="text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => markAlertRead(alert.id)}
              className={`glass-card p-4 cursor-pointer transition-all hover:bg-secondary/20 ${
                !alert.read ? 'border-l-2 border-l-primary' : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                    {!alert.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(alert.timestamp)}</p>
                </div>
                {alert.read && <Check size={14} className="text-muted-foreground/40 flex-shrink-0 mt-1" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

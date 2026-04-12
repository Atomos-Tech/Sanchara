import { motion, AnimatePresence } from 'framer-motion';
import { mockTicket } from '@/data/mockData';
import { useArenaStore } from '@/stores/arenaStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useSimulationStore } from '@/hooks/useSimulationEngine';
import { QrCode, Navigation, Clock, Gift, Flame, Trophy, CalendarDays, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, staggerChildren: 0.08 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, claimDailyDrop, setActiveTab } = useArenaStore();
  const { bookedEvents } = useBookingStore();
  const [dailyPoints, setDailyPoints] = useState<number | null>(null);
  const [showDrop, setShowDrop] = useState(false);

  const gates = useSimulationStore((s) => s.gates);
  const bestGate = [...gates].sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

  const handleDailyDrop = () => {
    if (user.dailyDropClaimed) return;
    setShowDrop(true);
    setTimeout(() => {
      const pts = claimDailyDrop();
      setDailyPoints(pts);
    }, 800);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-4 pb-4">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Hey, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Let's make tonight legendary</p>
        </div>
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full hover:bg-secondary/30 transition-colors touch-feedback"
        >
          <Trophy size={14} className="text-accent" />
          <span className="text-sm font-semibold text-accent">{user.arenaPoints.toLocaleString()}</span>
        </button>
      </motion.div>

      {/* Digital Ticket */}
      <motion.div variants={itemVariants} className="glass-card-elevated p-4 glow-cyan relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Ticket</p>
              <h2 className="text-lg font-display font-bold text-foreground">{mockTicket.eventName}</h2>
              <p className="text-sm text-muted-foreground">{mockTicket.venue}</p>
            </div>
            <button className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors touch-feedback">
              <QrCode size={28} className="text-primary" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Date', value: 'Apr 7' },
              { label: 'Time', value: mockTicket.time },
              { label: 'Section', value: mockTicket.section },
              { label: 'Seat', value: `${mockTicket.row}${mockTicket.seat}` },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-lg py-2 px-1">
                <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
        {[
          { icon: '🍔', label: 'Order', tab: 'order' },
          { icon: '🗺️', label: 'Map', tab: 'map' },
          { icon: '🎟️', label: 'Events', tab: 'explore' },
          { icon: '🎁', label: 'Rewards', tab: 'wallet' },
        ].map((action) => (
          <button
            key={action.tab}
            onClick={() => setActiveTab(action.tab)}
            className="glass-card p-3 text-center hover:bg-secondary/30 transition-colors touch-feedback"
          >
            <span className="text-xl block mb-1">{action.icon}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{action.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Suggested Gate */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setActiveTab('map')}
          className="w-full glass-card p-4 text-left hover:bg-secondary/20 transition-colors touch-feedback"
        >
          <div className="flex items-center gap-2 mb-3">
            <Navigation size={16} className="text-primary" />
            <h3 className="text-sm font-display font-semibold text-foreground">Suggested Gate</h3>
            <ChevronRight size={14} className="ml-auto text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center glow-cyan">
              <span className="text-xl font-display font-bold text-primary">{bestGate.gate}</span>
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">Gate {bestGate.gate} — Shortest Wait</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={12} /> {bestGate.waitMinutes} min
                </span>
                <span className="text-sm text-muted-foreground">{bestGate.distance}</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-arena-green/15 text-arena-green">
              Clear
            </span>
          </div>

          {/* Mini gate grid */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {gates.map((g) => (
              <div
                key={g.gate}
                className={`rounded-lg p-2 text-center border ${
                  g.gate === bestGate.gate ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-secondary/30'
                }`}
              >
                <p className="text-xs text-muted-foreground">Gate {g.gate}</p>
                <p className={`text-sm font-semibold ${
                  g.crowdLevel === 'low' ? 'status-green' : g.crowdLevel === 'moderate' ? 'status-yellow' : 'status-red'
                }`}>
                  {g.waitMinutes}m
                </p>
              </div>
            ))}
          </div>
        </button>
      </motion.div>

      {/* Daily Drop */}
      <motion.div variants={itemVariants}>
        <button
          onClick={handleDailyDrop}
          disabled={user.dailyDropClaimed}
          className={`w-full glass-card p-4 text-left transition-all ${
            user.dailyDropClaimed ? 'opacity-60' : 'glow-amber hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
              <Gift size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-display font-semibold text-foreground">
                {user.dailyDropClaimed ? 'Daily Drop Claimed ✓' : 'Daily Mystery Drop'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {user.dailyDropClaimed && dailyPoints
                  ? `You earned ${dailyPoints} Arena Points!`
                  : `🔥 ${user.streak}-day streak — Tap to claim!`}
              </p>
            </div>
            {!user.dailyDropClaimed && (
              <AnimatePresence>
                {showDrop ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.div>
                ) : (
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-2xl">
                    🎁
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </button>
      </motion.div>

      {/* Booked Events */}
      {bookedEvents.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-primary" />
              <h2 className="text-sm font-display font-semibold text-foreground">Upcoming Bookings</h2>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs text-primary font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {bookedEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="glass-card p-3 flex items-center gap-3">
              <span className="text-2xl">{event.image}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{event.name}</h3>
                <p className="text-xs text-muted-foreground">{event.venue} · {event.time}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <QrCode size={20} className="text-primary" />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Explore CTA for empty state */}
      {bookedEvents.length === 0 && (
        <motion.div variants={itemVariants}>
          <button
            onClick={() => setActiveTab('explore')}
            className="w-full glass-card p-4 text-left hover:bg-secondary/20 transition-colors touch-feedback"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-display font-semibold text-foreground">Discover Events</h3>
                <p className="text-xs text-muted-foreground">Find concerts, games & experiences near you</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: 'Level', value: user.level.toString(), color: 'text-accent' },
          { icon: Flame, label: 'Streak', value: `${user.streak}d`, color: 'text-destructive' },
          { icon: Gift, label: 'Points', value: user.arenaPoints.toLocaleString(), color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <stat.icon size={18} className={`mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

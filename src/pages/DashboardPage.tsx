import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { mockTicket } from '@/data/mockData';
import { useArenaStore } from '@/stores/arenaStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useSimulationStore } from '@/hooks/useSimulationEngine';
import { useHaptics } from '@/hooks/useHaptics';
import { QrCode, Navigation, Clock, Gift, Flame, Trophy, CalendarDays, ChevronRight, Sparkles, ArrowRight, X, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  const [showQR, setShowQR] = useState<any>(null);
  const [geoStatus, setGeoStatus] = useState<'checking' | 'inside' | 'outside' | 'denied' | null>(null);
  const { playChime, vibrate } = useHaptics();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        // Clamp bounds for realistic holographic tilt
        const bx = Math.max(-15, Math.min(15, (e.beta - 45) * 0.5));
        const gy = Math.max(-15, Math.min(15, e.gamma * 0.5));
        rotateX.set(-bx);
        rotateY.set(gy);
      }
    };

    // Need permission on iOS 13+
    const requestAccess = () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission().then((p: string) => {
          if (p === 'granted') window.addEventListener('deviceorientation', handleOrientation);
        }).catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };
    requestAccess();

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [rotateX, rotateY]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      setGeoStatus('checking');
      navigator.geolocation.getCurrentPosition(
        () => {
          // Authentic mock: Assuming if they grant permission, we welcome them.
          setGeoStatus('inside');
          toast('📍 Welcome to the Arena!', { description: 'Venue location verified. Interactive features unlocked.' });
        },
        () => setGeoStatus('denied')
      );
    }
  }, []);

  const gates = useSimulationStore((s) => s.gates);
  const bestGate = [...gates].sort((a, b) => a.waitMinutes - b.waitMinutes)[0];

  const handleDailyDrop = () => {
    if (user.dailyDropClaimed) return;
    setShowDrop(true);
    playChime('success');
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
      <motion.div variants={itemVariants} className="perspective-[1000px]">
        <motion.div 
          className="glass-card-elevated p-4 glow-cyan relative overflow-hidden will-change-transform"
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        >
          {/* Shimmer overlay layer moving opposite to device tilt */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 mix-blend-overlay pointer-events-none"
            style={{ 
              x: useTransform(rotateY, [-15, 15], [100, -100]), 
              y: useTransform(rotateX, [-15, 15], [50, -50]) 
            }}
          />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12" style={{ transform: 'translateZ(10px)' }} />
          <div className="relative" style={{ transform: 'translateZ(20px)' }}>
            <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Ticket</p>
              <h2 className="text-lg font-display font-bold text-foreground">{mockTicket.eventName}</h2>
              <p className="text-sm text-muted-foreground">{mockTicket.venue}</p>
            </div>
            <button
              onClick={() => setShowQR(mockTicket)}
              className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors touch-feedback"
            >
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
      </motion.div>

      {/* Geofence Status */}
      <AnimatePresence>
        {geoStatus === 'inside' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-3 flex items-center justify-between glow-cyan border-primary/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <MapPin size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Verified In-Venue</p>
                <p className="text-[10px] text-muted-foreground">Location Services Active</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <button
                onClick={() => setShowQR(event)}
                className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <QrCode size={20} className="text-primary" />
              </button>
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

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-card-elevated p-6 relative"
            >
              <button
                onClick={() => setShowQR(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="text-center mt-2">
                <h2 className="text-lg font-display font-bold text-foreground">{showQR.eventName || showQR.name}</h2>
                <p className="text-sm text-muted-foreground">{showQR.venue}</p>
              </div>

              <div className="my-8 aspect-square rounded-2xl bg-white p-4 flex items-center justify-center mx-auto w-[240px]">
                {/* Fallback QR representation since we don't have a real QR library in free tier */}
                <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center bg-gray-100/50">
                  <QrCode size={100} className="text-black/80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center border-t border-border/50 pt-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Section</p>
                  <p className="text-base font-bold text-foreground">{showQR.section || '108'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Seat</p>
                  <p className="text-base font-bold text-foreground">{showQR.seat ? `${showQR.row || ''}${showQR.seat}` : 'General'}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden relative">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 w-1/2 bg-primary/50"
                  />
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-2 uppercase tracking-wide">Ready for Scanner</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

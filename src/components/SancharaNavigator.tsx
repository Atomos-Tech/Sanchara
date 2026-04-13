import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Navigation2, ChevronDown, Camera } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

// Stadium POI coordinates on SVG viewBox (0-400 x 0-300)
const POIs: Record<string, { x: number; y: number; label: string }> = {
  'gate-a': { x: 200, y: 15, label: 'Gate A' },
  'gate-b': { x: 385, y: 150, label: 'Gate B' },
  'gate-c': { x: 200, y: 285, label: 'Gate C' },
  'gate-d': { x: 15, y: 150, label: 'Gate D' },
  'seat-108': { x: 260, y: 100, label: 'Seat Block 108' },
  'seat-205': { x: 310, y: 170, label: 'Seat Block 205' },
  'seat-310': { x: 200, y: 230, label: 'Seat Block 310' },
  'restroom-1a': { x: 140, y: 60, label: 'Restroom 1A' },
  'concession-1': { x: 280, y: 60, label: 'Hot Dogs & More' },
  'concession-2': { x: 340, y: 200, label: 'Burgers & Brews' },
  'team-store': { x: 80, y: 200, label: 'Team Store' },
  'vip-lounge': { x: 200, y: 80, label: 'VIP Lounge' },
};

const locations = Object.entries(POIs).map(([id, poi]) => ({ id, ...poi }));

function buildPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  // Route through the concourse (outer ring) then cut inward
  const cx = 200, cy = 150;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Push midpoint outward from center for realistic concourse routing
  const dx = midX - cx, dy = midY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const pushFactor = 40;
  const ctrlX = midX + (dx / dist) * pushFactor;
  const ctrlY = midY + (dy / dist) * pushFactor;
  return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SancharaNavigator({ open, onClose }: Props) {
  const [fromId, setFromId] = useState('gate-a');
  const [toId, setToId] = useState('seat-108');
  const [routing, setRouting] = useState(false);
  const [eta, setEta] = useState(0);
  const progress = useMotionValue(0);
  const pathRef = useRef<SVGPathElement>(null);
  const animRef = useRef<ReturnType<typeof animate>>();
  const { playChime, vibrate } = useHaptics();

  // AR State
  const [arMode, setArMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleAR = async () => {
    if (arMode) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      setArMode(false);
      vibrate(10);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        setArMode(true);
        vibrate([20, 30, 20]);
        // The ref attachment happens after state update via a small timeout to let react mount it
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        }, 50);
      } catch (e) {
        console.error('AR Access Denied or Unavailable');
      }
    }
  };

  useEffect(() => {
    // Cleanup video stream on dismount
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const from = POIs[fromId];
  const to = POIs[toId];
  const pathD = buildPath(from, to);

  // Dot position along path
  const [dotPos, setDotPos] = useState({ x: from.x, y: from.y });

  const updateDot = useCallback(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(progress.get() * len);
    setDotPos({ x: pt.x, y: pt.y });
  }, [progress]);

  const startRouting = () => {
    if (fromId === toId) return;
    setRouting(true);
    playChime('success');
    const totalSec = Math.floor(Math.random() * 120) + 60; // 1-3 min mock
    setEta(totalSec);

    // Animate progress 0→1 over totalSec (capped at 15s for demo)
    const demoDuration = Math.min(totalSec, 15);
    animRef.current?.stop();
    progress.set(0);
    animRef.current = animate(progress, 1, {
      duration: demoDuration,
      ease: 'linear',
      onUpdate: () => updateDot(),
      onComplete: () => {
        setRouting(false);
        setEta(0);
      },
    });

    // ETA countdown
    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000 * (totalSec / demoDuration));

    return () => clearInterval(interval);
  };

  const stopRouting = () => {
    animRef.current?.stop();
    setRouting(false);
    setEta(0);
    progress.set(0);
    setDotPos({ x: from.x, y: from.y });
  };

  useEffect(() => {
    if (!routing) setDotPos({ x: from.x, y: from.y });
  }, [fromId, from.x, from.y, routing]);

  useEffect(() => () => animRef.current?.stop(), []);

  const formatEta = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m} min ${sec}s` : `${sec}s`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <Navigation2 size={18} className="text-primary" />
                Sanchara Navigator
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={toggleAR} className={`p-2 rounded-lg transition-colors ${arMode ? 'bg-primary text-primary-foreground glow-cyan' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'}`}>
                  <Camera size={18} />
                </button>
                <button onClick={() => { stopRouting(); onClose(); }} className="p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* From / To selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">From</label>
                <div className="relative">
                  <select
                    value={fromId}
                    onChange={(e) => { stopRouting(); setFromId(e.target.value); }}
                    className="w-full glass-card px-3 py-2 pr-8 text-sm text-foreground rounded-lg appearance-none bg-secondary/30 border border-border/30 focus:outline-none focus:border-primary/50"
                  >
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">To</label>
                <div className="relative">
                  <select
                    value={toId}
                    onChange={(e) => { stopRouting(); setToId(e.target.value); }}
                    className="w-full glass-card px-3 py-2 pr-8 text-sm text-foreground rounded-lg appearance-none bg-secondary/30 border border-border/30 focus:outline-none focus:border-primary/50"
                  >
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SVG Stadium Map */}
          <div className="flex-1 overflow-hidden p-4 relative">
            {arMode && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
              />
            )}
            <svg viewBox="0 0 400 300" className="w-full h-full relative z-10" style={{ maxHeight: '55vh' }}>
              {/* Stadium outer wall */}
              {!arMode && <ellipse cx="200" cy="150" rx="190" ry="140" fill="none" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.4" />}
              {/* Inner concourse */}
              {!arMode && <ellipse cx="200" cy="150" rx="150" ry="110" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.2" />}
              {/* Court/Field */}
              {!arMode && <rect x="140" y="100" width="120" height="100" rx="8" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" opacity="0.3" />}
              {!arMode && <text x="200" y="155" textAnchor="middle" fill="hsl(var(--muted-foreground))" opacity="0.3" fontSize="12" fontWeight="bold">COURT</text>}

              {/* Section labels */}
              {[
                { x: 200, y: 30, label: 'North Stand' },
                { x: 200, y: 275, label: 'South Stand' },
                { x: 50, y: 150, label: 'West' },
                { x: 350, y: 150, label: 'East' },
              ].map((s) => (
                <text key={s.label} x={s.x} y={s.y} textAnchor="middle" fill="hsl(var(--muted-foreground))" opacity="0.25" fontSize="9">{s.label}</text>
              ))}

              {/* Route path */}
              {fromId !== toId && (
                <path
                  ref={pathRef}
                  d={pathD}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={routing ? 'none' : '8 4'}
                  opacity={routing ? 1 : 0.5}
                />
              )}

              {/* POI markers */}
              {locations.map((poi) => {
                const isFrom = poi.id === fromId;
                const isTo = poi.id === toId;
                const isHighlighted = isFrom || isTo;
                return (
                  <g key={poi.id}>
                    <circle
                      cx={poi.x}
                      cy={poi.y}
                      r={isHighlighted ? 8 : 5}
                      fill={isFrom ? 'hsl(var(--primary))' : isTo ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))'}
                      opacity={isHighlighted ? 1 : 0.4}
                    />
                    {isHighlighted && (
                      <text
                        x={poi.x}
                        y={poi.y - 14}
                        textAnchor="middle"
                        fill={isFrom ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                        fontSize="9"
                        fontWeight="600"
                      >
                        {poi.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Pulsing blue dot (user position) */}
              {routing && (
                <g>
                  <circle cx={dotPos.x} cy={dotPos.y} r="12" fill="hsl(var(--primary))" opacity="0.15">
                    <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={dotPos.x} cy={dotPos.y} r="6" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          {/* Bottom action */}
          <div className="shrink-0 px-4 pb-6 pt-2 border-t border-border/30 safe-area-bottom">
            {routing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated arrival</p>
                    <p className="text-lg font-display font-bold text-primary">{formatEta(eta)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                    </span>
                    <span className="text-xs text-muted-foreground">Navigating</span>
                  </div>
                </div>
                <button
                  onClick={stopRouting}
                  className="w-full py-3 rounded-xl bg-destructive/15 text-destructive font-semibold text-sm transition-colors hover:bg-destructive/25"
                >
                  Stop Navigation
                </button>
              </div>
            ) : (
              <button
                onClick={startRouting}
                disabled={fromId === toId}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                <Navigation2 size={16} className="inline mr-2 -mt-0.5" />
                Start Routing
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

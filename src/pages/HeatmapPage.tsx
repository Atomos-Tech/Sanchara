import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navigation2 } from 'lucide-react';
import { useSimulationStore } from '@/hooks/useSimulationEngine';
import SancharaNavigator from '@/components/SancharaNavigator';
import type { Facility } from '@/types/arena';

const filterOptions = ['all', 'restroom', 'concession', 'merch'] as const;
const filterLabels = { all: 'All', restroom: '🚻 Restrooms', concession: '🍔 Food', merch: '👕 Merch' };

const statusColors = {
  clear: { bg: 'bg-arena-green', ring: 'ring-arena-green/30', text: 'status-green', label: 'Clear' },
  moderate: { bg: 'bg-arena-yellow', ring: 'ring-arena-yellow/30', text: 'status-yellow', label: 'Moderate' },
  busy: { bg: 'bg-arena-red', ring: 'ring-arena-red/30', text: 'status-red', label: 'Avoid' },
};

export default function HeatmapPage() {
  const [filter, setFilter] = useState<typeof filterOptions[number]>('all');
  const [selected, setSelected] = useState<Facility | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const facilities = useSimulationStore((s) => s.facilities);

  const filtered = filter === 'all' ? facilities : facilities.filter((f) => f.type === filter);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Live Heatmap</h1>
          <p className="text-sm text-muted-foreground">Real-time facility wait times</p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {filterLabels[opt]}
            </button>
          ))}
        </div>

        {/* Stadium Map */}
        <div className="glass-card-elevated p-4 relative">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-secondary/30">
            {/* Stadium outline */}
            <div className="absolute inset-4 border-2 border-border/40 rounded-[40%] flex items-center justify-center">
              <div className="absolute inset-6 border border-border/20 rounded-[40%]" />
              <span className="text-xs text-muted-foreground/40 font-display">COURT</span>
            </div>

            {/* Facility markers */}
            {filtered.map((facility) => {
              const sc = statusColors[facility.status];
              return (
                <motion.button
                  key={facility.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 1.3 }}
                  onClick={() => setSelected(facility)}
                  className={`absolute w-6 h-6 rounded-full ${sc.bg} ring-4 ${sc.ring} flex items-center justify-center`}
                  style={{ left: `${facility.x}%`, top: `${facility.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <span className="text-[8px] font-bold text-background">
                    {facility.waitMinutes}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3">
            {Object.entries(statusColors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${val.bg}`} />
                <span className="text-[10px] text-muted-foreground">{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected facility detail */}
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-foreground">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">Section {selected.section}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                selected.status === 'clear' ? 'bg-arena-green/15 text-arena-green' :
                selected.status === 'moderate' ? 'bg-arena-yellow/15 text-arena-yellow' :
                'bg-arena-red/15 text-arena-red'
              }`}>
                {selected.waitMinutes} min wait
              </div>
            </div>
          </motion.div>
        )}

        {/* Facility list */}
        <div className="space-y-2">
          {filtered.map((facility, i) => {
            const sc = statusColors[facility.status];
            return (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(facility)}
                className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:bg-secondary/30 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${sc.bg}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{facility.name}</p>
                  <p className="text-xs text-muted-foreground">Section {facility.section}</p>
                </div>
                <span className={`text-sm font-semibold ${sc.text}`}>{facility.waitMinutes}m</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Navigate FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setNavOpen(true)}
        className="fixed bottom-24 right-4 z-[55] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center glow-cyan"
      >
        <Navigation2 size={22} />
      </motion.button>

      <SancharaNavigator open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}

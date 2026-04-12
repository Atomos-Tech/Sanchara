import { motion } from 'framer-motion';
import { useArenaStore } from '@/stores/arenaStore';
import { mockRewards } from '@/data/mockData';
import { Trophy, Star, TrendingUp, Gift, Lock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const catFilters = ['all', 'food', 'upgrade', 'merch', 'experience'] as const;

export default function WalletPage() {
  const { user, spendPoints } = useArenaStore();
  const [activeFilter, setActiveFilter] = useState<typeof catFilters[number]>('all');
  const { toast } = useToast();

  const rewards = activeFilter === 'all' ? mockRewards : mockRewards.filter((r) => r.category === activeFilter);
  const levelProgress = (user.arenaPoints % 1000) / 10;

  const handleRedeem = (reward: typeof mockRewards[0]) => {
    if (spendPoints(reward.pointsCost)) {
      toast({
        title: '🎉 Reward Redeemed!',
        description: `${reward.name} has been added to your wallet.`,
      });
    } else {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.pointsCost - user.arenaPoints} more points.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      {/* Points card */}
      <div className="glass-card-elevated p-5 glow-amber">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Arena Points</p>
            <h1 className="text-3xl font-display font-bold text-gradient-amber">{user.arenaPoints.toLocaleString()}</h1>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center">
            <Trophy size={28} className="text-accent" />
          </div>
        </div>

        {/* Level progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Level {user.level}</span>
            <span className="text-muted-foreground">Level {user.level + 1}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {1000 - (user.arenaPoints % 1000)} pts to next level
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Star, label: 'Level', value: user.level, color: 'text-accent' },
          { icon: TrendingUp, label: 'Streak', value: `${user.streak}d`, color: 'text-primary' },
          { icon: Gift, label: 'Redeemed', value: '3', color: 'text-arena-green' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rewards Store */}
      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-3">Rewards Store</h2>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {catFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f ? 'bg-accent text-accent-foreground' : 'glass-card text-muted-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rewards.map((reward, i) => {
          const canAfford = user.arenaPoints >= reward.pointsCost;
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reward.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{reward.name}</h3>
                  <p className="text-xs text-muted-foreground">{reward.description}</p>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    canAfford
                      ? 'bg-accent text-accent-foreground hover:bg-accent/80 active:scale-95'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {!canAfford && <Lock size={10} />}
                  {reward.pointsCost.toLocaleString()} pts
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

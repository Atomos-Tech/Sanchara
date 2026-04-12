import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { mockFacilities, mockGates } from '@/data/mockData';
import type { Facility, GateSuggestion } from '@/types/arena';
import { toast } from 'sonner';
import { useArenaStore } from '@/stores/arenaStore';

interface SimulationState {
  facilities: Facility[];
  gates: GateSuggestion[];
  tick: number;
  updateFacilities: (facilities: Facility[]) => void;
  updateGates: (gates: GateSuggestion[]) => void;
  incrementTick: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  facilities: mockFacilities.map((f) => ({ ...f })),
  gates: mockGates.map((g) => ({ ...g })),
  tick: 0,
  updateFacilities: (facilities) => set({ facilities }),
  updateGates: (gates) => set({ gates }),
  incrementTick: () => set((s) => ({ tick: s.tick + 1 })),
}));

const statusThresholds = (wait: number): Facility['status'] =>
  wait <= 4 ? 'clear' : wait <= 10 ? 'moderate' : 'busy';

const crowdThresholds = (wait: number): GateSuggestion['crowdLevel'] =>
  wait <= 5 ? 'low' : wait <= 10 ? 'moderate' : 'high';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function useSimulationEngine() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const { facilities, gates, incrementTick } = useSimulationStore.getState();

      // Fluctuate facility wait times
      const newFacilities = facilities.map((f) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newWait = clamp(f.waitMinutes + delta, 1, 25);
        return { ...f, waitMinutes: newWait, status: statusThresholds(newWait) };
      });

      // Fluctuate gate wait times
      const newGates = gates.map((g) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newWait = clamp(g.waitMinutes + delta, 1, 20);
        return { ...g, waitMinutes: newWait, crowdLevel: crowdThresholds(newWait) };
      });

      useSimulationStore.setState({ facilities: newFacilities, gates: newGates });
      incrementTick();

      // Occasional toast (roughly every 3rd tick = ~45s)
      if (Math.random() < 0.33) {
        const changed = newGates[Math.floor(Math.random() * newGates.length)];
        const direction = changed.waitMinutes <= 5 ? 'decreased' : 'increased';
        toast(`Live Update: Wait time at Gate ${changed.gate} has ${direction} to ${changed.waitMinutes} min`, {
          duration: 3000,
          icon: '📡',
        });
      }

      // Progress active orders automatically to prevent them from getting stuck!
      const { orders, progressOrderStatus } = useArenaStore.getState();
      const activeOrders = orders.filter(o => o.status !== 'delivered');
      if (activeOrders.length > 0 && Math.random() < 0.6) {
        const orderToProgress = activeOrders[Math.floor(Math.random() * activeOrders.length)];
        progressOrderStatus(orderToProgress.id);
        const states = { preparing: 'Ready', ready: 'On the way', delivering: 'Delivered' };
        // We use the OLD status to look up what it *became*
        toast(`Order #${orderToProgress.id.slice(-6)} update: ${states[orderToProgress.status]}`, {
          duration: 4000,
          icon: '📦',
        });
      }
    }, 15000);

    return () => clearInterval(intervalRef.current);
  }, []);
}

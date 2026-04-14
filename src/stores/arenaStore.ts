import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, Order, ArenaAlert, UserProfile, RewardItem } from '@/types/arena';
import { mockUser, mockOrders, mockAlerts } from '@/data/mockData';
import { trackEvent } from '@/lib/firebase';

/** Represents a saved seat/address configuration */
export interface SavedAddress {
  id: string;
  label: string;
  section: string;
  row: string;
  seat: string;
  venue: string;
  isDefault: boolean;
}

/** Represents a saved payment method */
export interface SavedPayment {
  id: string;
  type: 'visa' | 'mastercard' | 'wallet';
  last4?: string;
  expiry?: string;
  label?: string;
  balance?: number;
  isDefault: boolean;
}

interface ArenaState {
  user: UserProfile;
  cart: CartItem[];
  orders: Order[];
  alerts: ArenaAlert[];
  activeTab: string;
  userRewards: RewardItem[];
  savedAddresses: SavedAddress[];
  savedPayments: SavedPayment[];

  setActiveTab: (tab: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (deliveryType: 'seat' | 'pickup') => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  claimDailyDrop: () => number;
  spendPoints: (amount: number) => boolean;
  claimReward: (reward: RewardItem) => void;
  updateUserName: (name: string) => void;
  progressOrderStatus: (orderId: string) => void;
  updateAddresses: (addressesOrUpdater: SavedAddress[] | ((prev: SavedAddress[]) => SavedAddress[])) => void;
  updatePayments: (paymentsOrUpdater: SavedPayment[] | ((prev: SavedPayment[]) => SavedPayment[])) => void;
}

const statusFlow: Record<string, Order['status'] | null> = {
  preparing: 'ready',
  ready: 'delivering',
  delivering: 'delivered',
  delivered: null,
};

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      cart: [],
      orders: mockOrders,
      alerts: mockAlerts,
      activeTab: 'home',
      userRewards: [],
      savedAddresses: [
        { id: 'a1', label: 'Default Seat', section: '108', row: 'D', seat: '12', venue: 'Crypto.com Arena', isDefault: true },
        { id: 'a2', label: 'VIP Box', section: 'VIP-3', row: 'A', seat: '1-4', venue: 'Crypto.com Arena', isDefault: false },
      ],
      savedPayments: [
        { id: 'p1', type: 'visa', last4: '4242', expiry: '09/28', isDefault: true },
        { id: 'p3', type: 'wallet', label: 'Arena Points Wallet', balance: 0, isDefault: false },
      ],

      setActiveTab: (tab) => set({ activeTab: tab }),

  /** Add a menu item to the cart, incrementing quantity if already present */
  addToCart: (item) => set((state) => {
    trackEvent('add_to_cart', { item_id: item.id, item_name: item.name, price: item.price });
    const existing = state.cart.find((c) => c.id === item.id);
    if (existing) {
      return { cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c) };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter((c) => c.id !== itemId),
  })),

  updateCartQuantity: (itemId, quantity) => set((state) => ({
    cart: quantity <= 0
      ? state.cart.filter((c) => c.id !== itemId)
      : state.cart.map((c) => c.id === itemId ? { ...c, quantity } : c),
  })),

  clearCart: () => set({ cart: [] }),

  /** Place an order from the current cart, awarding Arena Points and starting status progression */
  placeOrder: (deliveryType) => {
    const { cart } = get();
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    trackEvent('place_order', { delivery_type: deliveryType, total, item_count: cart.length });
    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      total,
      status: 'preparing',
      deliveryType,
      estimatedMinutes: deliveryType === 'seat' ? 15 : 8,
      createdAt: Date.now(),
    };
    set((state) => ({
      orders: [newOrder, ...state.orders],
      cart: [],
      user: { ...state.user, arenaPoints: state.user.arenaPoints + Math.floor(total * 2) },
    }));

    // Auto-progress order through statuses
    const progressOrder = (id: string, delay: number) => {
      setTimeout(() => {
        const { orders } = get();
        const order = orders.find((o) => o.id === id);
        if (!order) return;
        const next = statusFlow[order.status];
        if (next) {
          set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, status: next } : o),
          }));
          if (next !== 'delivered') {
            progressOrder(id, delay);
          }
        }
      }, delay);
    };
    progressOrder(orderId, 8000); // every 8 seconds
  },

  markAlertRead: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === alertId ? { ...a, read: true } : a),
  })),

  markAllAlertsRead: () => set((state) => ({
    alerts: state.alerts.map((a) => ({ ...a, read: true })),
  })),

  /** Claim daily login bonus points. Uses date-based deduplication via localStorage. */
  claimDailyDrop: () => {
    const today = new Date().toISOString().split('T')[0];
    const lastClaim = localStorage.getItem('sanchara-daily-drop-date');
    if (lastClaim === today) return 0;
    const points = Math.floor(Math.random() * 150) + 50;
    localStorage.setItem('sanchara-daily-drop-date', today);
    trackEvent('claim_daily_drop', { points });
    set((state) => ({
      user: { ...state.user, arenaPoints: state.user.arenaPoints + points, dailyDropClaimed: true, streak: state.user.streak + 1 },
    }));
    return points;
  },

  spendPoints: (amount) => {
    const { user } = get();
    if (user.arenaPoints < amount) return false;
    set((state) => ({
      user: { ...state.user, arenaPoints: state.user.arenaPoints - amount },
    }));
    return true;
  },

  updateUserName: (name) => set((state) => ({
    user: { ...state.user, name },
  })),

  claimReward: (reward) => set((state) => ({
    userRewards: [reward, ...state.userRewards]
  })),

  progressOrderStatus: (orderId) => set((state) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return state;
    const next = statusFlow[order.status];
    if (!next) return state;
    return { orders: state.orders.map((o) => o.id === orderId ? { ...o, status: next } : o) };
  }),

  updateAddresses: (addressesOrUpdater) => set((state) => ({
    savedAddresses: typeof addressesOrUpdater === 'function'
      ? addressesOrUpdater(state.savedAddresses)
      : addressesOrUpdater,
  })),
  updatePayments: (paymentsOrUpdater) => set((state) => ({
    savedPayments: typeof paymentsOrUpdater === 'function'
      ? paymentsOrUpdater(state.savedPayments)
      : paymentsOrUpdater,
  })),
    }),
    {
      name: 'sanchara-arena-storage', version: 1,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => !['savedPayments'].includes(key))
      ),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const now = Date.now();
          state.orders = state.orders.map(order => {
            if (order.status === 'delivered' || !order.createdAt) return order;
            const elapsedSecs = (now - order.createdAt) / 1000;
            // Catch up order status based on elapsed time while app was closed
            if (elapsedSecs > 45) return { ...order, status: 'delivered' };
            if (elapsedSecs > 30) return { ...order, status: 'delivering' };
            if (elapsedSecs > 15) return { ...order, status: 'ready' };
            return order;
          });
        }
      }
    }
  )
);

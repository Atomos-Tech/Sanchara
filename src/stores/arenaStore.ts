import { create } from 'zustand';
import type { CartItem, MenuItem, Order, ArenaAlert, UserProfile } from '@/types/arena';
import { mockUser, mockOrders, mockAlerts } from '@/data/mockData';

interface ArenaState {
  user: UserProfile;
  cart: CartItem[];
  orders: Order[];
  alerts: ArenaAlert[];
  activeTab: string;

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
  updateUserName: (name: string) => void;
  progressOrderStatus: (orderId: string) => void;
}

const statusFlow: Record<string, Order['status'] | null> = {
  preparing: 'ready',
  ready: 'delivering',
  delivering: 'delivered',
  delivered: null,
};

export const useArenaStore = create<ArenaState>((set, get) => ({
  user: mockUser,
  cart: [],
  orders: mockOrders,
  alerts: mockAlerts,
  activeTab: 'home',

  setActiveTab: (tab) => set({ activeTab: tab }),

  addToCart: (item) => set((state) => {
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

  placeOrder: (deliveryType) => {
    const { cart, progressOrderStatus } = get();
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      total,
      status: 'preparing',
      deliveryType,
      estimatedMinutes: deliveryType === 'seat' ? 15 : 8,
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

  claimDailyDrop: () => {
    const points = Math.floor(Math.random() * 150) + 50;
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

  progressOrderStatus: (orderId) => set((state) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return state;
    const next = statusFlow[order.status];
    if (!next) return state;
    return { orders: state.orders.map((o) => o.id === orderId ? { ...o, status: next } : o) };
  }),
}));

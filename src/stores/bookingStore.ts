import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent, SeatingTier, PreOrderItem } from '@/types/booking';
import type { MenuItem } from '@/types/arena';
import { promoCodes } from '@/data/bookingData';

interface BookingStore {
  // Booking flow
  selectedEvent: CalendarEvent | null;
  selectedTier: SeatingTier | null;
  ticketQuantity: number;
  preOrderItems: PreOrderItem[];
  bookingStep: number; // 0=none, 1=ticketing, 2=upsell, 3=checkout
  
  // Promo
  promoCode: string;
  promoDiscount: number;
  promoLabel: string;
  
  // Booked events (post-checkout)
  bookedEvents: CalendarEvent[];

  // Actions
  selectEvent: (event: CalendarEvent) => void;
  selectTier: (tier: SeatingTier) => void;
  setTicketQuantity: (qty: number) => void;
  setBookingStep: (step: number) => void;
  addPreOrderItem: (item: MenuItem) => void;
  removePreOrderItem: (itemId: string) => void;
  updatePreOrderQuantity: (itemId: string, qty: number) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  getTicketTotal: () => number;
  getPreOrderTotal: () => number;
  getDiscountAmount: () => number;
  getGrandTotal: () => number;
  confirmBooking: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      selectedEvent: null,
      selectedTier: null,
      ticketQuantity: 1,
      preOrderItems: [],
      bookingStep: 0,
      promoCode: '',
      promoDiscount: 0,
      promoLabel: '',
      bookedEvents: [],

  selectEvent: (event) => set({ selectedEvent: event, bookingStep: 1 }),
  selectTier: (tier) => set({ selectedTier: tier }),
  setTicketQuantity: (qty) => set({ ticketQuantity: Math.max(1, Math.min(qty, 10)) }),
  setBookingStep: (step) => set({ bookingStep: step }),

  addPreOrderItem: (item) => set((state) => {
    const existing = state.preOrderItems.find((p) => p.id === item.id);
    if (existing) {
      return { preOrderItems: state.preOrderItems.map((p) => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p) };
    }
    return { preOrderItems: [...state.preOrderItems, { ...item, quantity: 1, eventTied: true }] };
  }),

  removePreOrderItem: (itemId) => set((state) => ({
    preOrderItems: state.preOrderItems.filter((p) => p.id !== itemId),
  })),

  updatePreOrderQuantity: (itemId, qty) => set((state) => ({
    preOrderItems: qty <= 0
      ? state.preOrderItems.filter((p) => p.id !== itemId)
      : state.preOrderItems.map((p) => p.id === itemId ? { ...p, quantity: qty } : p),
  })),

  applyPromo: (code) => {
    const promo = promoCodes.find((p) => p.code === code.toUpperCase().trim());
    if (!promo) return false;
    set({ promoCode: promo.code, promoDiscount: promo.value, promoLabel: promo.label });
    return true;
  },

  clearPromo: () => set({ promoCode: '', promoDiscount: 0, promoLabel: '' }),

  getTicketTotal: () => {
    const { selectedTier, ticketQuantity } = get();
    return selectedTier ? selectedTier.price * ticketQuantity : 0;
  },

  getPreOrderTotal: () => {
    const { preOrderItems } = get();
    return preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const state = get();
    const subtotal = state.getTicketTotal() + state.getPreOrderTotal();
    const promo = promoCodes.find((p) => p.code === state.promoCode);
    if (!promo) return 0;
    if (promo.type === 'percentage') return subtotal * (promo.value / 100);
    return Math.min(promo.value, subtotal);
  },

  getGrandTotal: () => {
    const state = get();
    return Math.max(0, state.getTicketTotal() + state.getPreOrderTotal() - state.getDiscountAmount());
  },

  confirmBooking: () => {
    const { selectedEvent } = get();
    if (selectedEvent) {
      set((state) => ({
        bookedEvents: [...state.bookedEvents, selectedEvent],
        selectedEvent: null,
        selectedTier: null,
        ticketQuantity: 1,
        preOrderItems: [],
        bookingStep: 0,
        promoCode: '',
        promoDiscount: 0,
        promoLabel: '',
      }));
    }
  },

  resetBooking: () => set({
    selectedEvent: null,
    selectedTier: null,
    ticketQuantity: 1,
    preOrderItems: [],
    bookingStep: 0,
    promoCode: '',
    promoDiscount: 0,
    promoLabel: '',
  }),
    }),
    {
      name: 'sanchara-booking-storage',
    }
  )
);

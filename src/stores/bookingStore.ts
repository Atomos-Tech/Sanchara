import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent, SeatingTier, PreOrderItem } from '@/types/booking';
import type { MenuItem } from '@/types/arena';
import { promoCodes } from '@/data/bookingData';
import { trackEvent } from '@/lib/firebase';

/**
 * Booking store interface defining state and actions for the event booking flow.
 *
 * The booking flow is a multi-step process:
 * 1. Select event → 2. Choose seating tier → 3. Add pre-orders → 4. Checkout
 *
 * Promo codes provide percentage or fixed discounts.
 * Booked events are persisted to localStorage.
 */
interface BookingStore {
  /** Currently selected event for booking, null if none */
  selectedEvent: CalendarEvent | null;
  /** Selected seating tier within the event */
  selectedTier: SeatingTier | null;
  /** Number of tickets (clamped 1-10) */
  ticketQuantity: number;
  /** Pre-order food/merch items tied to this booking */
  preOrderItems: PreOrderItem[];
  /** Current booking step: 0=none, 1=ticketing, 2=upsell, 3=checkout */
  bookingStep: number;
  /** Applied promo code string */
  promoCode: string;
  /** Promo discount value (percentage or fixed amount) */
  promoDiscount: number;
  /** Human-readable promo label (e.g., '10% Off') */
  promoLabel: string;
  /** Events that have been booked/confirmed */
  bookedEvents: CalendarEvent[];

  selectEvent: (event: CalendarEvent) => void;
  selectTier: (tier: SeatingTier) => void;
  setTicketQuantity: (qty: number) => void;
  setBookingStep: (step: number) => void;
  addPreOrderItem: (item: MenuItem) => void;
  removePreOrderItem: (itemId: string) => void;
  updatePreOrderQuantity: (itemId: string, qty: number) => void;
  /** Apply a promo code. Returns true if valid, false if not found. */
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  /** Calculate ticket subtotal (tier price × quantity) */
  getTicketTotal: () => number;
  /** Calculate pre-order subtotal */
  getPreOrderTotal: () => number;
  /** Calculate discount amount based on applied promo */
  getDiscountAmount: () => number;
  /** Calculate final total after discount */
  getGrandTotal: () => number;
  /** Confirm booking and move event to bookedEvents list */
  confirmBooking: () => void;
  /** Reset all booking state to initial values */
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

  /** Confirm the current booking, persist the event, and reset flow state */
  confirmBooking: () => {
    const { selectedEvent } = get();
    if (selectedEvent) {
      trackEvent('confirm_booking', { event_name: selectedEvent.name, event_id: selectedEvent.id });
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

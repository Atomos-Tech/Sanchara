import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '@/stores/bookingStore';

// Reset store state before each test
beforeEach(() => {
  useBookingStore.getState().resetBooking();
});

describe('bookingStore', () => {
  const testEvent = {
    id: 'evt-test',
    name: 'Championship Final',
    date: '2024-12-15',
    time: '7:30 PM',
    venue: 'Grand Arena',
    image: '⚽',
    category: 'sports' as const,
    featured: true,
    price: 500,
    basePrice: 500,
    description: 'The ultimate championship final',
  };

  const testTier = {
    id: 'tier-gold',
    name: 'Gold VIP',
    price: 850,
    description: 'Premium seating with lounge access',
    available: 45,
    perks: ['VIP Lounge', 'Free Drinks'],
  };

  describe('Event Selection', () => {
    it('should select an event and initialize booking step', () => {
      useBookingStore.getState().selectEvent(testEvent);
      expect(useBookingStore.getState().selectedEvent).toEqual(testEvent);
      expect(useBookingStore.getState().bookingStep).toBe(1);
    });
  });

  describe('Tier Selection', () => {
    it('should select a seating tier', () => {
      useBookingStore.getState().selectTier(testTier);
      expect(useBookingStore.getState().selectedTier).toEqual(testTier);
    });
  });

  describe('Ticket Quantity', () => {
    it('should set ticket quantity', () => {
      useBookingStore.getState().setTicketQuantity(4);
      expect(useBookingStore.getState().ticketQuantity).toBe(4);
    });

    it('should clamp quantity to minimum 1', () => {
      useBookingStore.getState().setTicketQuantity(0);
      expect(useBookingStore.getState().ticketQuantity).toBe(1);
    });

    it('should clamp quantity to maximum 10', () => {
      useBookingStore.getState().setTicketQuantity(15);
      expect(useBookingStore.getState().ticketQuantity).toBe(10);
    });
  });

  describe('Booking Step Navigation', () => {
    it('should set booking step', () => {
      useBookingStore.getState().setBookingStep(2);
      expect(useBookingStore.getState().bookingStep).toBe(2);
    });
  });

  describe('Pre-Order Items', () => {
    const menuItem = {
      id: 'item-pizza',
      name: 'Stadium Pizza',
      price: 199,
      category: 'food' as const,
      image: '🍕',
      description: 'Wood-fired pizza',
      popular: true,
    };

    it('should add a pre-order item', () => {
      useBookingStore.getState().addPreOrderItem(menuItem);
      const items = useBookingStore.getState().preOrderItems;
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Stadium Pizza');
      expect(items[0].quantity).toBe(1);
    });

    it('should increment quantity for existing pre-order item', () => {
      useBookingStore.getState().addPreOrderItem(menuItem);
      useBookingStore.getState().addPreOrderItem(menuItem);
      expect(useBookingStore.getState().preOrderItems[0].quantity).toBe(2);
    });

    it('should update pre-order quantity', () => {
      useBookingStore.getState().addPreOrderItem(menuItem);
      useBookingStore.getState().updatePreOrderQuantity('item-pizza', 5);
      expect(useBookingStore.getState().preOrderItems[0].quantity).toBe(5);
    });

    it('should remove item when pre-order quantity is 0', () => {
      useBookingStore.getState().addPreOrderItem(menuItem);
      useBookingStore.getState().updatePreOrderQuantity('item-pizza', 0);
      expect(useBookingStore.getState().preOrderItems).toHaveLength(0);
    });
  });

  describe('Promo Codes', () => {
    it('should apply valid percentage promo code', () => {
      const result = useBookingStore.getState().applyPromo('ARENA10');
      expect(result).toBe(true);
      expect(useBookingStore.getState().promoCode).toBe('ARENA10');
    });

    it('should apply valid fixed promo code', () => {
      const result = useBookingStore.getState().applyPromo('FIRST50');
      expect(result).toBe(true);
      expect(useBookingStore.getState().promoCode).toBe('FIRST50');
    });

    it('should reject invalid promo code', () => {
      const result = useBookingStore.getState().applyPromo('INVALID');
      expect(result).toBe(false);
      expect(useBookingStore.getState().promoCode).toBe('');
    });

    it('should be case insensitive', () => {
      const result = useBookingStore.getState().applyPromo('arena10');
      expect(result).toBe(true);
    });

    it('should clear promo code', () => {
      useBookingStore.getState().applyPromo('ARENA10');
      useBookingStore.getState().clearPromo();
      expect(useBookingStore.getState().promoCode).toBe('');
    });
  });

  describe('Price Calculations', () => {
    it('should calculate ticket total', () => {
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().setTicketQuantity(2);
      expect(useBookingStore.getState().getTicketTotal()).toBe(1700); // 850 * 2
    });

    it('should calculate pre-order total', () => {
      const pizza = {
        id: 'pizza',
        name: 'Pizza',
        price: 200,
        category: 'food' as const,
        image: '🍕',
        description: 'test',
        popular: false,
      };
      useBookingStore.getState().addPreOrderItem(pizza);
      useBookingStore.getState().addPreOrderItem(pizza); // qty = 2
      expect(useBookingStore.getState().getPreOrderTotal()).toBe(400); // 200 * 2
    });

    it('should calculate percentage discount', () => {
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().setTicketQuantity(1);
      useBookingStore.getState().applyPromo('ARENA10'); // 10% off
      const discount = useBookingStore.getState().getDiscountAmount();
      expect(discount).toBe(85); // 10% of 850
    });

    it('should calculate fixed discount', () => {
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().setTicketQuantity(1);
      useBookingStore.getState().applyPromo('FIRST50'); // ₹50 off
      const discount = useBookingStore.getState().getDiscountAmount();
      expect(discount).toBe(200);
    });

    it('should calculate grand total with discount', () => {
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().setTicketQuantity(1);
      useBookingStore.getState().applyPromo('ARENA10'); // 10% off
      const total = useBookingStore.getState().getGrandTotal();
      expect(total).toBe(765); // 850 - 85
    });
  });

  describe('Booking Confirmation', () => {
    it('should confirm booking and add to booked events', () => {
      useBookingStore.getState().selectEvent(testEvent);
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().confirmBooking();
      expect(useBookingStore.getState().bookedEvents).toHaveLength(1);
      expect(useBookingStore.getState().selectedEvent).toBeNull();
    });
  });

  describe('Reset Booking', () => {
    it('should reset all booking state', () => {
      useBookingStore.getState().selectEvent(testEvent);
      useBookingStore.getState().selectTier(testTier);
      useBookingStore.getState().setTicketQuantity(3);
      useBookingStore.getState().applyPromo('ARENA10');
      useBookingStore.getState().resetBooking();

      const state = useBookingStore.getState();
      expect(state.selectedEvent).toBeNull();
      expect(state.selectedTier).toBeNull();
      expect(state.ticketQuantity).toBe(1);
      expect(state.promoCode).toBe('');
      expect(state.preOrderItems).toHaveLength(0);
    });
  });
});

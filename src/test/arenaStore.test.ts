import { describe, it, expect, beforeEach } from 'vitest';
import { useArenaStore } from '@/stores/arenaStore';
import { mockUser, mockOrders, mockAlerts } from '@/data/mockData';
import type { MenuItem } from '@/types/arena';

// Reset store state before each test
beforeEach(() => {
  localStorage.clear();
  useArenaStore.setState({
    user: { ...mockUser },
    cart: [],
    orders: [...mockOrders],
    alerts: [...mockAlerts],
    activeTab: 'home',
    userRewards: [],
    savedAddresses: [],
    savedPayments: [],
  });
});

describe('arenaStore', () => {
  describe('Cart Management', () => {
    const testItem: MenuItem = {
      id: 'test-burger',
      name: 'Test Burger',
      price: 250,
      category: 'food',
      image: '🍔',
      description: 'A test burger',
      popular: false,
    };

    it('should add an item to the cart', () => {
      useArenaStore.getState().addToCart(testItem);
      const cart = useArenaStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].name).toBe('Test Burger');
      expect(cart[0].quantity).toBe(1);
    });

    it('should increment quantity when adding the same item', () => {
      const { addToCart } = useArenaStore.getState();
      addToCart(testItem);
      addToCart(testItem);
      const cart = useArenaStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });

    it('should update item quantity', () => {
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().updateCartQuantity('test-burger', 5);
      expect(useArenaStore.getState().cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().updateCartQuantity('test-burger', 0);
      expect(useArenaStore.getState().cart).toHaveLength(0);
    });

    it('should clear the cart', () => {
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().addToCart({ ...testItem, id: 'item-2', name: 'Item 2' });
      useArenaStore.getState().clearCart();
      expect(useArenaStore.getState().cart).toHaveLength(0);
    });
  });

  describe('Order Placement', () => {
    const testItem: MenuItem = {
      id: 'test-nachos',
      name: 'Nachos',
      price: 180,
      category: 'food',
      image: '🌮',
      description: 'Loaded nachos',
      popular: true,
    };

    it('should place an order from cart items', () => {
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().placeOrder('seat');
      const orders = useArenaStore.getState().orders;
      // Check that at least one order has the nachos items
      const newOrder = orders.find(o => o.items.some(i => i.name === 'Nachos'));
      expect(newOrder).toBeDefined();
      expect(newOrder!.status).toBe('preparing');
    });

    it('should clear cart after order placement', () => {
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().placeOrder('seat');
      expect(useArenaStore.getState().cart).toHaveLength(0);
    });

    it('should award arena points on order placement', () => {
      const initialPoints = useArenaStore.getState().user.arenaPoints;
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().placeOrder('seat');
      expect(useArenaStore.getState().user.arenaPoints).toBeGreaterThan(initialPoints);
    });
  });

  describe('Tab Navigation', () => {
    it('should set active tab', () => {
      useArenaStore.getState().setActiveTab('map');
      expect(useArenaStore.getState().activeTab).toBe('map');
    });

    it('should default to home tab', () => {
      expect(useArenaStore.getState().activeTab).toBe('home');
    });
  });

  describe('Daily Drop', () => {
    it('should return points and update user on first claim', () => {
      const points = useArenaStore.getState().claimDailyDrop();
      expect(points).toBeGreaterThan(0);
      expect(useArenaStore.getState().user.dailyDropClaimed).toBe(true);
    });

    it('should store claim date in localStorage', () => {
      useArenaStore.getState().claimDailyDrop();
      const today = new Date().toISOString().split('T')[0];
      expect(localStorage.getItem('sanchara-daily-drop-date')).toBe(today);
    });

    it('should return 0 on duplicate claim same day', () => {
      useArenaStore.getState().claimDailyDrop();
      const secondAttempt = useArenaStore.getState().claimDailyDrop();
      expect(secondAttempt).toBe(0);
    });

    it('should increase user streak', () => {
      const initialStreak = useArenaStore.getState().user.streak;
      useArenaStore.getState().claimDailyDrop();
      expect(useArenaStore.getState().user.streak).toBe(initialStreak + 1);
    });
  });

  describe('Alerts', () => {
    it('should mark alert as read', () => {
      const alertId = useArenaStore.getState().alerts[0]?.id;
      if (alertId) {
        useArenaStore.getState().markAlertRead(alertId);
        const alert = useArenaStore.getState().alerts.find(a => a.id === alertId);
        expect(alert?.read).toBe(true);
      }
    });
  });

  describe('User Profile', () => {
    it('should update user name', () => {
      useArenaStore.getState().updateUserName('New User Name');
      expect(useArenaStore.getState().user.name).toBe('New User Name');
    });
  });

  describe('Saved Addresses', () => {
    it('should accept direct value for addresses', () => {
      const newAddresses = [
        { id: '1', label: 'Home', section: '108', row: 'A', seat: '5', venue: 'Main Arena', isDefault: true },
      ];
      useArenaStore.getState().updateAddresses(newAddresses);
      expect(useArenaStore.getState().savedAddresses).toHaveLength(1);
      expect(useArenaStore.getState().savedAddresses[0].label).toBe('Home');
    });

    it('should accept updater function for addresses', () => {
      useArenaStore.getState().updateAddresses([
        { id: '1', label: 'Work', section: '205', row: 'B', seat: '10', venue: 'Main Arena', isDefault: false },
      ]);
      useArenaStore.getState().updateAddresses((prev) => [
        ...prev,
        { id: '2', label: 'VIP', section: '310', row: 'C', seat: '1', venue: 'Main Arena', isDefault: true },
      ]);
      expect(useArenaStore.getState().savedAddresses).toHaveLength(2);
    });
  });

  describe('Saved Payments', () => {
    it('should accept updater function for payments', () => {
      useArenaStore.getState().updatePayments([
        { id: '1', type: 'visa', last4: '4242', expiry: '12/28', isDefault: true },
      ]);
      useArenaStore.getState().updatePayments((prev) =>
        prev.filter(p => p.id !== '1')
      );
      expect(useArenaStore.getState().savedPayments).toHaveLength(0);
    });
  });

  describe('Order Status Progression', () => {
    it('should progress order status through the flow', () => {
      const testItem: MenuItem = {
        id: 'test-item',
        name: 'Test Item',
        price: 100,
        category: 'food',
        image: '🍕',
        description: 'Test',
        popular: false,
      };
      useArenaStore.getState().addToCart(testItem);
      useArenaStore.getState().placeOrder('seat');

      const orderId = useArenaStore.getState().orders.find(o => o.items.some(i => i.name === 'Test Item'))?.id;
      if (orderId) {
        // preparing → ready
        useArenaStore.getState().progressOrderStatus(orderId);
        expect(useArenaStore.getState().orders.find(o => o.id === orderId)?.status).toBe('ready');

        // ready → delivering
        useArenaStore.getState().progressOrderStatus(orderId);
        expect(useArenaStore.getState().orders.find(o => o.id === orderId)?.status).toBe('delivering');

        // delivering → delivered
        useArenaStore.getState().progressOrderStatus(orderId);
        expect(useArenaStore.getState().orders.find(o => o.id === orderId)?.status).toBe('delivered');
      }
    });
  });
});

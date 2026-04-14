import type { Order } from '@/types/arena';

/** Shared mock past order history used by ProfilePage and OrderPage */
export const mockPastOrders: (Order & { date: string })[] = [
  { id: 'past-001', items: [{ id: 'm1', name: 'Stadium Burger', description: '', price: 450, category: 'food', image: '🍔', quantity: 2, popular: true }, { id: 'm3', name: 'Craft IPA', description: '', price: 380, category: 'drinks', image: '🍺', quantity: 2 }], total: 1660, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-04-05' },
  { id: 'past-002', items: [{ id: 'm4', name: 'Loaded Nachos', description: '', price: 350, category: 'food', image: '🧀', quantity: 1 }, { id: 'm7', name: 'Fresh Lemonade', description: '', price: 150, category: 'drinks', image: '🍋', quantity: 3 }], total: 800, status: 'delivered', deliveryType: 'pickup', estimatedMinutes: 0, date: '2026-04-02' },
  { id: 'past-003', items: [{ id: 'm9', name: 'Team Jersey', description: '', price: 2100, category: 'merch', image: '👕', quantity: 1 }], total: 2100, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-03-28' },
];

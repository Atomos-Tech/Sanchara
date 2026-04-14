import type { Order } from '@/types/arena';

/** Shared mock past order history used by ProfilePage and OrderPage */
export const mockPastOrders: (Order & { date: string })[] = [
  { id: 'past-001', items: [{ id: 'm1', name: 'Stadium Burger', description: '', price: 18, category: 'food', image: '🍔', quantity: 2, popular: true }, { id: 'm3', name: 'Craft IPA', description: '', price: 15, category: 'drinks', image: '🍺', quantity: 2 }], total: 66, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-04-05' },
  { id: 'past-002', items: [{ id: 'm4', name: 'Loaded Nachos', description: '', price: 14, category: 'food', image: '🧀', quantity: 1 }, { id: 'm7', name: 'Fresh Lemonade', description: '', price: 7, category: 'drinks', image: '🍋', quantity: 3 }], total: 35, status: 'delivered', deliveryType: 'pickup', estimatedMinutes: 0, date: '2026-04-02' },
  { id: 'past-003', items: [{ id: 'm9', name: 'Team Jersey', description: '', price: 140, category: 'merch', image: '👕', quantity: 1 }], total: 150, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-03-28' },
];

import type { Ticket, GateSuggestion, Facility, MenuItem, Order, ArenaAlert, RewardItem, UserProfile } from '@/types/arena';

export const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Alex Rivera',
  arenaPoints: 2450,
  level: 7,
  dailyDropClaimed: false,
  streak: 3,
};

export const mockTicket: Ticket = {
  id: 'tkt-001',
  eventName: 'Lakers vs Warriors',
  venue: 'Crypto.com Arena',
  date: '2026-04-07',
  time: '7:30 PM',
  section: '108',
  row: 'D',
  seat: '14',
  gate: 'A',
  barcode: 'ARENA-2026-0407-108D14',
};

export const mockGates: GateSuggestion[] = [
  { gate: 'A', waitMinutes: 12, distance: '120m', crowdLevel: 'high' },
  { gate: 'B', waitMinutes: 4, distance: '200m', crowdLevel: 'low' },
  { gate: 'C', waitMinutes: 8, distance: '180m', crowdLevel: 'moderate' },
  { gate: 'D', waitMinutes: 15, distance: '90m', crowdLevel: 'high' },
];

export const mockFacilities: Facility[] = [
  { id: 'f1', name: 'Restroom 1A', type: 'restroom', section: '101', waitMinutes: 2, status: 'clear', x: 20, y: 30 },
  { id: 'f2', name: 'Restroom 2B', type: 'restroom', section: '205', waitMinutes: 8, status: 'moderate', x: 70, y: 25 },
  { id: 'f3', name: 'Restroom 3C', type: 'restroom', section: '310', waitMinutes: 15, status: 'busy', x: 50, y: 75 },
  { id: 'f4', name: 'Hot Dogs & More', type: 'concession', section: '102', waitMinutes: 3, status: 'clear', x: 30, y: 45 },
  { id: 'f5', name: 'Burgers & Brews', type: 'concession', section: '206', waitMinutes: 10, status: 'moderate', x: 65, y: 50 },
  { id: 'f6', name: 'Pizza Corner', type: 'concession', section: '312', waitMinutes: 18, status: 'busy', x: 45, y: 65 },
  { id: 'f7', name: 'Team Store', type: 'merch', section: '100', waitMinutes: 5, status: 'clear', x: 15, y: 55 },
  { id: 'f8', name: 'Fan Gear', type: 'merch', section: '300', waitMinutes: 12, status: 'moderate', x: 80, y: 60 },
];

export const mockMenu: MenuItem[] = [
  { id: 'm1', name: 'Stadium Burger', description: 'Angus beef, cheddar, special sauce', price: 450, category: 'food', image: '🍔', popular: true },
  { id: 'm2', name: 'Loaded Nachos', description: 'Cheese, jalapeños, sour cream', price: 350, category: 'food', image: '🧀' },
  { id: 'm3', name: 'Classic Hot Dog', description: 'All-beef frank, your choice of toppings', price: 250, category: 'food', image: '🌭', popular: true },
  { id: 'm4', name: 'Chicken Tenders', description: 'Crispy tenders with ranch', price: 380, category: 'food', image: '🍗' },
  { id: 'm5', name: 'Craft IPA', description: 'Local brewery seasonal', price: 600, category: 'drinks', image: '🍺', popular: true },
  { id: 'm6', name: 'Frozen Margarita', description: 'Classic lime, salt rim', price: 700, category: 'drinks', image: '🍹' },
  { id: 'm7', name: 'Soda', description: 'Coca-Cola, Thums Up, or Limca', price: 120, category: 'drinks', image: '🥤' },
  { id: 'm8', name: 'Water', description: 'Bottled mineral water', price: 150, category: 'drinks', image: '💧' },
  { id: 'm9', name: 'Team Jersey', description: 'Official replica jersey', price: 3500, category: 'merch', image: '👕' },
  { id: 'm10', name: 'Rally Towel', description: 'Game day rally towel', price: 499, category: 'merch', image: '🏳️' },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    items: [
      { ...mockMenu[0], quantity: 2 },
      { ...mockMenu[4], quantity: 2 },
    ],
    total: 2100,
    status: 'preparing',
    deliveryType: 'seat',
    estimatedMinutes: 12,
  },
];

export const mockAlerts: ArenaAlert[] = [
  { id: 'a1', type: 'game', title: 'Halftime Show', message: 'Halftime entertainment starts in 5 minutes!', timestamp: new Date(), read: false },
  { id: 'a2', type: 'crowd', title: 'Gate B Clear', message: 'Gate B currently has the shortest wait. Head there now!', timestamp: new Date(Date.now() - 300000), read: false },
  { id: 'a3', type: 'sale', title: 'Flash Deal 🔥', message: '50% off nachos at Pizza Corner for the next 10 minutes!', timestamp: new Date(Date.now() - 600000), read: true },
  { id: 'a4', type: 'reward', title: 'Points Earned!', message: 'You earned 50 Arena Points for early arrival!', timestamp: new Date(Date.now() - 900000), read: true },
];

export const mockRewards: RewardItem[] = [
  { id: 'r1', name: 'Free Hot Dog', description: 'Redeem at any concession stand', pointsCost: 500, category: 'food', icon: '🌭' },
  { id: 'r2', name: '25% Off Merch', description: 'Any item at the Team Store', pointsCost: 1000, category: 'merch', icon: '🏷️' },
  { id: 'r3', name: 'VIP Lounge Pass', description: '1-hour access to VIP lounge', pointsCost: 3000, category: 'experience', icon: '⭐' },
  { id: 'r4', name: 'Seat Upgrade', description: 'Upgrade to premium seating', pointsCost: 5000, category: 'upgrade', icon: '🎫' },
  { id: 'r5', name: 'Free Craft Beer', description: 'Any craft beer on tap', pointsCost: 800, category: 'food', icon: '🍺' },
  { id: 'r6', name: 'Meet & Greet', description: 'Post-game player meet & greet', pointsCost: 10000, category: 'experience', icon: '🤝' },
];

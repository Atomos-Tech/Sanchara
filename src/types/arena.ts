export interface Ticket {
  id: string;
  eventName: string;
  venue: string;
  date: string;
  time: string;
  section: string;
  row: string;
  seat: string;
  gate: string;
  barcode: string;
}

export interface GateSuggestion {
  gate: string;
  waitMinutes: number;
  distance: string;
  crowdLevel: 'low' | 'moderate' | 'high';
}

export interface Facility {
  id: string;
  name: string;
  type: 'restroom' | 'concession' | 'merch';
  section: string;
  waitMinutes: number;
  status: 'clear' | 'moderate' | 'busy';
  x: number;
  y: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drinks' | 'merch';
  image: string;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'preparing' | 'ready' | 'delivering' | 'delivered';
  deliveryType: 'seat' | 'pickup';
  estimatedMinutes: number;
}

export interface ArenaAlert {
  id: string;
  type: 'game' | 'crowd' | 'sale' | 'reward';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'food' | 'upgrade' | 'merch' | 'experience';
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  arenaPoints: number;
  level: number;
  dailyDropClaimed: boolean;
  streak: number;
}

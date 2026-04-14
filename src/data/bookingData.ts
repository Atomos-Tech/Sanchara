import type { CalendarEvent, SeatingTier, PromoCode } from '@/types/booking';
import type { MenuItem } from '@/types/arena';

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'ev1', date: '2026-04-07', name: 'Lakers vs Warriors', venue: 'Crypto.com Arena', time: '7:30 PM', category: 'sports', image: '🏀', basePrice: 12000 },
  { id: 'ev2', date: '2026-04-10', name: 'Taylor Swift - Eras Tour', venue: 'Crypto.com Arena', time: '8:00 PM', category: 'concert', image: '🎤', basePrice: 25000 },
  { id: 'ev3', date: '2026-04-12', name: 'Clippers vs Suns', venue: 'Crypto.com Arena', time: '6:00 PM', category: 'sports', image: '🏀', basePrice: 9500 },
  { id: 'ev4', date: '2026-04-15', name: 'Kevin Hart Live', venue: 'Crypto.com Arena', time: '9:00 PM', category: 'comedy', image: '😂', basePrice: 5000 },
  { id: 'ev5', date: '2026-04-18', name: 'Lakers vs Celtics', venue: 'Crypto.com Arena', time: '7:00 PM', category: 'sports', image: '🏀', basePrice: 4000 },
  { id: 'ev6', date: '2026-04-22', name: 'Bad Bunny World Tour', venue: 'Crypto.com Arena', time: '8:30 PM', category: 'concert', image: '🎵', basePrice: 18000 },
  { id: 'ev7', date: '2026-04-25', name: 'UFC Fight Night', venue: 'Crypto.com Arena', time: '7:00 PM', category: 'sports', image: '🥊', basePrice: 11000 },
  { id: 'ev8', date: '2026-04-28', name: 'Food & Music Fest', venue: 'Crypto.com Arena', time: '12:00 PM', category: 'festival', image: '🎪', basePrice: 4000 },
];

export const seatingTiers: SeatingTier[] = [
  { id: 'tier-1', name: 'Floor VIP', price: 8000, available: 12, description: 'Front row experience with lounge access' },
  { id: 'tier-2', name: 'Lower Bowl', price: 4500, available: 84, description: 'Premium sightlines, sections 100-110' },
  { id: 'tier-3', name: 'Club Level', price: 2800, available: 156, description: 'Exclusive club access with in-seat service' },
  { id: 'tier-4', name: 'Upper Deck', price: 1200, available: 340, description: 'Great views at an unbeatable price' },
];

export const preOrderMenu: MenuItem[] = [
  { id: 'pre-1', name: 'Pregame Burger Combo', description: 'Burger, fries & craft beer', price: 650, category: 'food', image: '🍔', popular: true },
  { id: 'pre-2', name: 'Nacho Platter', description: 'Loaded nachos for the crew', price: 450, category: 'food', image: '🧀' },
  { id: 'pre-3', name: 'Craft Beer 4-Pack', description: 'Pre-chilled local IPAs', price: 1200, category: 'drinks', image: '🍺', popular: true },
  { id: 'pre-4', name: 'Premium Cocktail Kit', description: 'Margarita kit for 2', price: 900, category: 'drinks', image: '🍹' },
  { id: 'pre-5', name: 'Event Exclusive Tee', description: 'Limited edition event shirt', price: 2800, category: 'merch', image: '👕', popular: true },
  { id: 'pre-6', name: 'Signed Rally Towel', description: 'Collector edition', price: 1000, category: 'merch', image: '🏳️' },
];

export const promoCodes: PromoCode[] = [
  { code: 'ARENA10', type: 'percentage', value: 10, label: '10% Off' },
  { code: 'FIRST50', type: 'fixed', value: 200, label: '₹200 Off' },
  { code: 'GAMEDAY', type: 'percentage', value: 15, label: '15% Off' },
  { code: 'VIP20', type: 'percentage', value: 20, label: '20% Off' },
];

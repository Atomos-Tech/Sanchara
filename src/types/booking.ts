export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  venue: string;
  time: string;
  category: 'sports' | 'concert' | 'comedy' | 'festival';
  image: string;
  basePrice: number;
}

export interface SeatingTier {
  id: string;
  name: string;
  price: number;
  available: number;
  description: string;
}

export interface PreOrderItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drinks' | 'merch';
  image: string;
  quantity: number;
  eventTied: boolean;
}

export interface BookingState {
  selectedEvent: CalendarEvent | null;
  selectedTier: SeatingTier | null;
  ticketQuantity: number;
  preOrderItems: PreOrderItem[];
  promoCode: string;
  promoDiscount: number;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  label: string;
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Ticket, TrendingUp, Search, Star } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import BookingModal from '@/components/BookingModal';
import type { CalendarEvent } from '@/types/booking';

const categories = [
  { id: 'all', label: '🔥 All', color: 'bg-primary/15 text-primary' },
  { id: 'sports', label: '🏀 Live Sports', color: 'bg-primary/15 text-primary' },
  { id: 'concert', label: '🎤 Concerts', color: 'bg-accent/15 text-accent' },
  { id: 'comedy', label: '😂 Stand-Up', color: 'bg-destructive/15 text-destructive' },
  { id: 'dining', label: '🍽️ Dining Out', color: 'bg-arena-green/15 text-arena-green' },
];

const exploreEvents: (CalendarEvent & { rating?: number; attendees?: string; trending?: boolean; imageUrl?: string })[] = [
  { id: 'exp1', date: '2026-04-10', name: 'Lakers vs Warriors', venue: 'Crypto.com Arena', time: '7:30 PM', category: 'sports', image: '🏀', basePrice: 85, rating: 4.8, attendees: '18.2K', trending: true },
  { id: 'exp2', date: '2026-04-12', name: 'Taylor Swift - Eras Tour', venue: 'Crypto.com Arena', time: '8:00 PM', category: 'concert', image: '🎤', basePrice: 150, rating: 4.9, attendees: '20K', trending: true },
  { id: 'exp3', date: '2026-04-14', name: 'Kevin Hart Live', venue: 'The Forum', time: '9:00 PM', category: 'comedy', image: '😂', basePrice: 75, rating: 4.7, attendees: '5.8K' },
  { id: 'exp4', date: '2026-04-15', name: 'Clippers vs Suns', venue: 'Crypto.com Arena', time: '6:00 PM', category: 'sports', image: '🏀', basePrice: 65, rating: 4.5, attendees: '17.1K' },
  { id: 'exp5', date: '2026-04-18', name: 'Bad Bunny World Tour', venue: 'SoFi Stadium', time: '8:30 PM', category: 'concert', image: '🎵', basePrice: 130, rating: 4.8, attendees: '70K', trending: true },
  { id: 'exp6', date: '2026-04-20', name: 'Dave Chappelle', venue: 'Hollywood Bowl', time: '8:00 PM', category: 'comedy', image: '🎭', basePrice: 95, rating: 4.9, attendees: '8K' },
  { id: 'exp7', date: '2026-04-22', name: 'UFC Fight Night 312', venue: 'Crypto.com Arena', time: '7:00 PM', category: 'sports', image: '🥊', basePrice: 95, rating: 4.6, attendees: '15K', trending: true },
  { id: 'exp8', date: '2026-04-25', name: 'Lakers vs Celtics', venue: 'Crypto.com Arena', time: '7:00 PM', category: 'sports', image: '🏀', basePrice: 120, rating: 4.9, attendees: '18.5K' },
];

const featuredEvent = exploreEvents[1]; // Taylor Swift

const gradients = [
  'from-primary/20 to-accent/10',
  'from-accent/20 to-primary/10',
  'from-destructive/20 to-accent/10',
  'from-primary/20 to-destructive/10',
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectEvent, bookingStep } = useBookingStore();

  const filtered = exploreEvents.filter((e) => {
    const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const trendingEvents = exploreEvents.filter((e) => e.trending);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Explore</h1>
          <p className="text-sm text-muted-foreground">Discover experiences around you</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events, venues, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 bg-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-card text-muted-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        {activeCategory === 'all' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative glass-card-elevated overflow-hidden rounded-2xl glow-cyan"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[0]} opacity-50`} />
            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground flex items-center gap-1">
                  <TrendingUp size={10} /> FEATURED
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary">
                  Selling Fast
                </span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-5xl">{featuredEvent.image}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-display font-bold text-foreground">{featuredEvent.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {featuredEvent.venue}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {new Date(featuredEvent.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {featuredEvent.time}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-primary">From ₹{featuredEvent.basePrice}</span>
                    <span className="flex items-center gap-1 text-xs text-accent">
                      <Star size={10} fill="currentColor" /> {featuredEvent.rating}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => selectEvent(featuredEvent)}
                className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                <Ticket size={16} /> Get Tickets
              </button>
            </div>
          </motion.div>
        )}

        {/* Trending horizontal scroll */}
        {activeCategory === 'all' && !searchQuery && (
          <div>
            <h2 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-accent" /> Trending Now
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
              {trendingEvents.map((event, i) => (
                <motion.button
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => selectEvent(event)}
                  className="flex-shrink-0 w-40 glass-card overflow-hidden text-left"
                >
                  <div className={`h-24 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                    <span className="text-4xl">{event.image}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-foreground truncate">{event.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(event.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-primary">₹{event.basePrice}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-accent">
                        <Star size={8} fill="currentColor" /> {event.rating}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Event Feed */}
        <div>
          {(activeCategory !== 'all' || searchQuery) && (
            <h2 className="text-sm font-display font-semibold text-foreground mb-3">
              {filtered.length} events found
            </h2>
          )}
          {activeCategory === 'all' && !searchQuery && (
            <h2 className="text-sm font-display font-semibold text-foreground mb-3">All Events</h2>
          )}
          <div className="space-y-3">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card overflow-hidden"
              >
                {/* Card gradient header */}
                <div className={`h-20 bg-gradient-to-r ${gradients[i % gradients.length]} flex items-center px-4 gap-4`}>
                  <span className="text-4xl">{event.image}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate">{event.name}</h3>
                      {event.trending && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-accent text-accent-foreground flex items-center gap-0.5">
                          <TrendingUp size={8} /> Trending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={10} /> {event.venue}
                    </p>
                  </div>
                </div>
                {/* Card body */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {new Date(event.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.time}
                    </span>
                    {event.rating && (
                      <span className="flex items-center gap-0.5 text-accent">
                        <Star size={10} fill="currentColor" /> {event.rating}
                      </span>
                    )}
                    {event.attendees && (
                      <span>{event.attendees} going</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary">₹{event.basePrice}</span>
                    <button
                      onClick={() => selectEvent(event)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {bookingStep > 0 && <BookingModal />}
    </>
  );
}

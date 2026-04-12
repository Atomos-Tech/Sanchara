import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Clock, Ticket } from 'lucide-react';
import { mockCalendarEvents } from '@/data/bookingData';
import { useBookingStore } from '@/stores/bookingStore';
import BookingModal from '@/components/BookingModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April = 3
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { selectEvent, bookingStep } = useBookingStore();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const eventsForDate = (dateStr: string) =>
    mockCalendarEvents.filter((e) => e.date === dateStr);

  const hasEvents = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockCalendarEvents.some((e) => e.date === dateStr);
  };

  const selectedDateStr = selectedDate;
  const selectedEvents = selectedDateStr ? eventsForDate(selectedDateStr) : [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const categoryColors: Record<string, string> = {
    sports: 'bg-primary/15 text-primary',
    concert: 'bg-accent/15 text-accent',
    comedy: 'bg-destructive/15 text-destructive',
    festival: 'bg-arena-green/15 text-arena-green',
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Discover Events</h1>
          <p className="text-sm text-muted-foreground">Find and book your next experience</p>
        </div>

        {/* Calendar */}
        <div className="glass-card-elevated p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-base font-display font-semibold text-foreground">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const hasEvent = hasEvents(day);
              const isToday = dateStr === '2026-04-07';

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-sm ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold'
                      : isToday
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {day}
                  {hasEvent && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event list for selected date */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="glass-card p-4"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{event.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${categoryColors[event.category]}`}>
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{event.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={10} />{event.venue}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{event.time}</span>
                        </div>
                        <p className="text-sm font-bold text-primary mt-2">From ₹{event.basePrice}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => selectEvent(event)}
                      className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
                    >
                      <Ticket size={16} /> Book Ticket
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground text-sm">No events on this date</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming events preview */}
        {!selectedDate && (
          <div className="space-y-2">
            <h2 className="text-sm font-display font-semibold text-foreground">Upcoming Events</h2>
            {mockCalendarEvents.slice(0, 4).map((event, i) => (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectEvent(event)}
                className="w-full glass-card p-3 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="text-2xl">{event.image}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{event.name}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(event.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {event.time}</p>
                </div>
                <span className="text-sm font-bold text-primary">₹{event.basePrice}</span>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {bookingStep > 0 && <BookingModal />}
    </>
  );
}

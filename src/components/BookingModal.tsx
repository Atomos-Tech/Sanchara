import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ChevronRight, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { seatingTiers, preOrderMenu } from '@/data/bookingData';
import { useState } from 'react';
import type { MenuItem } from '@/types/arena';
import CheckoutView from '@/components/CheckoutView';

const categories = ['food', 'drinks', 'merch'] as const;
const catLabels = { food: '🍔 Food', drinks: '🍺 Drinks', merch: '👕 Merch' };

export default function BookingModal() {
  const {
    selectedEvent, selectedTier, ticketQuantity, bookingStep, preOrderItems,
    selectTier, setTicketQuantity, setBookingStep, addPreOrderItem,
    updatePreOrderQuantity, resetBooking,
  } = useBookingStore();
  const [upsellCategory, setUpsellCategory] = useState<typeof categories[number]>('food');

  if (!selectedEvent) return null;

  const canProceedStep1 = selectedTier !== null;
  const getPreOrderQty = (id: string) => preOrderItems.find((p) => p.id === id)?.quantity || 0;
  const filteredMenu = preOrderMenu.filter((m) => m.category === upsellCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            {bookingStep > 1 && (
              <button onClick={() => setBookingStep(bookingStep - 1)} className="text-muted-foreground hover:text-foreground">
                <ChevronRight size={18} className="rotate-180" />
              </button>
            )}
            <h2 className="text-base font-display font-semibold text-foreground">
              {bookingStep === 1 ? 'Select Seats' : bookingStep === 2 ? 'Enhance Your Experience' : 'Checkout'}
            </h2>
          </div>
          <button onClick={resetBooking} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-4 py-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                bookingStep >= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {bookingStep > step ? <Check size={12} /> : step}
              </div>
              {step < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${bookingStep > step ? 'bg-primary' : 'bg-secondary'}`} />}
            </div>
          ))}
        </div>

        {/* Event summary */}
        <div className="px-4 py-2">
          <div className="glass-card p-3 flex items-center gap-3">
            <span className="text-2xl">{selectedEvent.image}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{selectedEvent.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedEvent.venue} · {selectedEvent.time}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          <AnimatePresence mode="wait">
            {bookingStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 py-2">
                <h3 className="text-sm font-display font-semibold text-foreground">Choose Your Tier</h3>
                {seatingTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => selectTier(tier)}
                    className={`w-full glass-card p-4 text-left transition-all ${
                      selectedTier?.id === tier.id ? 'border-primary/50 glow-cyan' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{tier.name}</h4>
                      <span className="text-base font-bold text-primary">₹{tier.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{tier.available} seats available</p>
                  </button>
                ))}

                {selectedTier && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
                    <p className="text-xs text-muted-foreground mb-2">Quantity</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setTicketQuantity(ticketQuantity - 1)} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Minus size={14} />
                      </button>
                      <span className="text-lg font-bold text-foreground w-8 text-center">{ticketQuantity}</span>
                      <button onClick={() => setTicketQuantity(ticketQuantity + 1)} className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Plus size={14} />
                      </button>
                      <div className="flex-1 text-right">
                        <p className="text-lg font-bold text-primary">₹{(selectedTier.price * ticketQuantity).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">+{Math.floor(selectedTier.price * ticketQuantity * 2)} pts</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {bookingStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <h3 className="text-sm font-display font-semibold text-foreground">Pre-Order for This Event</h3>
                </div>
                <p className="text-xs text-muted-foreground">Skip the lines — have everything ready when you arrive</p>

                <div className="flex gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setUpsellCategory(cat)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        upsellCategory === cat ? 'bg-accent text-accent-foreground' : 'glass-card text-muted-foreground'
                      }`}
                    >
                      {catLabels[cat]}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredMenu.map((item) => {
                    const qty = getPreOrderQty(item.id);
                    return (
                      <div key={item.id} className="glass-card p-3 flex items-start gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                            {item.popular && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-accent/15 text-accent">Popular</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-sm font-bold text-primary mt-1">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 glass-card rounded-full px-2 py-1">
                              <button onClick={() => updatePreOrderQuantity(item.id, qty - 1)} className="text-muted-foreground hover:text-foreground">
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-semibold text-foreground w-4 text-center">{qty}</span>
                              <button onClick={() => addPreOrderItem(item as MenuItem)} className="text-accent">
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addPreOrderItem(item as MenuItem)}
                              className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent hover:bg-accent/25 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {bookingStep === 3 && <CheckoutView />}
          </AnimatePresence>
        </div>

        {/* Bottom action bar */}
        {bookingStep < 3 && (
          <div className="flex-shrink-0 mx-4 mb-4 rounded-2xl border border-border/30 glass-card p-4">
            <button
              onClick={() => setBookingStep(bookingStep + 1)}
              disabled={bookingStep === 1 && !canProceedStep1}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                (bookingStep === 1 && !canProceedStep1)
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
              }`}
            >
              {bookingStep === 1 ? (
                <>Continue <ChevronRight size={16} /></>
              ) : (
                <><ShoppingBag size={16} /> Proceed to Checkout</>
              )}
            </button>
            {bookingStep === 2 && (
              <button onClick={() => setBookingStep(3)} className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Skip — I'll order at the venue
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

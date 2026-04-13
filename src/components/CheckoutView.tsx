import { motion } from 'framer-motion';
import { useState } from 'react';
import { Tag, X, CheckCircle, PartyPopper, Ticket, ShoppingBag, Truck, Shield } from 'lucide-react';
import { useBookingStore } from '@/stores/bookingStore';
import { useArenaStore } from '@/stores/arenaStore';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutView() {
  const {
    selectedEvent, selectedTier, ticketQuantity, preOrderItems,
    promoCode, promoLabel, getTicketTotal, getPreOrderTotal,
    getDiscountAmount, getGrandTotal, applyPromo, clearPromo, confirmBooking,
  } = useBookingStore();
  const { cart } = useArenaStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const ticketTotal = getTicketTotal();
  const preOrderTotal = getPreOrderTotal();
  const liveCartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const discount = getDiscountAmount();
  const grandTotal = getGrandTotal() + liveCartTotal;

  const handleApplyPromo = () => {
    if (applyPromo(promoInput)) {
      setPromoError(false);
      setPromoInput('');
    } else {
      setPromoError(true);
    }
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      toast({
        title: '🎉 Booking Confirmed!',
        description: `Your tickets for ${selectedEvent?.name} are ready.`,
      });
      setTimeout(() => {
        confirmBooking();
      }, 2500);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-6 glow-cyan"
        >
          <PartyPopper size={40} className="text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-display font-bold text-foreground mb-2"
        >
          Booking Confirmed! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-muted-foreground"
        >
          Your tickets are on the Home dashboard
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-xs text-primary"
        >
          +{Math.floor(grandTotal * 2)} Arena Points earned!
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-2 pb-24">
      {/* Ticket section */}
      {selectedTier && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={14} className="text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Tickets</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{selectedTier.name} × {ticketQuantity}</p>
              <p className="text-xs text-muted-foreground">{selectedEvent?.name}</p>
            </div>
            <p className="text-sm font-bold text-foreground">₹{ticketTotal.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Pre-order section */}
      {preOrderItems.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={14} className="text-accent" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pre-Booked Food & Merch</h3>
          </div>
          <div className="space-y-2">
            {preOrderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.image}</span>
                  <div>
                    <p className="text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 mt-3 pt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">₹{preOrderTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Live in-seat orders */}
      {cart.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck size={14} className="text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live In-Seat Orders</h3>
          </div>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.image}</span>
                  <div>
                    <p className="text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 mt-3 pt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">₹{liveCartTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Promo Code */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={14} className="text-accent" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promo Code</h3>
        </div>
        {promoCode ? (
          <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-primary" />
              <span className="text-sm font-medium text-primary">{promoCode} — {promoLabel}</span>
            </div>
            <button onClick={clearPromo} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value); setPromoError(false); }}
              placeholder="Enter promo code"
              className={`flex-1 px-3 py-2 rounded-lg bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground outline-none border transition-colors ${
                promoError ? 'border-destructive' : 'border-transparent focus:border-primary/30'
              }`}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoInput.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:bg-muted disabled:text-muted-foreground transition-colors"
            >
              Apply
            </button>
          </div>
        )}
        {promoError && <p className="text-xs text-destructive mt-1">Invalid promo code</p>}
        <p className="text-[10px] text-muted-foreground mt-2">Try: ARENA10, FIRST50, GAMEDAY, VIP20</p>
      </div>

      {/* Total summary */}
      <div className="glass-card-elevated p-4 glow-cyan">
        <div className="space-y-2 text-sm">
          {ticketTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tickets</span>
              <span className="text-foreground">₹{ticketTotal.toFixed(2)}</span>
            </div>
          )}
          {preOrderTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pre-Orders</span>
              <span className="text-foreground">₹{preOrderTotal.toFixed(2)}</span>
            </div>
          )}
          {liveCartTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Live Orders</span>
              <span className="text-foreground">₹{liveCartTotal.toFixed(2)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount ({promoLabel})</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border/30 pt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">₹{grandTotal.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-muted-foreground text-right">+{Math.floor(grandTotal * 2)} Arena Points</p>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield size={12} /> Secured by 256-bit encryption
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={isProcessing}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all glow-cyan disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
            Processing...
          </>
        ) : (
          <><CheckCircle size={18} /> Confirm & Pay ₹{grandTotal.toFixed(2)}</>
        )}
      </button>
    </motion.div>
  );
}

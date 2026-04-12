import { motion, AnimatePresence } from 'framer-motion';
import { mockMenu } from '@/data/mockData';
import { useArenaStore } from '@/stores/arenaStore';
import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingBag, Truck, Store, ChevronRight, Clock, Package, ChefHat, MapPin, RotateCcw, CheckCircle2, Search } from 'lucide-react';
import type { MenuItem, Order } from '@/types/arena';
import { useToast } from '@/hooks/use-toast';

const categories = ['food', 'drinks', 'merch'] as const;
const catLabels = { food: '🍔 Food', drinks: '🍺 Drinks', merch: '👕 Merch' };

const orderTabs = ['menu', 'active', 'past'] as const;

const mockPastOrders: (Order & { date: string })[] = [
  { id: 'past-001', items: [{ id: 'm1', name: 'Stadium Burger', description: '', price: 14.99, category: 'food', image: '🍔', quantity: 2, popular: true }, { id: 'm3', name: 'Craft IPA', description: '', price: 12.99, category: 'drinks', image: '🍺', quantity: 2 }], total: 55.96, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-04-05' },
  { id: 'past-002', items: [{ id: 'm4', name: 'Loaded Nachos', description: '', price: 11.99, category: 'food', image: '🧀', quantity: 1 }, { id: 'm7', name: 'Fresh Lemonade', description: '', price: 6.99, category: 'drinks', image: '🍋', quantity: 3 }], total: 32.96, status: 'delivered', deliveryType: 'pickup', estimatedMinutes: 0, date: '2026-04-02' },
  { id: 'past-003', items: [{ id: 'm9', name: 'Team Jersey', description: '', price: 89.99, category: 'merch', image: '👕', quantity: 1 }], total: 89.99, status: 'delivered', deliveryType: 'seat', estimatedMinutes: 0, date: '2026-03-28' },
];

const timelineSteps = [
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'delivering', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

function getStepIndex(status: string) {
  const idx = timelineSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function ETACountdown({ minutes }: { minutes: number }) {
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <span className="text-sm font-bold text-primary font-display tabular-nums">
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

export default function OrderPage() {
  const { cart, orders, addToCart, removeFromCart, updateCartQuantity, placeOrder } = useArenaStore();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('food');
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof orderTabs[number]>('menu');
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = mockMenu.filter((m) => m.category === activeCategory);
  const items = searchQuery
    ? allItems.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems;
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const getCartQty = (id: string) => cart.find((c) => c.id === id)?.quantity || 0;

  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const hasActive = activeOrders.length > 0;

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) addToCart(item);
    });
    toast({ title: '🛒 Added to Cart', description: `${order.items.length} items added from your past order.` });
    setActiveTab('menu');
  };

  const handlePlaceOrder = (type: 'seat' | 'pickup') => {
    placeOrder(type);
    setShowCart(false);
    setActiveTab('active');
    toast({
      title: '✅ Order Placed!',
      description: type === 'seat' ? 'Delivering to your seat. Track it in Active Orders.' : 'Ready for pickup soon. Check Active Orders.',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Express Order</h1>
        <p className="text-sm text-muted-foreground">Delivered to your seat or ready for pickup</p>
      </div>

      {/* Order tabs */}
      <div className="flex gap-1 glass-card p-1 rounded-xl">
        {[
          { id: 'menu' as const, label: 'Menu' },
          { id: 'active' as const, label: 'Active', badge: activeOrders.length },
          { id: 'past' as const, label: 'Past Orders' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl glass-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 bg-transparent"
            />
          </div>

          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-card text-muted-foreground'
                }`}
              >
                {catLabels[cat]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {items.map((item, i) => {
              const qty = getCartQty(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                        {item.popular && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-accent/15 text-accent">Popular</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      <p className="text-sm font-bold text-primary mt-1">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 glass-card rounded-full px-2 py-1">
                          <button onClick={() => updateCartQuantity(item.id, qty - 1)} className="text-muted-foreground hover:text-foreground">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold text-foreground w-4 text-center">{qty}</span>
                          <button onClick={() => addToCart(item)} className="text-primary">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Active Orders Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeOrders.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Package size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No active orders</p>
              <button onClick={() => setActiveTab('menu')} className="mt-3 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                Browse Menu
              </button>
            </div>
          )}
          {activeOrders.map((order) => {
            const stepIdx = getStepIndex(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-elevated p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(-6)}</p>
                    <p className="text-sm font-semibold text-foreground">{order.items.length} items · ₹{order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <ETACountdown minutes={order.estimatedMinutes} />
                  </div>
                </div>

                {/* ETA Banner */}
                <div className="glass-card p-3 flex items-center gap-3 glow-cyan">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Truck size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {order.status === 'preparing' && 'Being prepared by the kitchen'}
                      {order.status === 'ready' && 'Ready for pickup!'}
                      {order.status === 'delivering' && 'On the way to your seat'}
                      {order.status === 'delivered' && 'Delivered!'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.deliveryType === 'seat' ? 'Delivering to Section 108, Row D' : 'Pickup at Concession Stand B'}
                    </p>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="pl-2 space-y-0">
                  {timelineSteps.map((step, i) => {
                    const isComplete = i <= stepIdx;
                    const isCurrent = i === stepIdx;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isCurrent ? 'bg-primary text-primary-foreground glow-cyan' :
                            isComplete ? 'bg-primary/20 text-primary' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            <Icon size={14} />
                          </div>
                          {i < timelineSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${isComplete ? 'bg-primary/40' : 'bg-secondary'}`} />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p className={`text-sm font-medium ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-primary mt-0.5">In progress...</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="border-t border-border/30 pt-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.image}</span>
                      <span className="text-foreground">{item.name}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Past Orders Tab */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {mockPastOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-foreground">Order #{order.id.slice(-3)}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-arena-green/15 text-arena-green flex items-center gap-1">
                  <CheckCircle2 size={10} /> Delivered
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span>{item.image}</span>
                      <span className="text-foreground">{item.name}</span>
                      <span>×{item.quantity}</span>
                    </span>
                    <span className="text-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-sm font-bold text-foreground">₹{order.total.toFixed(2)}</span>
                <button
                  onClick={() => handleReorder(order)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
                >
                  <RotateCcw size={12} /> Reorder
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cart bar */}
      <AnimatePresence>
        {cartCount > 0 && activeTab === 'menu' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto"
          >
            <button
              onClick={() => setShowCart(!showCart)}
              className="w-full glass-card-elevated p-4 flex items-center justify-between glow-cyan"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <ShoppingBag size={16} className="text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cartCount} items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform ${showCart ? 'rotate-90' : ''}`} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 glass-card-elevated rounded-t-2xl p-5 pb-24 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-display font-bold text-foreground mb-4">Your Cart</h2>

              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-xl">{item.image}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">+{Math.floor(cartTotal * 2)} Arena Points earned</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePlaceOrder('seat')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm touch-feedback"
                >
                  <Truck size={16} /> To Seat
                </button>
                <button
                  onClick={() => handlePlaceOrder('pickup')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl glass-card text-foreground font-semibold text-sm border-primary/30 touch-feedback"
                >
                  <Store size={16} /> Pickup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

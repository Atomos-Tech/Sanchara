import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArenaStore } from '@/stores/arenaStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useToast } from '@/hooks/use-toast';
import {
  User, MapPin, CreditCard, Ticket, HelpCircle, ChevronRight, ArrowLeft,
  Shield, Star, Crown, Settings, LogOut, Bell, Moon, Armchair, Plus, Trash2,
  Check, Edit3, Package, RotateCcw, Mail, Phone, Lock, Eye, EyeOff,
  ToggleLeft, ToggleRight, Info, MessageCircle, Camera
} from 'lucide-react';
import type { Order } from '@/types/arena';
import { mockPastOrders } from '@/data/pastOrders';
import {
  type SubPage,
  MAX_PHOTO_SIZE,
  ALLOWED_IMAGE_TYPES,
  sanitize,
  getTier,
  getSubPageTitle,
  getSubPageBack,
} from '@/components/profile/profileUtils';

const tiers = [
  { min: 0, label: 'Bronze', color: 'text-arena-amber', icon: Star },
  { min: 1000, label: 'Silver', color: 'text-muted-foreground', icon: Shield },
  { min: 3000, label: 'Gold', color: 'text-accent', icon: Crown },
  { min: 7000, label: 'Platinum', color: 'text-primary', icon: Crown },
];

// mockPastOrders imported from @/data/pastOrders

const menuItems = [
  { id: 'addresses', label: 'Saved Addresses & Seats', icon: MapPin, desc: 'Default seat numbers & venues', color: 'text-primary' },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard, desc: 'Cards, wallets & rewards', color: 'text-accent' },
  { id: 'tickets', label: 'My Tickets & Bookings', icon: Ticket, desc: 'Upcoming & past events', color: 'text-arena-green' },
  { id: 'pastOrders', label: 'Past Orders', icon: Package, desc: 'Order history & reorder', color: 'text-arena-amber' },
  { id: 'help', label: 'Help Center & Support', icon: HelpCircle, desc: '24/7 venue assistance', color: 'text-destructive' },
];

export default function ProfilePage() {
  const { user, addToCart, updateUserName, setActiveTab } = useArenaStore();
  const { bookedEvents } = useBookingStore();
  const { toast } = useToast();
  const [subPage, setSubPage] = useState<SubPage>(null);
  const tier = getTier(user.arenaPoints, tiers);
  const TierIcon = tier.icon;
  const nextTier = tiers.find((t) => t.min > user.arenaPoints);
  const progress = nextTier ? ((user.arenaPoints - tier.min) / (nextTier.min - tier.min)) * 100 : 100;

  // Edit profile state
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState('alex.johnson@email.com');
  const [editPhone, setEditPhone] = useState('+1 (555) 123-4567');
  const [editSaved, setEditSaved] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Add payment state
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // Addresses state
  const { savedAddresses: addresses, updateAddresses: setAddresses, savedPayments: payments, updatePayments: setPayments } = useArenaStore();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', section: '', row: '', seat: '', venue: '' });

  // Notifications state
  const [notifSettings, setNotifSettings] = useState({
    orderUpdates: true,
    gameAlerts: true,
    promotions: false,
    crowdAlerts: true,
    pointsEarned: true,
    flashSales: false,
  });

  // Settings state — persisted in localStorage for cross-session retention
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('sanchara-dark-mode') !== 'false');
  const [showLogout, setShowLogout] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string | null>(() => localStorage.getItem('sanchara-profile-pic'));

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('sanchara-dark-mode', String(darkMode));
  }, [darkMode]);

  const handleSaveProfile = () => {
    updateUserName(sanitize(editName));
    setEditSaved(true);
    toast({ title: '✅ Profile Updated', description: 'Your changes have been saved.' });
    setTimeout(() => setEditSaved(false), 2000);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Missing fields', description: 'Please fill in all password fields.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'New password and confirmation must match.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    toast({ title: '🔒 Password Changed', description: 'Your password has been updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSubPage('editProfile');
  };

  const handleAddPayment = () => {
    if (!newCardNumber || !newCardExpiry || !newCardCvv || !newCardName) {
      toast({ title: 'Missing fields', description: 'Please fill in all card details.', variant: 'destructive' });
      return;
    }
    const last4 = newCardNumber.replace(/\s/g, '').slice(-4);
    setPayments((prev) => [...prev, {
      id: `p-${Date.now()}`,
      type: 'visa',
      last4,
      expiry: newCardExpiry,
      isDefault: false,
    }]);
    toast({ title: '💳 Card Added', description: `Card ending in ${last4} has been saved.` });
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setNewCardName('');
    setSubPage('payments');
  };

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: '❌ Invalid Format', description: 'Please upload a JPEG, PNG, WebP, or GIF image.', variant: 'destructive' });
      return;
    }

    // Validate file size
    if (file.size > MAX_PHOTO_SIZE) {
      toast({ title: '❌ File Too Large', description: `Max size is ${MAX_PHOTO_SIZE / 1024}KB. Your file is ${Math.round(file.size / 1024)}KB.`, variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePic(base64);
      try {
        localStorage.setItem('sanchara-profile-pic', base64);
      } catch {
        toast({ title: '⚠️ Storage Full', description: 'Could not save photo locally. Try a smaller image.', variant: 'destructive' });
      }
      toast({ title: '📸 Photo Uploaded', description: 'Your profile picture has been saved locally.' });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast({ title: 'Default Updated', description: 'Your default seat has been changed.' });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Removed', description: 'Seat configuration deleted.' });
  };

  const handleAddAddress = () => {
    if (!newAddr.label || !newAddr.section) return;
    setAddresses((prev) => [...prev, { ...newAddr, id: `a-${Date.now()}`, isDefault: false }]);
    setNewAddr({ label: '', section: '', row: '', seat: '', venue: '' });
    setShowAddAddress(false);
    toast({ title: '✅ Seat Added', description: `${newAddr.label} has been saved.` });
  };

  const handleSetDefaultPayment = (id: string) => {
    setPayments((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id ? true : p.type === 'wallet' ? p.isDefault : false })));
    toast({ title: 'Default Updated', description: 'Your default payment method has been changed.' });
  };

  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Removed', description: 'Payment method deleted.' });
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) addToCart(item);
    });
    toast({ title: '🛒 Added to Cart', description: `${order.items.length} items added. Head to Order tab.` });
    setSubPage(null);
    setActiveTab('order');
  };

  const handleContactSupport = () => {
    toast({ title: '💬 Support Chat', description: 'A support agent will be with you shortly. Ticket #SUP-' + Math.floor(Math.random() * 9000 + 1000) });
  };

  /** Wipe all local data and reset state to simulate full account deletion */
  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
    // Clear all persisted data
    localStorage.removeItem('sanchara-arena-storage');
    localStorage.removeItem('sanchara-profile-pic');
    localStorage.removeItem('sanchara-daily-drop-date');
    localStorage.removeItem('sanchara-dark-mode');
    localStorage.removeItem('sanchara-booking-storage');
    toast({ title: '⚠️ Account Deleted', description: 'All data has been removed. Reloading...', variant: 'destructive' });
    setTimeout(() => window.location.reload(), 1500);
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: 'Notification Updated', description: `${key.replace(/([A-Z])/g, ' $1')} has been ${notifSettings[key] ? 'disabled' : 'enabled'}.` });
  };

  const renderSubPageContent = () => {
    switch (subPage) {
      case 'editProfile':
        return (
          <div className="space-y-4">
            <div className="glass-card p-5 text-center">
              <label htmlFor="profile-image-upload" className="sr-only">Upload profile image</label>
              <input id="profile-image-upload" type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="w-20 h-20 rounded-full bg-primary/15 mx-auto mb-3 flex items-center justify-center border-2 border-primary/30 relative overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt={`Profile picture for ${user.name}`} className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-primary" />
                )}
                <button
                  onClick={handlePhotoChange}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <Camera size={12} className="text-primary-foreground" />
                </button>
              </div>
              <button onClick={handlePhotoChange} className="text-xs text-primary font-medium">Tap to change photo</button>
            </div>

            <div className="space-y-3">
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={14} className="text-muted-foreground" />
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone size={14} className="text-muted-foreground" />
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">••••••••••</span>
                  <button onClick={() => setSubPage('changePassword')} className="text-xs text-primary font-semibold">Change</button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {editSaved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-3 flex items-center gap-2 bg-arena-green/10"
                >
                  <Check size={16} className="text-arena-green" />
                  <span className="text-sm text-arena-green font-medium">Profile saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-all"
            >
              Save Changes
            </button>
          </div>
        );

      case 'changePassword':
        return (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Current Password</label>
              <div className="flex items-center gap-2 mt-1">
                <Lock size={14} className="text-muted-foreground" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="text-muted-foreground">
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="glass-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</label>
              <div className="flex items-center gap-2 mt-1">
                <Lock size={14} className="text-muted-foreground" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
                <button onClick={() => setShowNewPw(!showNewPw)} className="text-muted-foreground">
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="glass-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
              <div className="flex items-center gap-2 mt-1">
                <Lock size={14} className="text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            {newPassword && newPassword.length < 8 && (
              <p className="text-xs text-destructive">Password must be at least 8 characters</p>
            )}
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:bg-muted disabled:text-muted-foreground active:scale-[0.98] transition-all"
            >
              Update Password
            </button>
          </div>
        );

      case 'addPayment':
        return (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Card Holder Name</label>
              <input
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Full name on card"
                className="w-full mt-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
            </div>
            <div className="glass-card p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Card Number</label>
              <div className="flex items-center gap-2 mt-1">
                <CreditCard size={14} className="text-muted-foreground" />
                <input
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value.replace(/[^\d\s]/g, '').slice(0, 19))}
                  placeholder="1234 5678 9012 3456"
                  className="flex-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Expiry</label>
                <input
                  value={newCardExpiry}
                  onChange={(e) => setNewCardExpiry(e.target.value.slice(0, 5))}
                  placeholder="MM/YY"
                  className="w-full mt-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
              <div className="glass-card p-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">CVV</label>
                <input
                  value={newCardCvv}
                  onChange={(e) => setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  type="password"
                  className="w-full mt-1 bg-transparent text-sm text-foreground border-b border-border/50 pb-2 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={handleAddPayment}
              disabled={!newCardNumber || !newCardExpiry || !newCardCvv || !newCardName}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:bg-muted disabled:text-muted-foreground active:scale-[0.98] transition-all"
            >
              Add Card
            </button>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="glass-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Armchair size={20} className="text-primary mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{addr.label}</h3>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/15 text-primary">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{addr.venue}</p>
                      <p className="text-xs text-muted-foreground">Section {addr.section} · Row {addr.row} · Seat {addr.seat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)} className="p-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-primary transition-colors" title="Set default">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <AnimatePresence>
              {showAddAddress && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4 space-y-3 overflow-hidden">
                  <h3 className="text-sm font-semibold text-foreground">Add New Seat</h3>
                  {(['label', 'venue', 'section', 'row', 'seat'] as const).map((field) => (
                    <input
                      key={field}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={newAddr[field]}
                      onChange={(e) => setNewAddr((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
                    />
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddAddress(false)} className="flex-1 py-2 rounded-lg glass-card text-sm text-muted-foreground">Cancel</button>
                    <button onClick={handleAddAddress} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Save</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={() => setShowAddAddress(true)} className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors">
              <Plus size={16} /> Add New Seat Configuration
            </button>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-3">
            {payments.map((pay) => (
              <div key={pay.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <CreditCard size={20} className={pay.type === 'wallet' ? 'text-accent' : 'text-primary'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {pay.type === 'wallet' ? pay.label : `${pay.type.charAt(0).toUpperCase() + pay.type.slice(1)} ····${pay.last4}`}
                      </h3>
                      {pay.isDefault && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary/15 text-primary">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pay.type === 'wallet' ? `${user.arenaPoints.toLocaleString()} pts available` : `Expires ${pay.expiry}`}
                    </p>
                  </div>
                  {pay.type !== 'wallet' && (
                    <div className="flex items-center gap-1">
                      {!pay.isDefault && (
                        <button onClick={() => handleSetDefaultPayment(pay.id)} className="p-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-primary transition-colors" title="Set default">
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDeletePayment(pay.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={() => setSubPage('addPayment')}
              className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors"
            >
              <Plus size={16} /> Add Payment Method
            </button>
          </div>
        );

      case 'tickets':
        return (
          <>
            {bookedEvents.length > 0 ? (
              bookedEvents.map((event) => (
                <div key={event.id} className="glass-card p-4 flex items-center gap-3 mb-3">
                  <span className="text-3xl">{event.image}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{event.name}</h3>
                    <p className="text-xs text-muted-foreground">{event.venue} · {event.time}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-arena-green/15 text-arena-green">Confirmed</span>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <Ticket size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No bookings yet</p>
                <p className="text-xs text-muted-foreground mt-1">Explore events and book your first experience!</p>
                <button
                  onClick={() => { setSubPage(null); setActiveTab('explore'); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                >
                  Browse Events
                </button>
              </div>
            )}
          </>
        );

      case 'pastOrders':
        return (
          <div className="space-y-3">
            {mockPastOrders.map((order) => (
              <div key={order.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-sm font-semibold text-foreground">Order #{order.id.slice(-3)}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-arena-green/15 text-arena-green flex items-center gap-1">
                    <Check size={10} /> Delivered
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
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-3">
            {([
              { key: 'orderUpdates' as const, label: 'Order Updates', desc: 'Get notified when your order status changes' },
              { key: 'gameAlerts' as const, label: 'Game Alerts', desc: 'Score updates, timeout notifications, and more' },
              { key: 'crowdAlerts' as const, label: 'Crowd Alerts', desc: 'Real-time crowd density and movement tips' },
              { key: 'pointsEarned' as const, label: 'Points Earned', desc: 'Notifications when you earn Arena Points' },
              { key: 'promotions' as const, label: 'Promotions', desc: 'Exclusive deals and flash sale alerts' },
              { key: 'flashSales' as const, label: 'Flash Sales', desc: 'Limited-time offers at the venue' },
            ]).map((item) => (
              <div key={item.key} className="glass-card p-4 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button onClick={() => toggleNotif(item.key)} className="text-primary">
                  {notifSettings[item.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-muted-foreground" />}
                </button>
              </div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-3">
            <div className="glass-card divide-y divide-border/30">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Moon size={18} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Dark Mode</span>
                </div>
                <button onClick={() => { setDarkMode(!darkMode); toast({ title: !darkMode ? '🌙 Dark Mode' : '☀️ Light Mode', description: `${!darkMode ? 'Dark' : 'Light'} mode activated.` }); }}>
                  {darkMode ? <ToggleRight size={28} className="text-primary" /> : <ToggleLeft size={28} className="text-muted-foreground" />}
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="text-foreground">2.4.1</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Build</span><span className="text-foreground">2026.04.10</span></div>
              </div>
            </div>

            <div className="glass-card divide-y divide-border/30">
              <button onClick={() => setSubPage('privacyPolicy')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                <Lock size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Privacy Policy</span>
                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
              </button>
              <button onClick={() => setSubPage('termsOfService')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                <Info size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Terms of Service</span>
                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Delete Account
            </button>
          </div>
        );

      case 'privacyPolicy':
        return (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Privacy Policy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Last updated: April 10, 2026</p>
            </div>
            {[
              { title: '1. Information We Collect', content: 'We collect information you provide directly, such as your name, email, phone number, and payment details. We also collect usage data including order history, venue preferences, and app interaction patterns.' },
              { title: '2. How We Use Your Data', content: 'Your data is used to provide and improve our services, process orders, personalize your experience, send relevant notifications, and maintain Arena Points loyalty tracking.' },
              { title: '3. Data Sharing', content: 'We do not sell your personal data. We share information only with venue partners for order fulfillment, payment processors for transactions, and as required by law.' },
              { title: '4. Data Security', content: 'We use industry-standard encryption (TLS 1.3) for all data transmission. Payment card data is tokenized and never stored on our servers.' },
              { title: '5. Your Rights', content: 'You may request access to, correction of, or deletion of your personal data at any time through Settings > Delete Account or by contacting support.' },
            ].map((section, i) => (
              <div key={i} className="glass-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-1">{section.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        );

      case 'termsOfService':
        return (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Terms of Service</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Effective: April 10, 2026</p>
            </div>
            {[
              { title: '1. Acceptance of Terms', content: 'By using Arena App, you agree to these terms. If you disagree, please discontinue use of the application.' },
              { title: '2. Account Responsibilities', content: 'You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access.' },
              { title: '3. Orders & Payments', content: 'All orders placed through the app are final once confirmed. Refunds follow venue-specific policies. Arena Points have no cash value and expire after 12 months of inactivity.' },
              { title: '4. Venue Conduct', content: 'Users must comply with all venue rules and regulations. The app facilitates services but venues retain authority over entry, seating, and conduct policies.' },
              { title: '5. Limitation of Liability', content: 'Arena App is provided "as is." We are not liable for venue-related incidents, delays in food delivery, or event cancellations beyond our control.' },
            ].map((section, i) => (
              <div key={i} className="glass-card p-4">
                <h4 className="text-sm font-semibold text-foreground mb-1">{section.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        );

      case 'help':
        return (
          <div className="space-y-3">
            {[
              { q: 'How do I find my seat?', a: 'Use the Live Heatmap on the Map tab to navigate to your section.' },
              { q: 'Can I change my delivery seat?', a: 'Yes! Go to Saved Addresses and update your default seat configuration.' },
              { q: 'How do Arena Points work?', a: 'Earn points by ordering, arriving early, and daily check-ins. Redeem them in the Wallet.' },
              { q: 'Order not arriving?', a: 'Check Active Orders for real-time tracking. Contact support if your ETA has passed.' },
              { q: 'Refund policy', a: 'Full refund for cancellations 24h+ before event. Partial refund within 24h.' },
            ].map((faq, i) => (
              <div key={i} className="glass-card p-4">
                <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
                <p className="text-xs text-muted-foreground mt-1">{faq.a}</p>
              </div>
            ))}
            <button
              onClick={handleContactSupport}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <MessageCircle size={16} /> Contact Live Support
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => getSubPageTitle(subPage);

  const getBack = (): SubPage => getSubPageBack(subPage);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-4">
        {/* Profile Header */}
        <div className="glass-card-elevated p-5 text-center glow-cyan">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-primary/15 mx-auto mb-3 flex items-center justify-center border-2 border-primary/30 overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt={`Profile picture for ${user.name}`} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-primary" />
              )}
            </div>
            <button
              onClick={() => setSubPage('editProfile')}
              className="absolute bottom-2 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
            >
              <Edit3 size={12} className="text-primary-foreground" />
            </button>
          </div>
          <h1 className="text-lg font-display font-bold text-foreground">{user.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <TierIcon size={14} className={tier.color} />
            <span className={`text-sm font-semibold ${tier.color}`}>{tier.label} Member</span>
          </div>
          <div className="mt-3 mx-auto max-w-[200px]">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-primary"
                transition={{ duration: 1 }}
              />
            </div>
            {nextTier && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {nextTier.min - user.arenaPoints} pts to {nextTier.label}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">{user.arenaPoints.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Points</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">{user.level}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Level</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">{user.streak}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSubPage(item.id as SubPage)}
              className="glass-card p-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <item.icon size={22} className={item.color} />
              <h3 className="text-sm font-semibold text-foreground mt-2">{item.label}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Quick Settings */}
        <div className="glass-card divide-y divide-border/30">
          {[
            { icon: Bell, label: 'Notifications', value: 'On', action: () => setSubPage('notifications') },
            { icon: Moon, label: 'Dark Mode', value: 'Always', action: () => setSubPage('settings') },
            { icon: Settings, label: 'App Settings', value: '', action: () => setSubPage('settings') },
            { icon: LogOut, label: 'Sign Out', value: '', danger: true, action: () => setShowLogout(true) },
          ].map((item) => (
            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
              <item.icon size={18} className={item.danger ? 'text-destructive' : 'text-muted-foreground'} />
              <span className={`flex-1 text-sm text-left ${item.danger ? 'text-destructive' : 'text-foreground'}`}>{item.label}</span>
              {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout Confirmation */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated p-6 rounded-2xl max-w-sm w-full text-center space-y-4"
            >
              <LogOut size={32} className="mx-auto text-destructive" />
              <h2 className="text-lg font-display font-bold text-foreground">Sign Out?</h2>
              <p className="text-sm text-muted-foreground">You'll need to sign in again to access your account and Arena Points.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 rounded-xl glass-card text-sm font-semibold text-foreground">Cancel</button>
                <button onClick={() => { setShowLogout(false); localStorage.removeItem('sanchara-arena-storage'); localStorage.removeItem('sanchara-booking-storage'); toast({ title: '👋 Signed Out', description: 'You have been signed out. Reloading...' }); setTimeout(() => window.location.reload(), 1000); }} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-elevated p-6 rounded-2xl max-w-sm w-full text-center space-y-4"
            >
              <Trash2 size={32} className="mx-auto text-destructive" />
              <h2 className="text-lg font-display font-bold text-foreground">Delete Account?</h2>
              <p className="text-sm text-muted-foreground">This action is irreversible. All your data, Arena Points, and order history will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl glass-card text-sm font-semibold text-foreground">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-page Slide Over */}
      <AnimatePresence>
        {subPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setSubPage(getBack())}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md glass-card-elevated overflow-y-auto"
            >
              <div className="sticky top-0 z-10 glass-card-elevated p-4 flex items-center gap-3 border-b border-border/30">
                <button onClick={() => setSubPage(getBack())} className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base font-display font-semibold text-foreground">{getTitle()}</h2>
              </div>
              <div className="p-4">
                {renderSubPageContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

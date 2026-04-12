import { motion } from 'framer-motion';
import { WifiOff, ShieldAlert } from 'lucide-react';

export default function OfflineNotice() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
      >
        <WifiOff size={40} className="text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
      </motion.div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Stadium Connection Lost</h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        You have disconnected from the live Sanchara network. Please reconnect to Cellular or Arena WiFi to resume receiving real-time game updates and tracking your concessions.
      </p>
      
      <div className="glass-card w-full max-w-xs p-4 flex items-center gap-4">
        <ShieldAlert className="text-accent" size={24} />
        <div className="text-left text-sm">
          <p className="font-bold text-foreground">Data Protected</p>
          <p className="text-xs text-muted-foreground">Your wallet and tickets remain securely cached offline.</p>
        </div>
      </div>
    </motion.div>
  );
}

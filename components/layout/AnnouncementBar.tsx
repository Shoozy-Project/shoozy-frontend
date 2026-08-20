'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  '🎉 FREE SHIPPING on orders over $99',
  '🔥 Use code SHOEZY10 for 10% off your first order!',
  '👟 New arrivals dropping every Friday — Shop the drop!',
  '💳 Cash on Delivery available on all orders',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('shoezy_bar_dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  // Cycle through messages every 4 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('shoezy_bar_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="announcement-bar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div
            className="relative flex items-center justify-center px-10 py-2.5"
            style={{
              background: 'linear-gradient(90deg, #FF8C00 0%, #e67e00 50%, #FF8C00 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-bar 4s linear infinite',
            }}
          >
            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs font-semibold tracking-widest uppercase text-white text-center"
              >
                {MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute right-10 hidden sm:flex items-center gap-1.5">
              {MESSAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMsgIndex(i)}
                  aria-label={`Go to message ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === msgIndex ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Dismiss */}
            <button
              id="announcement-bar-dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="absolute right-3 p-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  /** When true, force-shows the splash overlay (used as a global loader). */
  forceShow?: boolean;
}

export default function SplashScreen({ forceShow = false }: SplashScreenProps) {
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    // Only show on hard page load (first visit per session)
    const shown = sessionStorage.getItem('shoezy_splash_shown');
    if (!shown) {
      // This mount-only client initialization mirrors sessionStorage state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFirstVisit(true);
      sessionStorage.setItem('shoezy_splash_shown', '1');
      // Auto-dismiss after 1.8s (only for first-visit mode)
      const timer = setTimeout(() => setFirstVisit(false), 1800);
      return () => clearTimeout(timer);
    } else {
      setFirstVisit(false);
    }
  }, []);

  const show = forceShow || firstVisit;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-primary)' }}
          aria-hidden="true"
          aria-label="Loading Shoozy"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6"
          >
            <Image
              src="/logo.png"
              alt="Shoozy"
              width={200}
              height={120}
              priority
              className="object-contain"
              style={{ height: 'auto' }}
            />
            {/* Subtle loading dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#FF8C00]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

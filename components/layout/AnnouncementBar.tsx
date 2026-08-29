'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { promotionsApi } from '@/lib/api/promotions';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: async () => {
      const res = await promotionsApi.publicAnnouncements();
      return res.data.data;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const announcements = data ?? [];

  useEffect(() => {
    const dismissed = sessionStorage.getItem('shoezy_bar_dismissed');
    if (dismissed === '1') {
      setVisible(false);
    }
  }, []);

  // Cycle through active announcements every 4 seconds
  useEffect(() => {
    if (!visible || announcements.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible, announcements.length]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('shoezy_bar_dismissed', '1');
  };

  if (!visible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[msgIndex % announcements.length];

  return (
    <AnimatePresence>
      {visible && currentAnnouncement && (
        <motion.div
          key="announcement-bar"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div
            className="relative flex items-center justify-center px-10 py-2.5 transition-colors duration-500"
            style={{
              backgroundColor: currentAnnouncement.bgColor || '#FF8C00',
              color: currentAnnouncement.textColor || '#FFFFFF',
            }}
          >
            {/* Message with optional link */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAnnouncement.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs font-semibold tracking-widest uppercase text-center"
              >
                {currentAnnouncement.link ? (
                  <Link
                    href={currentAnnouncement.link}
                    className="hover:underline transition-all"
                  >
                    {currentAnnouncement.message}
                  </Link>
                ) : (
                  <span>{currentAnnouncement.message}</span>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Dot indicators (if multiple announcements) */}
            {announcements.length > 1 && (
              <div className="absolute right-10 hidden sm:flex items-center gap-1.5">
                {announcements.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMsgIndex(i)}
                    aria-label={`Go to announcement ${i + 1}`}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      i === (msgIndex % announcements.length)
                        ? 'bg-current scale-125'
                        : 'opacity-40 bg-current'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Dismiss button */}
            <button
              id="announcement-bar-dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="absolute right-3 p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

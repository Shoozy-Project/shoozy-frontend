'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/hooks/use-translations';

export default function PromoSlider() {
  const { t } = useTranslations();
  return (
    <section className="relative w-full h-[60vh] min-h-[600px] bg-black overflow-hidden flex flex-col items-center justify-center border-t border-b border-foreground/10">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <Image
          src="https://lh3.googleusercontent.com/aida/AP1WRLs0QzMlwBNmM77rMDWG6XDh5LC0XeBivcurCT8I8FZU1Mg9A0NRDc5JDuqEGgt-cj0oKWlqT2fXOsbASl7rzJIs1cA73jokfzYDjuZEfZO-dPXHr0XTXDUZtWlRmOzEDsM08wE2mFn6WqvypHnEPkTO1YBmORDeZlDxT1ibLdIhySbcCeWtwVyuMzcJCXlTX4TCdesvWTpTEHGZWxrH3asHim4T36aCxYe7BEpSEnkIRhjcKBJ3HAxRDbFj"
          alt={t('home.promoAlt')}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-24 text-white"
      >
        <span className="font-sans text-xs tracking-[0.2em] uppercase mb-4 text-white/90">
          {t('home.limited')}
        </span>
        <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-center max-w-2xl mx-auto leading-tight">
          {t('home.promoTitle')}
        </h3>
      </motion.div>

      {/* Slider Controls */}
      <button aria-label={t('home.previousSlide')} className="absolute start-4 md:start-12 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-opacity z-10">
        <ChevronLeft className="w-10 h-10 font-light" strokeWidth={1} />
      </button>
      <button aria-label={t('home.nextSlide')} className="absolute end-4 md:end-12 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-opacity z-10">
        <ChevronRight className="w-10 h-10 font-light" strokeWidth={1} />
      </button>

      {/* Dots */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 flex gap-2 mt-12"
      >
        <button aria-label={t('home.goSlide', { number: 1 })} className="w-2 h-2 rounded-full bg-white"></button>
        <button aria-label={t('home.goSlide', { number: 2 })} className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/60 transition-colors"></button>
        <button aria-label={t('home.goSlide', { number: 3 })} className="w-2 h-2 rounded-full bg-white/30 hover:bg-white/60 transition-colors"></button>
      </motion.div>
    </section>
  );
}

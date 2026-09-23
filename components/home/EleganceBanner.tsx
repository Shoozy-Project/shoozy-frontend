'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EleganceBanner() {
  return (
    <section className="w-full h-[600px] md:h-[800px] relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://lh3.googleusercontent.com/aida/AP1WRLsRSFkl6Py0qFGGJUyn_uVayXLJ0FWTk8uYGxiaSSXuhoWs0PFennwXNpKXRMFDMTRiTzVZ27rNed-py8gxiQL8hT0noXXWZiYxcP99sb-oNwtx0S3QGvYcojEGGjtAJKsIxPjV_uZKT2dQLp0YkWCAq4RxV6o3yXJwc0_w_IFZXpfA-TGt7jwR4dCUxOsVq2qexxO-UL30NIf6WRyFKHPPkTmx8CbYqjjlV_LKPnO9uib1_5eBvpDuCUQ"
          alt="Polished black dress shoes on Parisian cobblestones"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto text-white"
      >
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Step Into Timeless Elegance
        </h2>
        <p className="font-sans text-lg md:text-xl text-white/90 mb-10 max-w-xl mx-auto">
          Discover craftsmanship that defines your journey.
        </p>
        <Link 
          href="/products" 
          className="inline-block bg-white text-black font-sans text-sm px-8 py-4 uppercase tracking-widest hover:bg-white/90 transition-colors border border-white"
        >
          Make an order now
        </Link>
      </motion.div>
    </section>
  );
}

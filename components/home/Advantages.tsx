'use client';

import Link from 'next/link';
import { Package, RefreshCcw, Phone } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function Advantages() {
  const advantages = [
    {
      icon: <Package className="w-10 h-10 mb-6 text-foreground" strokeWidth={1} />,
      title: 'Free express delivery',
      description: 'for all orders over 200 TND',
      linkText: 'Learn more',
      linkUrl: '/shipping',
    },
    {
      icon: <RefreshCcw className="w-10 h-10 mb-6 text-foreground" strokeWidth={1} />,
      title: 'Returns offered',
      description: 'easy and free returns on all orders',
      linkText: 'Learn more',
      linkUrl: '/returns',
    },
    {
      icon: <Phone className="w-10 h-10 mb-6 text-foreground" strokeWidth={1} />,
      title: 'Need help?',
      description: 'Contact our client service at +216 71 234 567',
      linkText: 'Learn more',
      linkUrl: '/contact',
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-background py-24 px-4 sm:px-6 lg:px-8 border-t border-border/30">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-serif text-2xl text-foreground mb-16 text-center"
        >
          E-store advantages
        </motion.h3>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full text-center"
        >
          {advantages.map((adv, index) => (
            <motion.div variants={itemVariants} key={index} className="flex flex-col items-center gap-2">
              {adv.icon}
              <h4 className="font-sans font-semibold tracking-wider uppercase text-foreground mb-1">
                {adv.title}
              </h4>
              <p className="font-sans text-foreground/60 mb-6">
                {adv.description}
              </p>
              <Link 
                href={adv.linkUrl} 
                className="font-sans text-xs tracking-widest text-foreground/80 uppercase border-b border-foreground/30 hover:border-foreground hover:text-foreground transition-colors pb-1"
              >
                {adv.linkText}
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePublicProducts } from '@/lib/hooks/use-promotions';
import { motion, Variants } from 'framer-motion';

export default function OurSelection() {
  const { data: products, isLoading, isError } = usePublicProducts();
  const [activeTab, setActiveTab] = useState('Woman');

  // Fallback while loading
  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-pulse">
          <div className="h-8 bg-foreground/10 w-48 mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-foreground/5"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !products || products.length === 0) {
    return null; // Return empty or a fallback if required
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl mb-8 text-foreground">Our selection</h2>
          <div className="flex justify-center items-center space-x-4 md:space-x-8 mb-16 font-sans text-sm text-foreground/60">
            <button 
              onClick={() => setActiveTab('Man')}
              className={`pb-1 transition-colors ${activeTab === 'Man' ? 'text-foreground border-b border-foreground' : 'hover:text-foreground'}`}
            >
              Man
            </button>
            <span className="text-foreground/20">·</span>
            <button 
              onClick={() => setActiveTab('Woman')}
              className={`pb-1 transition-colors ${activeTab === 'Woman' ? 'text-foreground border-b border-foreground' : 'hover:text-foreground'}`}
            >
              Woman
            </button>
            <span className="text-foreground/20">·</span>
            <button 
              onClick={() => setActiveTab('Accessories')}
              className={`pb-1 transition-colors ${activeTab === 'Accessories' ? 'text-foreground border-b border-foreground' : 'hover:text-foreground'}`}
            >
              Accessories
            </button>
          </div>
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <motion.div variants={itemVariants} key={product.id}>
              <Link href={`/product/${product.id}`} className="group cursor-pointer flex flex-col h-full">
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-[#F5F5F5] mb-6 overflow-hidden flex items-center justify-center">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 p-6"
                  />
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-xs text-blue-400/80 tracking-wide">{product.category}</span>
                  <div className="flex justify-between items-center w-full">
                    <h4 className="font-serif font-bold text-foreground text-lg">{product.name}</h4>
                    {product.colors && (
                      <span className="text-[10px] text-foreground/50">{product.colors}</span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-foreground/60 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="font-sans text-sm font-bold pt-1 text-foreground mt-auto">
                    {(product.priceMinor / 1000).toFixed(2)} TND
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';

export default function BrandStory() {
  return (
    <section className="w-full bg-background py-32 md:py-48 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
        
        {/* Left: Vertical Text */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-[30%] flex justify-start items-center"
        >
          <h3 
            className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground uppercase tracking-[0.2em] md:rotate-180"
            style={{ writingMode: 'vertical-rl' }}
          >
            L&apos;ARTISANAT
          </h3>
        </motion.div>

        {/* Divider */}
        <motion.div 
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="hidden md:block w-px bg-foreground mx-8 lg:mx-16 flex-shrink-0 origin-top"
        ></motion.div>

        {/* Right: Paragraph */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full md:w-[70%] flex items-center mt-12 md:mt-0 pt-12 md:pt-0 border-t md:border-t-0 border-foreground"
        >
          <p className="font-sans text-xl md:text-3xl text-foreground leading-relaxed font-light">
            Crafted with passion since the beginning. Every stitch and every cut of our premium calfskin is performed by master artisans, ensuring a timeless silhouette and unparalleled comfort.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

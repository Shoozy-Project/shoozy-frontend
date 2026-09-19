import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PromoSlider() {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full opacity-60">
        <Image
          src="https://lh3.googleusercontent.com/aida/AP1WRLs0QzMlwBNmM77rMDWG6XDh5LC0XeBivcurCT8I8FZU1Mg9A0NRDc5JDuqEGgt-cj0oKWlqT2fXOsbASl7rzJIs1cA73jokfzYDjuZEfZO-dPXHr0XTXDUZtWlRmOzEDsM08wE2mFn6WqvypHnEPkTO1YBmORDeZlDxT1ibLdIhySbcCeWtwVyuMzcJCXlTX4TCdesvWTpTEHGZWxrH3asHim4T36aCxYe7BEpSEnkIRhjcKBJ3HAxRDbFj"
          alt="Exclusive Summer Privilege"
          fill
          className="object-cover"
        />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xs tracking-[0.2em] uppercase mb-4 border border-white/20 px-4 py-1">
          Limited Time
        </span>
        <h2 className="font-serif text-4xl md:text-5xl text-center max-w-2xl leading-tight">
          Exclusive Summer <br /> Privilege
        </h2>
      </div>

      {/* Slider Controls */}
      <button aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors">
        <ChevronLeft className="w-8 h-8" strokeWidth={1} />
      </button>
      <button aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors">
        <ChevronRight className="w-8 h-8" strokeWidth={1} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
      </div>
    </section>
  );
}

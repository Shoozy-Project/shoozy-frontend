import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--surface-primary)] transition-colors duration-300">
      <div className="text-center px-6 py-24">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#FF8C00] mb-6">
          Quality Shoes. Every Step.
        </p>
        <h1
          className="text-5xl lg:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Discover Your
          <br />
          Perfect Pair
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-md mx-auto mb-10 leading-relaxed">
          Premium footwear crafted for those who appreciate quality in every step.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-10 py-4 text-xs font-semibold tracking-widest uppercase bg-[var(--text-primary)] text-[var(--surface-primary)] hover:opacity-90 transition-all duration-200"
          >
            Shop Now
          </Link>
          <Link
            href="/new-arrivals"
            className="inline-flex items-center justify-center px-10 py-4 text-xs font-semibold tracking-widest uppercase border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--surface-primary)] transition-colors duration-200"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </div>
  );
}

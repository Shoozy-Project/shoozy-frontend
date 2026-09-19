import Link from 'next/link';
import { Search, User, ShoppingBag } from 'lucide-react';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
      {/* Top Row (Brand & Utilities) */}
      <div className="flex justify-between items-center px-6 md:px-12 py-4">
        
        {/* Left: Search */}
        <div className="flex-1 flex justify-start">
          <button aria-label="Search" className="text-white hover:text-white/80 transition-colors">
            <Search className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>

        {/* Center: Brand */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <Link href="/" className="font-serif text-3xl md:text-4xl font-medium tracking-wide text-white drop-shadow-md">
            SHOEZY
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
          <Link href="/login" aria-label="User Account" className="text-white hover:text-white/80 transition-colors">
            <User className="w-5 h-5 text-white" strokeWidth={1.5} />
          </Link>
          <Link href="/cart" aria-label="Shopping Bag" className="text-white hover:text-white/80 transition-colors relative">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Bottom Row (Navigation Links) */}
      <nav className="hidden md:flex justify-center items-center gap-8 pb-4">
        <Link href="/men" className="text-xs md:text-sm uppercase tracking-widest text-white/90 hover:text-white transition-colors font-medium">
          Men
        </Link>
        <Link href="/women" className="text-xs md:text-sm uppercase tracking-widest text-white/90 hover:text-white transition-colors font-medium">
          Women
        </Link>
        <Link href="/new-arrivals" className="text-xs md:text-sm uppercase tracking-widest text-white/90 hover:text-white transition-colors font-medium">
          New Arrivals
        </Link>
        <Link href="/exclusives" className="text-xs md:text-sm uppercase tracking-widest text-white/90 hover:text-white transition-colors font-medium">
          Exclusives
        </Link>
        <Link href="/house" className="text-xs md:text-sm uppercase tracking-widest text-white/90 hover:text-white transition-colors font-medium">
          The House
        </Link>
      </nav>
    </header>
  );
}

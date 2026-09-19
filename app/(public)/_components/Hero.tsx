import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA48StYLsUc7nxVJ3xg8gOGChnT_WEZZxpsLiaScpXHruo53dksZYnoxSqGeBRIZcEIIr5M_iqcaFEQR5-rVqUewhLEoq1zUvy-0Lwlifs7A_jTe4TDdvexLzhn73O9HlktR78lFUS9xEGHBjDZZBHsVUIrNyl8fB0GYt0GWMe7Drb025kHh32kawKLHf7XGpiZzLXWxYlIQ6OyomXEirnrrA4PTqcLQ8avAujYm4IKFSp6-fl96TSHSw"
          alt="Premium Leather Loafers"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Subtle gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-4xl md:text-6xl text-foreground mb-8 max-w-3xl leading-tight">
          A Summer by Shoezy
        </h2>
        <Link 
          href="/collections" 
          className="bg-foreground text-background px-8 py-4 text-sm tracking-widest uppercase hover:bg-foreground/80 transition-colors border border-foreground"
        >
          Discover
        </Link>
      </div>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';

export default function EleganceBanner() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://lh3.googleusercontent.com/aida/AP1WRLsRSFkl6Py0qFGGJUyn_uVayXLJ0FWTk8uYGxiaSSXuhoWs0PFennwXNpKXRMFDMTRiTzVZ27rNed-py8gxiQL8hT0noXXWZiYxcP99sb-oNwtx0S3QGvYcojEGGjtAJKsIxPjV_uZKT2dQLp0YkWCAq4RxV6o3yXJwc0_w_IFZXpfA-TGt7jwR4dCUxOsVq2qexxO-UL30NIf6WRyFKHPPkTmx8CbYqjjlV_LKPnO9uib1_5eBvpDuCUQ"
          alt="Step Into Timeless Elegance"
          fill
          className="object-cover object-bottom"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
          Step Into Timeless Elegance
        </h2>
        <p className="font-sans text-sm md:text-base text-white/80 mb-8 max-w-lg">
          Discover craftsmanship that defines your journey
        </p>
        <Link 
          href="/checkout" 
          className="bg-white text-black px-8 py-3 text-xs md:text-sm tracking-widest uppercase hover:bg-white/90 transition-colors"
        >
          Make an order now
        </Link>
      </div>
    </section>
  );
}

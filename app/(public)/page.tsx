import HeroCarousel from '@/components/home/HeroCarousel';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-primary)]">
      {/* Dynamic Hero Slider */}
      <HeroCarousel />
    </div>
  );
}

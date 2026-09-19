import HeroCarousel from '@/components/home/HeroCarousel';
import OurSelection from '@/components/home/OurSelection';
import PromoSlider from '@/components/home/PromoSlider';
import BrandStory from '@/components/home/BrandStory';
import EleganceBanner from '@/components/home/EleganceBanner';
import Advantages from '@/components/home/Advantages';

export default function Homepage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <HeroCarousel />
      <OurSelection />
      <PromoSlider />
      <BrandStory />
      <EleganceBanner />
      <Advantages />
    </div>
  );
}

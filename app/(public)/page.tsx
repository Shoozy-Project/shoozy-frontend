import HeroCarousel from '@/components/home/HeroCarousel';
import OurSelectionCarousel from '@/components/storefront/home/OurSelectionCarousel';
import PromoSlider from '@/components/home/PromoSlider';
import CollectionsCarousel from '@/components/storefront/home/CollectionsCarousel';
import BrandStory from '@/components/home/BrandStory';
import EleganceBanner from '@/components/home/EleganceBanner';
import Advantages from '@/components/home/Advantages';

export default function Homepage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <HeroCarousel />
      <OurSelectionCarousel />
      <PromoSlider />
      
      <BrandStory />
      <CollectionsCarousel />
      <EleganceBanner />
      <Advantages />
    </div>
  );
}

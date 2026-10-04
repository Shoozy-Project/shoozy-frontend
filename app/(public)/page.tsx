import HeroCarousel from '@/components/home/HeroCarousel';
import OurSelectionCarousel from '@/components/storefront/home/OurSelectionCarousel';
import PromoSlider from '@/components/home/PromoSlider';
import CollectionsCarousel from '@/components/storefront/home/CollectionsCarousel';
import Advantages from '@/components/home/Advantages';
import BrandsTicker from '@/components/storefront/home/BrandsTicker';

export default function Homepage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <HeroCarousel />
      <OurSelectionCarousel />
      <CollectionsCarousel />
      <PromoSlider />
      <BrandsTicker />
      <Advantages />
    </div>
  );
}

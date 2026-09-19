import Link from 'next/link';
import { Package, RefreshCcw, Phone } from 'lucide-react';

export default function Advantages() {
  const advantages = [
    {
      icon: <Package className="w-6 h-6 mb-4 text-foreground" strokeWidth={1.5} />,
      title: 'Free express delivery',
      description: 'for all orders over 200 TND',
      linkText: 'Learn more',
      linkUrl: '/shipping',
    },
    {
      icon: <RefreshCcw className="w-6 h-6 mb-4 text-foreground" strokeWidth={1.5} />,
      title: 'Returns offered',
      description: 'easy and free returns on all orders',
      linkText: 'Learn more',
      linkUrl: '/returns',
    },
    {
      icon: <Phone className="w-6 h-6 mb-4 text-foreground" strokeWidth={1.5} />,
      title: 'Need help?',
      description: 'Contact our client service at +216 71 234 567',
      linkText: 'Learn more',
      linkUrl: '/contact',
    },
  ];

  return (
    <section className="py-24 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-2xl text-foreground">E-store advantages</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {advantages.map((adv, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {adv.icon}
              <h3 className="font-sans text-sm font-semibold tracking-wider uppercase text-foreground mb-2">
                {adv.title}
              </h3>
              <p className="font-sans text-sm text-foreground/60 mb-6">
                {adv.description}
              </p>
              <Link 
                href={adv.linkUrl} 
                className="text-xs tracking-widest text-foreground/80 uppercase border-b border-foreground/30 hover:border-foreground hover:text-foreground transition-colors pb-1"
              >
                {adv.linkText}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

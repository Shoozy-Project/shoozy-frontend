'use client';

import Link from 'next/link';
import Image from 'next/image';

const shopLinks = [
  { label: 'Men', href: '/men' },
  { label: 'Women', href: '/women' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale' },
];

const helpLinks = [
  { label: 'FAQs', href: '/faqs' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Track My Order', href: '/orders' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'Contact Us', href: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Footer Content ── */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="relative w-[170px] h-[52px]">
                <Image
                  src="/logo.png"
                  alt="Shoezy"
                  fill
                  sizes="170px"
                  className="object-contain  invert opacity-90"
                />
              </div>
            </Link>
            <p className="text-sm text-[#9ca3af] leading-relaxed max-w-xs">
              Premium footwear crafted for those who appreciate quality in every step. Every pair tells a story.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Shoezy on Instagram" className="p-2 rounded-full border border-[#374151] text-[#9ca3af] hover:text-white hover:border-white transition-colors duration-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Shoezy on Facebook" className="p-2 rounded-full border border-[#374151] text-[#9ca3af] hover:text-white hover:border-white transition-colors duration-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Shoezy on X (Twitter)" className="p-2 rounded-full border border-[#374151] text-[#9ca3af] hover:text-white hover:border-white transition-colors duration-200">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[#9ca3af] mb-6">
              Shop
            </h3>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#d1d5db] hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[#9ca3af] mb-6">
              Help
            </h3>
            <ul className="flex flex-col gap-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#d1d5db] hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[#9ca3af] mb-6">
              Stay Connected
            </h3>
            <p className="text-sm text-[#9ca3af] mb-4 leading-relaxed">
              Subscribe for exclusive drops, style guides, and member-only offers.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 text-sm bg-[#111111] border border-[#374151] text-white placeholder-[#6b7280] rounded-sm focus:outline-none focus:border-[#FF8C00] transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold tracking-widest uppercase bg-[#FF8C00] text-white hover:bg-[#e67e00] transition-colors duration-200"
              >
                Subscribe
              </button>
            </form>
            {/* COD Badge */}
            <div className="mt-6 flex items-start gap-3 p-3 border border-[#374151] rounded-sm">
              <span className="text-[#FF8C00] text-lg leading-none">د.ت</span>
              <div>
                <p className="text-xs font-semibold text-white">Cash on Delivery</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">Only payment method accepted</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-[#1f2937] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6b7280]">
            © {new Date().getFullYear()} Shoezy. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-4 justify-center" aria-label="Legal navigation">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

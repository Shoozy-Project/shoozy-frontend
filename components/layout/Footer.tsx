import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo / Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-serif text-2xl tracking-widest text-white">
              SHOEZY
            </Link>
          </div>

          {/* Links 1 */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-sm text-white/70 hover:text-white transition-colors">
                  Need help?
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                  About Shoezy
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-white/70 hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Rules - Cash on Delivery */}
          <div className="col-span-1">
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-white/90">Payment</h4>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              For your convenience and security, we exclusively offer <strong className="text-white">Cash on Delivery (COD)</strong> for all orders.
            </p>
            <div className="inline-block border border-white/20 px-4 py-2 text-xs tracking-widest uppercase">
              Cash on Delivery ONLY
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 tracking-wider">
          <p>&copy; {new Date().getFullYear()} SHOEZY. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

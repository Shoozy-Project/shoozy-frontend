import Link from 'next/link';
import { CommerceImage } from '@/components/commerce/CommerceImage';
import { WishlistButton } from '@/components/commerce/WishlistButton';
import { formatMinorMoney } from '@/lib/format-money';
import type { CatalogProductDto } from '@/types/commerce';

export function ProductCard({ product }: { product: CatalogProductDto }) {
  return (
    <article className="group relative flex min-w-0 flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="absolute inset-0" aria-label={`View ${product.name}`}>
          <CommerceImage
            src={product.primaryMedia?.url}
            alt={product.primaryMedia?.altText || product.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <WishlistButton productId={product.id} className="absolute right-3 top-3 z-10" />
        {!product.inStock && (
          <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 text-xs font-medium uppercase tracking-wide">Out of stock</span>
        )}
      </div>
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col gap-1 pt-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand.name}</span>
        <h2 className="font-serif text-lg leading-tight transition-colors group-hover:text-foreground/70">{product.name}</h2>
        {product.shortDescription && <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>}
        <p className="mt-2 text-sm font-semibold">
          {product.minimumVariantPriceMinor ? formatMinorMoney(product.minimumVariantPriceMinor, 'TND', 3) : 'Price unavailable'}
        </p>
      </Link>
    </article>
  );
}

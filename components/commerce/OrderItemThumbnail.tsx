import { CommerceImage } from '@/components/commerce/CommerceImage';
import { cn } from '@/lib/utils';

export function OrderItemThumbnail({ imageUrl, productName, className }: { imageUrl: string | null; productName: string; className?: string }) {
  return (
    <div className={cn('relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted', className)}>
      <CommerceImage src={imageUrl} alt={productName} sizes="64px" className="object-cover" />
    </div>
  );
}


'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { commerceErrorMessage } from '@/lib/api/errors';
import { useWishlist, useWishlistMutation } from '@/lib/hooks/use-commerce';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  className?: string;
  compact?: boolean;
}

export function WishlistButton({ productId, variantId, className, compact = true }: WishlistButtonProps) {
  const authenticated = useAuthStore(selectIsAuthenticated);
  const initialized = useAuthStore((state) => state.isInitialized);
  const wishlist = useWishlist();
  const mutation = useWishlistMutation();
  const item = wishlist.data?.find((entry) => entry.productId === productId && (!variantId || entry.variantId === variantId || entry.variantId === null));

  const toggle = () => {
    if (!authenticated) {
      toast.info('Sign in to save items to your wishlist.');
      return;
    }
    mutation.mutate(
      { productId, variantId, wishlistItemId: item?.id },
      {
        onSuccess: () => toast.success(item ? 'Removed from wishlist.' : 'Saved to wishlist.'),
        onError: (error) => toast.error(commerceErrorMessage(error, 'Wishlist could not be updated.')),
      },
    );
  };

  return (
    <Button
      type="button"
      variant={compact ? 'secondary' : 'outline'}
      size={compact ? 'icon' : 'default'}
      className={cn(compact && 'rounded-full bg-background/90 shadow-sm hover:bg-background', className)}
      onClick={toggle}
      disabled={!initialized || mutation.isPending}
      aria-label={item ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={Boolean(item)}
    >
      <Heart className={cn('size-4', item && 'fill-current text-red-600 dark:text-red-400')} aria-hidden="true" />
      {!compact && <span>{item ? 'Saved' : 'Save to wishlist'}</span>}
    </Button>
  );
}

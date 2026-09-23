import type { PaginatedData } from '@/types/api';

export interface CatalogMediaDto {
  id: string;
  type: string;
  url: string;
  altText: string | null;
  position?: number;
  isPrimary?: boolean;
  variantId?: string | null;
}

export interface CatalogEntityDto {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogCategoryDto extends CatalogEntityDto {
  parentId: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  children?: CatalogCategoryDto[];
}

export interface CatalogBrandDto extends CatalogEntityDto {
  description: string | null;
  logoUrl: string | null;
}

export interface CatalogCollectionDto extends CatalogEntityDto {
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogProductDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: string;
  compareAtPrice: string | null;
  minimumVariantPriceMinor: string | null;
  inStock: boolean;
  gender: string | null;
  season: string | null;
  publishedAt: string | null;
  brand: CatalogEntityDto;
  categories: Array<CatalogEntityDto & { isPrimary: boolean }>;
  primaryMedia: CatalogMediaDto | null;
}

export interface CatalogOptionValueDto {
  id: string;
  value: string;
  displayValue: string | null;
  colorHex: string | null;
  position?: number;
  optionId?: string;
}

export interface CatalogOptionDto {
  id: string;
  name: string;
  position: number;
  values: CatalogOptionValueDto[];
}

export interface CatalogVariantDto {
  id: string;
  sku: string | null;
  title: string;
  stockQuantity: number;
  weightGrams: number | null;
  priceMinor: string;
  compareAtPriceMinor: string | null;
  optionValues: CatalogOptionValueDto[];
}

export interface CatalogProductDetailDto extends Omit<CatalogProductDto, 'minimumVariantPriceMinor' | 'inStock' | 'primaryMedia'> {
  description: string | null;
  material: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  media: CatalogMediaDto[];
  options: CatalogOptionDto[];
  variants: CatalogVariantDto[];
  sizeGuide: { id: string; name: string; gender: string | null } | null;
  collections: CatalogEntityDto[];
}

export interface CatalogCollectionDetailDto extends CatalogCollectionDto {
  products: PaginatedData<CatalogProductDto>;
}

export interface SizeGuideDto {
  id: string;
  name: string;
  gender: string | null;
  notes: string | null;
  brand: (CatalogEntityDto & { isActive: boolean }) | null;
  entries: Array<{
    id: string;
    euSize: string | null;
    usSize: string | null;
    ukSize: string | null;
    footLengthCm: string | null;
    sortOrder: number;
  }>;
  entryPagination: PaginatedData<never>['pagination'];
}

export type CatalogSort = 'newest' | 'nameAsc' | 'nameDesc' | 'basePriceAsc' | 'basePriceDesc';

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  collection?: string;
  gender?: string;
  season?: string;
  size?: string;
  color?: string;
  minPriceMinor?: string;
  maxPriceMinor?: string;
  inStock?: boolean;
  sort?: CatalogSort;
}

export interface CartOptionDto {
  option: { id: string; name: string };
  value: { id: string; value: string; displayValue: string | null; colorHex: string | null };
}

export interface CartItemDto {
  id: string;
  quantity: number;
  available: boolean;
  product: { id: string; name: string; slug: string; brand: CatalogEntityDto };
  variant: { id: string; sku: string | null; title: string; stockQuantity: number; options: CartOptionDto[] };
  media: CatalogMediaDto | null;
  unitOriginalPriceMinor: string;
  unitPriceMinor: string;
  lineOriginalTotalMinor: string;
  discountMinor: string;
  lineTotalMinor: string;
}

export interface CartDto {
  id: string | null;
  status: 'ACTIVE' | string;
  currency: string;
  discountCode: string | null;
  items: CartItemDto[];
  appliedDiscounts?: Array<{ discountId: string; name: string; priority: number; amountMinor: string }>;
  checkoutEligible: boolean;
  issues: string[];
  totals: { subtotalMinor: string; merchandiseDiscountMinor: string; estimatedTotalMinor: string };
  priceNotice?: string;
  stockNotice?: string;
  updatedAt?: string;
}

export interface WishlistItemDto {
  id: string;
  productId: string;
  variantId: string | null;
  addedAt: string;
  available: boolean;
  product: null | {
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    basePrice: string;
    compareAtPrice: string | null;
    brand: CatalogEntityDto;
    primaryMedia: CatalogMediaDto | null;
  };
  variant: null | {
    id: string;
    title: string;
    sku: string | null;
    priceMinor: string;
    compareAtPriceMinor: string | null;
    stockQuantity: number;
  };
}

export interface AddressDto {
  id: string;
  type: 'BOTH';
  label: string | null;
  recipientName: string;
  phone: string;
  countryCode: string;
  state: string | null;
  city: string;
  area: string | null;
  postalCode: string | null;
  line1: string;
  line2: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AddressInput = Omit<AddressDto, 'id' | 'type' | 'createdAt' | 'updatedAt' | 'latitude' | 'longitude'> & {
  latitude?: string | null;
  longitude?: string | null;
};

export interface ShippingMethodDto {
  id: string;
  code: string;
  name: string;
  basePriceMinor: string;
  currency: string;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
}

export interface GuestCheckoutInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  area?: string | null;
  postalCode?: string | null;
  countryCode: 'TN';
  shippingMethodId: string;
}

export interface CheckoutPreviewDto {
  address: Omit<AddressDto, 'type' | 'label' | 'isDefault' | 'createdAt' | 'updatedAt'>;
  shippingMethod: ShippingMethodDto;
  shippingZone: { code: string; name: string } | null;
  currency: string;
  discountCode: string | null;
  items: CartItemDto[];
  appliedDiscounts: Array<{ discountId: string; name: string; priority: number; amountMinor: string }>;
  totals: {
    itemsSubtotalMinor: string;
    merchandiseDiscountMinor: string;
    shippingMinor: string;
    shippingDiscountMinor: string;
    totalDiscountMinor: string;
    grandTotalMinor: string;
  };
  advisory: true;
  notice: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export interface OrderTotalsDto {
  currency: string;
  subtotalMinor: string;
  discountMinor: string;
  shippingMinor: string;
  totalMinor: string;
  paidMinor: string;
  refundedMinor: string;
}

export interface OrderListDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: 'COD';
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  itemCount: number;
  totals: OrderTotalsDto;
  placedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailDto extends Omit<OrderListDto, 'itemCount'> {
  customerEmail: string | null;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  paidAt: string | null;
  notes: string | null;
  trackingNumber: string | null;
  shippingProvider: string | null;
  shippingMethod: { code: string; name: string } | null;
  shippingZone: { code: string; name: string } | null;
  address: null | {
    recipientName: string;
    phone: string;
    countryCode: string;
    state: string | null;
    city: string;
    area: string | null;
    line1: string;
    line2: string | null;
    postalCode: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    sku: string | null;
    quantity: number;
    unitPriceMinor: string;
    discountMinor: string;
    lineTotalMinor: string;
    snapshotJson: unknown;
  }>;
  discounts: Array<{ discountId: string; name: string; code: string | null; amountMinor: string; redeemedAt: string }>;
  statusHistory: Array<{ id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; createdAt: string }>;
}

export interface PlaceOrderResultDto {
  order: OrderDetailDto;
  idempotentReplay: boolean;
  whatsappConfirmation: { enabled: boolean; url: string | null };
  guestAccessToken?: string | null;
}

export interface ProfileDto {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  status: string;
  provider: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnDto {
  id: string;
  returnNumber: string;
  orderId: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED_AND_REFUNDED';
  reasonCode: string;
  reasonDetails: string | null;
  refundMethod: string | null;
  refundAmountMinor: string;
  refundProofUrl: string | null;
  requestedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: { orderNumber: string; status: OrderStatus; paymentMethod: 'COD'; paymentStatus: string; currency: string };
  items: Array<{
    id: string;
    orderItemId: string;
    quantity: number;
    reasonCode: string | null;
    restockable: boolean;
    orderItem: { productName: string; variantName: string; sku: string | null; unitPriceMinor: string; discountMinor: string; lineTotalMinor: string };
  }>;
  refundNotice: string | null;
}

export interface ExchangeDto {
  id: string;
  exchangeNumber: string;
  orderId: string;
  userId: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  reason: string | null;
  requestedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: { orderNumber: string; status: OrderStatus; currency: string };
  item: null | {
    id: string;
    orderItemId: string;
    replacementVariantId: string;
    quantity: number;
    original: { productName: string; variantName: string; sku: string | null; unitPriceMinor: string };
    replacement: { title: string; sku: string | null; priceMinor: string };
  };
}

export interface PublicStoreSettingsDto {
  storeName: string;
  countryCode: string;
  currency: string;
  currencyMinorUnit: number;
  whatsappNumber: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  shippingPolicy: string | null;
  returnWindowDays: number;
  exchangeWindowDays: number;
  whatsappConfirmationEnabled: boolean;
}

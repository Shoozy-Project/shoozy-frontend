'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, AlertTriangle, ShoppingBag, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { productsApi, type ProductListDto } from '@/lib/api/products';

interface ProductPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductListDto;
}

export default function ProductPreviewModal({
  open,
  onOpenChange,
  product,
}: ProductPreviewModalProps) {
  // Fetch complete product details dynamically via React Query
  const { data: fullProductData, isLoading, isError } = useQuery({
    queryKey: ['product-detail', product.id],
    queryFn: () => productsApi.get(product.id).then((res) => res.data.data),
    enabled: open && !!product.id,
    staleTime: 60 * 1000,
  });

  const p = fullProductData;

  // Image Gallery state
  const mediaList = p?.media ?? [];

  const [selectedImage, setSelectedImage] = useState<string>('');
  const activeImage = selectedImage || mediaList[0]?.url || '';

  // Variant selections
  const variants = p?.variants || [];
  const [selectedSize, setSelectedSize] = useState<string>('42');
  const [selectedColor, setSelectedColor] = useState<string>('Black');

  // Calculate pricing & discount
  const basePriceNum = Number(p?.basePrice) || 0;
  const comparePriceNum = p?.compareAtPrice ? Number(p.compareAtPrice) : 0;
  const hasDiscount = comparePriceNum > basePriceNum;
  const discountPercent = hasDiscount
    ? Math.round(((comparePriceNum - basePriceNum) / comparePriceNum) * 100)
    : 0;

  // Stock assessment
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  const stockBadgeColor = totalStock > 5 
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : totalStock > 0 
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200';

  const stockLabel = totalStock > 5 
    ? `In Stock (${totalStock} available)`
    : totalStock > 0 
      ? `Low Stock (${totalStock} left)`
      : 'Out of Stock';

  // Category breadcrumb
  const categoryName = p?.categories.find((category) => category.isPrimary)?.name || p?.categories[0]?.name || 'Footwear';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
        
        {/* Modal Top Header */}
        <div className="px-6 py-3.5 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Customer Storefront Live Preview
            </span>
          </div>
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#FF8C00] hover:underline flex items-center gap-1 font-medium transition-all"
          >
            Open Live Product Page <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {isLoading || !p ? (
          <div className="h-[480px] flex flex-col items-center justify-center gap-3 text-gray-400">
            {isError ? (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            ) : (
              <Loader2 className="w-8 h-8 animate-spin text-[#FF8C00]" />
            )}
            <p className="text-xs font-medium">
              {isError ? 'Unable to load the product preview.' : 'Loading high-fidelity storefront preview...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-8 max-h-[85vh] overflow-y-auto">
            
            {/* Left: Interactive Image Gallery */}
            <div className="space-y-4">
              
              {/* Main Image Frame with Motion animation */}
              <div className="relative aspect-square rounded-xl bg-gray-50 border border-gray-100 overflow-hidden group">
                
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                  {hasDiscount && (
                    <span className="bg-red-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md shadow-md">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {p.status === 'ACTIVE' && (
                    <span className="bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded shadow">
                      New Arrival
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={p.name}
                    initial={{ opacity: 0.4, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800';
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnails Switcher Row */}
              {mediaList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {mediaList.map((m, idx) => {
                    const isSelected = (selectedImage || mediaList[0].url) === m.url;
                    return (
                      <button
                        key={m.id || idx}
                        type="button"
                        onClick={() => setSelectedImage(m.url)}
                        className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                          isSelected ? 'border-[#FF8C00] ring-2 ring-[#FF8C00]/20 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-html-element-suppression */}
                        <img
                          src={m.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Product Details & Customer Controls */}
            <div className="flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                {/* Category & Brand Breadcrumb */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="uppercase tracking-widest font-semibold text-gray-400">
                    Home / Catalog / {categoryName}
                  </span>
                  {p.brand && (
                    <span className="font-bold text-[#FF8C00] uppercase tracking-wider">
                      {p.brand.name}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  {p.name}
                </h2>

                {/* Short Description */}
                {p.shortDescription && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {p.shortDescription}
                  </p>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1 border-t border-gray-100">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {basePriceNum.toFixed(3)} <span className="text-sm font-semibold">TND</span>
                  </span>
                  {hasDiscount && (
                    <span className="text-sm font-semibold text-gray-400 line-through">
                      {comparePriceNum.toFixed(3)} TND
                    </span>
                  )}
                  <Badge className={`ml-auto text-[10px] ${stockBadgeColor}`}>
                    {stockLabel}
                  </Badge>
                </div>

                {/* Interactive Variant Options (Colors & Sizes) */}
                <div className="space-y-3 pt-2">
                  
                  {/* Colors Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>Color Option</span>
                      <span className="text-gray-400 font-normal">{selectedColor}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {['Black', 'White', 'Red', 'Blue', 'Brown'].map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-black text-white border-black shadow'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Pills Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>Shoe Size (EU)</span>
                      <span className="text-gray-400 font-normal">EUR {selectedSize}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {['40', '41', '42', '43', '44'].map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`w-10 h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#FF8C00] text-white border-[#FF8C00] shadow-md scale-105'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Customer Guarantees */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <Truck className="w-4 h-4 text-[#FF8C00]" />
                    <span>Free Nationwide Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>COD Cash on Delivery</span>
                  </div>
                </div>
              </div>

              {/* Bottom Customer Buttons */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full bg-black hover:bg-gray-800 text-white py-5 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  onClick={() => {
                    window.open(`/product/${p.slug}`, '_blank');
                  }}
                >
                  <ShoppingBag className="w-4 h-4 text-[#FF8C00]" /> Add to Bag & Order COD
                </Button>
                
                <p className="text-[10px] text-center text-gray-400">
                  This preview renders the exact storefront presentation for public customers.
                </p>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

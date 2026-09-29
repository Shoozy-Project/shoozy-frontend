'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { motion, AnimatePresence } from 'framer-motion';
import { catalogApi } from '@/lib/api/catalog';
import type { CatalogProductDto } from '@/types/commerce';

// Hook for debouncing input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function DesktopLiveSearch() {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await catalogApi.products({ search: debouncedQuery, limit: 5 });
        if (res.data?.success) {
          setResults(res.data.data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch search results', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      // Global ⌘K shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = wrapperRef.current?.querySelector('input');
        input?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="hidden md:block relative w-64 md:w-80 lg:w-96 transition-all duration-300" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="size-4 text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search Maison Shoezy…"
          aria-label={t('header.search')}
          className="w-full h-10 pl-10 pr-12 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 bg-neutral-100/80 border border-neutral-200/80 rounded-full focus:outline-none focus:border-neutral-400 focus:bg-white dark:bg-neutral-900/60 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-600 dark:focus:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-300"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <kbd className="hidden lg:inline-flex items-center justify-center text-[10px] text-neutral-400 border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.5 rounded font-sans font-medium tracking-widest bg-transparent">
            ⌘K
          </kbd>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-[420px] lg:w-[480px] mt-2 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-400 dark:text-neutral-500">
                  <Loader2 className="size-6 animate-spin mb-3" />
                  <p className="text-xs tracking-widest uppercase">Searching catalog...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold px-2">
                    Products
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-800 overflow-hidden shrink-0">
                        {product.primaryMedia?.url ? (
                          <img src={product.primaryMedia.url} alt={product.primaryMedia.altText || product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">No Img</div>
                        )}
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-center truncate">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{product.name}</span>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{product.brand?.name}</span>
                      </div>
                      {/* Price */}
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 shrink-0">
                        {(parseInt(product.basePrice || '0')).toFixed(3)} TND
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-neutral-400 dark:text-neutral-500 text-center px-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No matching luxury pieces found</p>
                  <p className="text-xs mt-1">Try checking your spelling or use more general terms.</p>
                </div>
              )}
            </div>
            
            {/* Footer Action */}
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsOpen(false)}
              className="w-full p-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 hover:text-[#FF8C00] dark:hover:text-[#FF8C00] transition-colors"
            >
              View all results for "{query}"
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileLiveSearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus the input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await catalogApi.products({ search: debouncedQuery, limit: 5 });
        if (res.data?.success) {
          setResults(res.data.data.items || []);
        }
      } catch (err) {
        console.error('Failed to fetch search results', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed inset-0 z-[100] bg-white dark:bg-[#0c0c0d] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex-none p-4 border-b border-neutral-200 dark:border-white/10 shadow-sm flex items-center gap-3">
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Maison Shoezy…"
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </form>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-black dark:hover:text-white font-medium text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {query.trim().length >= 2 ? (
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                  <Loader2 className="size-6 animate-spin mb-3" />
                  <p className="text-xs tracking-widest uppercase">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-2 pb-20">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2 px-1">
                    Products
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800/50">
                        {product.primaryMedia?.url ? (
                          <img src={product.primaryMedia.url} alt={product.primaryMedia.altText || product.name} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 flex flex-col justify-center truncate">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{product.name}</span>
                        <span className="text-xs text-neutral-500 truncate">{product.brand?.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        ${(parseInt(product.basePrice || '0') / 100).toFixed(2)}
                      </div>
                    </Link>
                  ))}
                  
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="mt-6 w-full p-4 text-center text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No luxury pieces found.</p>
                  <p className="text-xs text-neutral-500 mt-2">Try checking your spelling or use more general terms.</p>
                </div>
              )
            ) : (
              <div className="py-8 px-2 flex flex-col items-center justify-center text-center opacity-50">
                <Search className="size-8 mb-4 text-neutral-400" />
                <p className="text-xs uppercase tracking-widest text-neutral-500">Discover Maison Shoezy</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

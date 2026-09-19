# Homepage Specification (`_spec.md`)

## 1. Feature Description
The homepage of Shoezy serves as the primary storefront landing page. It showcases a luxury, minimalist aesthetic designed to highlight premium footwear. The page is broken down into modular sections: Header, Hero, Selection, PromoSlider, BrandStory, EleganceBanner, Advantages, and Footer.

## 2. Brand Identity & Typography
- **Brand Name**: "Shoezy" (replaces placeholder "NOVRAYA").
- **Typography**:
  - Headings & Brand: `font-serif` (Playfair Display)
  - Body & UI Text: `font-sans` (Inter/Geist)
- **Colors**:
  - Primary text: `text-foreground`
  - Backgrounds: `bg-background`, `bg-card`, or custom dark backgrounds for specific banners (e.g., `bg-black text-white`).
  - CTA Button backgrounds: Standard `bg-black text-white` for minimalism, except for primary brand actions using `gold-orange` if specified. (Screenshot shows black/white buttons for "DISCOVER" and "MAKE AN ORDER NOW", so we'll stick to black/white for elegance).

## 3. Component Structure & Mappings

### 3.1 `components/layout/Header.tsx`
- **Layout**: Flex container, space-between. Sticky or fixed at the top.
- **Left**: Search Icon (`lucide-react` `Search`).
- **Center**: "Shoezy" logo (text, `font-serif`, large text).
- **Right**: User Icon (`User`), Shopping Bag Icon (`ShoppingBag`).
- **Navigation (Desktop)**: Centered below or inline. Links: MEN, WOMEN, NEW ARRIVALS, EXCLUSIVES, THE HOUSE.

### 3.2 `app/(public)/_components/Hero.tsx`
- **Layout**: Full-width image banner.
- **Image**: Black loafers on a reflective surface (`next/image`, `object-cover`).
- **Content**: Centered "DISCOVER" button.

### 3.3 `app/(public)/_components/OurSelection.tsx`
- **Layout**: Section with generous vertical padding (`py-16` or `py-24`). Centered heading "Our selection" (`font-serif`, `text-3xl`).
- **Tabs**: "Men", "Women", "Accessories" (Visual tabs only for now, can be static buttons).
- **Grid**: 3 columns (`grid-cols-1 md:grid-cols-3 gap-8`).
- **Cards**: 
  - Image (`bg-[#f7f7f7]` container for contrast).
  - Title (`font-serif`).
  - Description (`font-sans`, text-sm, muted).
  - Price: Formatted as `780.000 TND`.

### 3.4 `app/(public)/_components/PromoSlider.tsx`
- **Layout**: Full-width dark background section (`bg-black text-white`).
- **Content**: Image of brown loafers, Text overlay "Exclusive Summer Privilege" (`font-serif`, `text-4xl`), "LIMITED TIME".
- **Controls**: Left/Right chevrons (`lucide-react` `ChevronLeft`, `ChevronRight`) and bottom dots. 

### 3.5 `app/(public)/_components/BrandStory.tsx`
- **Layout**: Split or asymmetrical layout.
- **Left**: Vertical text "L'ARTISANAT".
- **Right/Center**: "Crafted with passion since the beginning..." text block (`font-sans`, `text-lg` or `text-xl`).

### 3.6 `app/(public)/_components/EleganceBanner.tsx`
- **Layout**: Full-width image background (feet on cobblestone).
- **Content**: "Step Into Timeless Elegance", "Discover craftsmanship that defines your journey", Button "MAKE AN ORDER NOW".

### 3.7 `app/(public)/_components/Advantages.tsx`
- **Layout**: 3-column grid, centered content.
- **Columns**:
  1. Icon: `Package` -> "Free express delivery" -> "for all orders over 200€" -> "LEARN MORE" link.
  2. Icon: `RefreshCcw` -> "Returns offered" -> "easy and free returns on all orders" -> "LEARN MORE" link.
  3. Icon: `Phone` -> "Need help?" -> "Contact our client service at +33 1 23 45 67 89" -> "LEARN MORE" link.

### 3.8 `components/layout/Footer.tsx`
- **Layout**: Dark background (`bg-black text-white`), multi-column.
- **Columns**: Logo ("Shoezy"), "Need help?", "About Shoezy", "Collections", "Privacy Policy", "Terms of Service".
- **Business Rule Badge**: Explicit "Cash on Delivery ONLY" badge to enforce COD rule.
- **Copyright**: "© 2026 SHOEZY. All Rights Reserved."

## 4. Technical Constraints
- All images must use `next/image` with Unsplash placeholders.
- No `material-symbols-outlined`. Use `lucide-react`.
- Responsive design via Tailwind breakpoints (`sm`, `md`, `lg`).
- Modular Server Components by default.

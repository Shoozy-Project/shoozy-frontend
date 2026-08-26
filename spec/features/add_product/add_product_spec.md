# Add Product Feature — Specification

> **Status:** ⏳ Under Review  
> **Feature:** Add Product Page  
> **Roles Served:** Admin  
> **Last Updated:** 2026-08-20  

---

## 1. Overview

The **Add Product** feature allows administrators to add new shoes to the catalog from the `/admin/products/new` route. It supports defining basic product information, categories, brands, material, gender, base prices in Tunisian Dinar (TND), options (sizes/colors), dynamic variant generation, and media paths.

---

## 2. Routes

| Route | Page Component | Auth Guard |
|---|---|---|
| `/admin/products/new` | `AddProductPage` | Admin only |

This page segment lives in `app/(admin)/admin/products/new/page.tsx`.

---

## 3. Form Sections & Fields

The page will display a multi-section form styled with Shadcn elements:

### 3.1 Basic Details (Card)
- **Product Name:** Text input (required).
- **Slug:** Text input (auto-generated from name, editable, unique).
- **SKU Prefix:** Text input (optional, e.g. `NIKE-AM`).
- **Short Description:** Text area (optional, max 500 chars).
- **Full Description:** Rich text area/textarea (optional).

### 3.2 Categorization & Attributes (Card)
- **Brand:** Select dropdown (options fetched from database/mock).
- **Category:** Select dropdown (options fetched from database/mock).
- **Gender:** Select dropdown (`Male`, `Female`, `Unisex`).
- **Material:** Text input (e.g. `Full Grain Leather`).
- **Season:** Text input (e.g. `Summer 2026`).

### 3.3 Pricing (Card)
- **Base Price (TND):** Decimal number input (required, formatted with 3 decimals e.g., `129.990`).
- **Compare At Price (TND):** Decimal number input (optional).
- *Rule:* Values entered in Dinars are multiplied by 1000 to convert to millimes (Minor Units) when preparing payload for variants.

### 3.4 Product Options & Variants (Card)
- Allows specifying product options like **Size** (e.g., `40, 41, 42`) and **Color** (e.g., `Black, White`).
- Dynamically generates a table of variants from the combinations:
  - Each variant has an auto-generated SKU (e.g. `{SKU_PREFIX}-{COLOR}-{SIZE}`).
  - Each variant allows editing **Stock Quantity**, **Price in TND** (defaults to product base price), and **Barcode**.

### 3.5 Media (Card)
- Simple media list showing mock image previews, with an option to enter image URLs or select files.

### 3.6 SEO & Metadata (Card - Collapsible)
- **SEO Title:** Text input (optional).
- **SEO Description:** Text area (optional).

---

## 4. API payload Mapping

When calling `POST /api/v1/admin/products`, the payload is mapped as follows:

```json
{
  "name": "Air Monarch IV",
  "slug": "air-monarch-iv",
  "brandId": "uuid-brand",
  "basePrice": "189.00",
  "compareAtPrice": "220.00",
  "description": "Premium leather shoes...",
  "gender": "MALE",
  "material": "Leather",
  "status": "ACTIVE",
  "categories": ["uuid-category"],
  "options": [
    {
      "name": "Size",
      "values": ["40", "41", "42"]
    }
  ],
  "variants": [
    {
      "sku": "NIKE-AM-BLK-40",
      "title": "Air Monarch IV - Black / 40",
      "stockQuantity": 15,
      "priceMinor": 189000, 
      "isActive": true
    }
  ]
}
```

---

## 5. Visual Guide & Layout

Inspired by modern luxury storefront admin panels:
- Two-column grid layout on desktop:
  - Left column (wider): Basic details, Pricing, Options & Variants, Media.
  - Right column (narrower): Status card, Categorization attributes, SEO collapsible card.
- Floating Save action bar at bottom of page.

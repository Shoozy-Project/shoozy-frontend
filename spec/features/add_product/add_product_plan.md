# Add Product Feature — Implementation Plan

This plan details the technical steps to create the Add Product page in the admin layout, implementing form validations, option-variant generators, styling and linking.

---

## Proposed Changes

### 1. API Integration Layer
#### [NEW] [`lib/api/products.ts`](file:///c:/Users/ReMoST11/Downloads/Shoezy/client/lib/api/products.ts)
- Create `productsApi` containing `createProduct(payload)` which triggers `POST /admin/products` through `apiClient`.

### 2. Validation Schemas
#### [NEW] [`validations/product.ts`](file:///c:/Users/ReMoST11/Downloads/Shoezy/client/validations/product.ts)
- Zod schema for validating basic details, categories, prices, options, and variants array.

### 3. Component Layer
#### [NEW] [`components/admin/AddProductForm.tsx`](file:///c:/Users/ReMoST11/Downloads/Shoezy/client/components/admin/AddProductForm.tsx)
- Premium, multi-card form utilizing Shadcn UI components.
- Section 1: Basic info (name, slug auto-generation, SKU prefix, short description, description).
- Section 2: Categories, Brand, Gender, Material, Season.
- Section 3: Pricing (Base Price, Compare At Price, with automatic Dinar conversion to millimes for variants).
- Section 4: Dynamic options input (Sizes, Colors). Updates options arrays.
- Section 5: Dynamically calculated variants table (auto-generates SKUs and allows inputting stock, variant price, barcode).
- Section 6: Image preview simulator and upload slots.

### 4. Routing & Linking
#### [NEW] [`app/(admin)/admin/products/new/page.tsx`](file:///c:/Users/ReMoST11/Downloads/Shoezy/client/app/%28admin%29/admin/products/new/page.tsx)
- Page rendering the `AddProductForm` component.

#### [MODIFY] [`app/(admin)/admin/products/page.tsx`](file:///c:/Users/ReMoST11/Downloads/Shoezy/client/app/%28admin%29/admin/products/page.tsx)
- Wrap the "Add Product" button in a Next.js `Link` pointing to `/admin/products/new`.

---

## Verification Plan
1. Open dashboard products tab, click "Add Product" -> verify navigation to `/admin/products/new`.
2. Input Product details, test dynamic option-to-variant generation (e.g. entering sizes 40 and 42 generates two variant rows).
3. Test validation triggers (missing name, negative prices, etc.).
4. Test submitting the form to verify normal mapping of prices to minor units.

# Shoezy Frontend — Constitution

> **Purpose.** This file is the single source of truth an AI agent reads before writing any
> frontend code. It defines every architectural decision, design token, coding convention,
> API integration contract, state management pattern, and business rule the frontend must obey.
> When building any feature, consult this document **first** — do not re-read source code or
> guess at patterns.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Directory Structure](#3-architecture--directory-structure)
4. [Design System](#4-design-system)
5. [Typography](#5-typography)
6. [Spacing & Layout Philosophy](#6-spacing--layout-philosophy)
7. [Component Conventions](#7-component-conventions)
8. [State Management](#8-state-management)
9. [API Integration Layer](#9-api-integration-layer)
10. [Authentication & Session (Frontend)](#10-authentication--session-frontend)
11. [Forms & Validation](#11-forms--validation)
12. [Routing & Navigation](#12-routing--navigation)
13. [Error Handling](#13-error-handling)
14. [Loading States](#14-loading-states)
15. [SEO & Metadata](#15-seo--metadata)
16. [Animations & Interactions](#16-animations--interactions)
17. [Icons](#17-icons)
18. [Image Handling](#18-image-handling)
19. [Business Rules (Frontend-Enforced)](#19-business-rules-frontend-enforced)
20. [Currency & Price Display](#20-currency--price-display)
21. [Backend API Reference (Summary)](#21-backend-api-reference-summary)
22. [Backend Error Codes (Frontend Must Handle)](#22-backend-error-codes-frontend-must-handle)
23. [Accessibility](#23-accessibility)
24. [Performance](#24-performance)
25. [Environment & Configuration](#25-environment--configuration)
26. [Spec-Driven Development Workflow](#26-spec-driven-development-workflow)
27. [Feature Domains](#27-feature-domains)

---

## 1. Project Identity

| Key | Value |
|---|---|
| Name | `shoezy-front` |
| Description | Luxury e-commerce frontend for premium footwear (Shoezy) |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend API Base | `http://localhost:3000/api/v1` (dev) |
| Frontend Dev Port | `http://localhost:3001` (or Next.js default) |
| Repository Path | `client/` (relative to monorepo root) |

---

## 2. Technology Stack

| Concern | Library | Version | Notes |
|---|---|---|---|
| Framework | `next` | 16.3.0 | App Router only. Server Components by default. |
| React | `react` / `react-dom` | 19.2.8 | |
| Language | `typescript` | ^5 | Strict mode enabled |
| Styling | `tailwindcss` | v4 | Via `@tailwindcss/postcss` |
| State Management | `zustand` | ^5.0.14 | Global client state (cart, auth, UI) |
| Data Fetching | `@tanstack/react-query` | ^5.101.4 | Server state, caching, mutations |
| HTTP Client | `axios` | ^1.19.0 | Interceptors for auth, base URL, error normalization |
| Forms | `react-hook-form` | ^7.85.0 | All forms without exception |
| Validation | `zod` + `@hookform/resolvers` | ^3.25.76 / ^5.7.1 | Shared schemas where possible |
| Animations | `framer-motion` | ^13.0.0 | Sparingly — elegant transitions only |
| Icons | `lucide-react` | ^1.30.0 | Clean, minimalist icons |

### Libraries NOT Used (Critical)

| Library | Status | Reason |
|---|---|---|
| `react-leaflet` | **Deferred** | Only add when location/map features are actively developed |
| Any payment SDK | **FORBIDDEN** | COD-only business model — no Stripe, PayPal, etc. |
| `styled-components` / `emotion` | **FORBIDDEN** | Tailwind CSS only |
| Inline styles | **FORBIDDEN** | Use Tailwind CSS classes exclusively |

---

## 3. Architecture & Directory Structure

### Next.js App Router Conventions

- **Server Components by default.** Only add `'use client'` when the component needs interactivity, hooks, browser APIs, or client-side state.
- Use the `app/` directory exclusively. No `pages/` directory.
- Each route segment can have: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Route handlers go in `route.ts` files inside `app/api/`.

### Planned Directory Layout

```
client/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, register, etc.)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (shop)/                   # Public storefront route group
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   ├── categories/
│   │   └── collections/
│   ├── (account)/                # Customer account route group (protected)
│   │   ├── profile/
│   │   ├── addresses/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── settings/
│   ├── (checkout)/               # Checkout flow route group
│   │   ├── cart/
│   │   └── checkout/
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── brands/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── ...
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + Tailwind imports
│   ├── not-found.tsx             # Global 404
│   └── error.tsx                 # Global error boundary
├── components/                   # Shared UI components
│   ├── ui/                       # Atomic design components (Button, Input, Modal, etc.)
│   ├── layout/                   # Layout components (Header, Footer, Sidebar, etc.)
│   ├── forms/                    # Form-specific components
│   └── shared/                   # Cross-feature shared components
├── lib/                          # Core utilities
│   ├── api/                      # Axios instance, interceptors, API functions
│   │   ├── client.ts             # Axios instance with interceptors
│   │   ├── auth.ts               # Auth API functions
│   │   ├── users.ts              # User API functions
│   │   └── ...                   # One file per API domain
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Pure utility functions
│   └── constants.ts              # App-wide constants
├── stores/                       # Zustand stores
│   ├── auth-store.ts             # Auth state (accessToken, user, session status)
│   ├── cart-store.ts             # Cart state
│   └── ui-store.ts               # UI state (modals, sidebars, toasts)
├── types/                        # Shared TypeScript types
│   ├── api.ts                    # API response envelope types
│   ├── auth.ts                   # Auth-related types
│   ├── user.ts                   # User entity types
│   ├── product.ts                # Product/Variant/Option types
│   └── ...                       # One file per domain
├── validations/                  # Zod schemas for frontend forms
│   ├── auth.ts                   # Login, register, password schemas
│   └── ...                       # One file per domain
├── providers/                    # React context providers
│   └── query-provider.tsx        # TanStack Query provider
├── spec/                         # Spec-Driven Development files
│   ├── CONSTITUTION.md           # THIS FILE
│   └── features/                 # Feature specification files
│       └── <feature_name>/
│           ├── <feature>_spec.md
│           ├── <feature>_clarify.md
│           ├── <feature>_plan.md
│           └── <feature>_tasks.md
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

### Import Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Usage:** `import { Button } from '@/components/ui/Button'`

---

## 4. Design System

### Brand Aesthetic: Luxury Footwear

The design must evoke a **high-end, luxury footwear boutique**. Think: abundant whitespace, elegant serif headings, clean product photography, and restrained use of accent color. **ABSOLUTELY NO cluttered layouts.**

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | Primary backgrounds |
| `off-white` | `#F9F9F9` | Card/container backgrounds, subtle alternating sections |
| `light-grey` | `#F7F7F7` | Secondary container backgrounds |
| `mid-grey` | `#E5E5E5` | Borders, dividers |
| `text-grey` | `#6B7280` | Secondary/muted text |
| `dark-grey` | `#374151` | Body text when not pure black |
| `black` | `#000000` | Primary typography, footer backgrounds |
| `gold-orange` | `#FF8C00` | Primary CTA accent — use sparingly |
| `gold-orange-hover` | `#E67E00` | CTA hover state |
| `gold-orange-light` | `#FFF3E0` | Subtle accent backgrounds |
| `error` | `#DC2626` | Error states, destructive actions |
| `error-light` | `#FEF2F2` | Error backgrounds |
| `success` | `#16A34A` | Success states, stock indicators |
| `success-light` | `#F0FDF4` | Success backgrounds |
| `warning` | `#F59E0B` | Warning states |
| `warning-light` | `#FFFBEB` | Warning backgrounds |

### Color Rules

1. **Backgrounds:** Pristine white (`#FFFFFF`) is the primary background. Use `#F9F9F9` or `#F7F7F7` for product cards and containers.
2. **Typography:** Solid black (`#000000`) for headings and primary text. `#6B7280` for secondary/muted text.
3. **Accent:** Deep gold-orange (`#FF8C00`) for primary CTAs only. Never use it for large areas.
4. **Footer:** Black background with white text.
5. **Never** use generic red, blue, or green for primary UI elements. Use the curated palette above.

---

## 5. Typography

### Font Strategy

| Purpose | Family Type | Specific Font | Tailwind Class |
|---|---|---|---|
| Headings, brand, titles | Serif | (To be configured — e.g., Playfair Display, Cormorant Garamond) | `font-serif` |
| Body, UI elements, buttons, descriptions | Sans-serif | (To be configured — e.g., Inter, Outfit) | `font-sans` |
| Code/technical (rare) | Monospace | Geist Mono (already configured) | `font-mono` |

### Typography Scale

| Element | Size Class | Weight | Font |
|---|---|---|---|
| Hero heading (H1) | `text-5xl` / `text-6xl` | `font-bold` | Serif |
| Page heading (H1) | `text-3xl` / `text-4xl` | `font-bold` | Serif |
| Section heading (H2) | `text-2xl` / `text-3xl` | `font-semibold` | Serif |
| Subsection (H3) | `text-xl` / `text-2xl` | `font-semibold` | Serif |
| Body large | `text-lg` | `font-normal` | Sans-serif |
| Body default | `text-base` | `font-normal` | Sans-serif |
| Body small | `text-sm` | `font-normal` | Sans-serif |
| Caption / Label | `text-xs` | `font-medium` | Sans-serif |
| Button text | `text-sm` / `text-base` | `font-medium` | Sans-serif |

### Typography Rules

1. **One `<h1>` per page.** Always.
2. Proper heading hierarchy: `h1` → `h2` → `h3`. Never skip levels.
3. Serif fonts for **display text only** (headings, brand name, product titles).
4. Sans-serif for **everything else** (body, buttons, labels, navigation, descriptions).

---

## 6. Spacing & Layout Philosophy

### Core Principle: Generous Whitespace

Every layout decision should err on the side of **more** whitespace. This is a luxury brand — breathe.

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `xs` | `4px` / `1` | Inline padding, icon gaps |
| `sm` | `8px` / `2` | Tight component internal padding |
| `md` | `16px` / `4` | Default component padding |
| `lg` | `24px` / `6` | Section internal padding |
| `xl` | `32px` / `8` | Between sections |
| `2xl` | `48px` / `12` | Major section gaps |
| `3xl` | `64px` / `16` | Hero/full-page section gaps |
| `4xl` | `96px` / `24` | Top-level page padding |

### Layout Rules

1. **Container max-width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
2. **Product grids:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8`
3. **Card padding:** Minimum `p-4`, prefer `p-6` for product cards.
4. **Section vertical spacing:** Minimum `py-12`, prefer `py-16` or `py-24`.
5. **Never crowd elements.** If it looks "too spacious," it's probably right.

---

## 7. Component Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatPrice.ts`)
- Types: `camelCase.ts` in `types/` directory
- Hooks: `use-camelCase.ts` (e.g., `use-auth.ts`)
- Stores: `kebab-case.ts` (e.g., `auth-store.ts`)

### Component Definition Syntax

**Default (Server Component):**
```tsx
const ComponentName = () => {
  // Component logic
};
export default ComponentName;
```

**Client Component:**
```tsx
'use client';

const ComponentName = () => {
  // Component logic with hooks, state, etc.
};
export default ComponentName;
```

**With Props:**
```tsx
interface ComponentNameProps {
  title: string;
  isActive?: boolean;
}

export const ComponentName = ({ title, isActive = false }: ComponentNameProps) => {
  // Component logic
};
```

### Component Rules

1. **Server Components by default.** Only add `'use client'` when you need interactivity.
2. **No `React.FC`.** Use direct type annotation on props via interface destructuring.
3. **Let TypeScript infer return types.** Don't annotate component return types.
4. **Every interactive element must have a unique, descriptive `id`.** For browser testing.
5. **Co-locate closely related files.** Keep component-specific types and utils near the component.
6. **Export named components for reusable ones** (`export const Button`), **default exports for page components**.

---

## 8. State Management

### Zustand Architecture

| Store | Purpose | Persistence |
|---|---|---|
| `auth-store` | Access token (in memory), user object, session status, login/logout actions | **Memory only** — access token NEVER in localStorage |
| `cart-store` | Cart items, quantities, cart operations | Sync with server via TanStack Query |
| `ui-store` | Modal states, sidebar visibility, toast queue, theme | Optional localStorage for preferences |

### Zustand Rules

1. **Access token in memory only.** Never `localStorage` or `sessionStorage`.
2. Keep stores **flat** — avoid deeply nested state.
3. Derive computed values with selectors, not stored duplicates.
4. One store per domain concern.

### TanStack Query Architecture

| Concern | Pattern |
|---|---|
| Server data (products, orders, etc.) | `useQuery` / `useInfiniteQuery` |
| Mutations (create, update, delete) | `useMutation` + `queryClient.invalidateQueries` |
| Query keys | Structured arrays: `['products', filters]`, `['user', 'me']` |
| Stale time | Aggressive for catalog data (`5min`), short for user data (`30s`) |
| Error handling | Global `onError` in query client + per-query overrides |

### State Management Decision Tree

```
Is it server-owned data (fetched from API)?
  → YES → TanStack Query
Is it global client state (auth, cart, UI)?
  → YES → Zustand store
Is it local to one component or form?
  → YES → `useState` / `useReducer` / `react-hook-form`
```

---

## 9. API Integration Layer

### Axios Instance Configuration

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,  // REQUIRED — sends refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

Attach access token from Zustand auth store to every request:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor — Silent Refresh

```
On 401 response:
  1. If not already refreshing → call POST /auth/refresh (with credentials)
  2. If refresh succeeds → update Zustand token → retry original request
  3. If refresh fails → clear auth state → redirect to /login
  4. Queue concurrent 401 requests while refresh is in-flight
```

### API Response Types

```typescript
// types/api.ts
interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### API Function Pattern

```typescript
// lib/api/auth.ts
export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<ApiSuccess<{ user: User; accessToken: string }>>('/auth/login', data),

  register: (data: RegisterInput) =>
    apiClient.post<ApiSuccess<UserDto>>('/auth/register', data),

  refresh: () =>
    apiClient.post<ApiSuccess<{ user: User; accessToken: string }>>('/auth/refresh'),

  logout: () =>
    apiClient.post<ApiSuccess<{ loggedOut: true }>>('/auth/logout'),
};
```

---

## 10. Authentication & Session (Frontend)

### Login Flow

1. User submits email + password → `POST /api/v1/auth/login`
2. On success: store `accessToken` in Zustand (memory), store `user` in Zustand
3. Refresh token is automatically set as HTTP-only cookie by the backend
4. Redirect to intended destination or homepage

### Registration Flow

1. User submits registration form → `POST /api/v1/auth/register`
2. Show success message: "Check your email for verification link"
3. User clicks link → `POST /api/v1/auth/verify-email` with token from URL
4. On verification success → redirect to login

### Social Auth Flow

1. Google: Trigger Google OAuth → get `idToken` → `POST /api/v1/auth/google`
2. Facebook: Trigger Facebook OAuth → get `accessToken` → `POST /api/v1/auth/facebook`
3. On success: same as login (store token + user, cookie set automatically)

### Token Refresh

- Access token expires in **15 minutes** (default)
- On any 401 response: silently call `POST /api/v1/auth/refresh` (cookie sent automatically)
- On refresh success: update Zustand store with new `accessToken` and retry failed request
- On refresh failure: clear all auth state, redirect to `/login`
- **Concurrent 401 handling:** queue all failed requests, refresh once, retry all

### Logout

- Call `POST /api/v1/auth/logout` with Bearer token
- Clear Zustand auth state
- Backend clears refresh cookie
- Redirect to homepage or login

### Protected Routes

- Use a middleware or wrapper component to check auth state
- If no access token and refresh fails → redirect to `/login`
- If user lacks required permission → show 403 page

---

## 11. Forms & Validation

### Stack: react-hook-form + zod

**Every form** in the application must use `react-hook-form` with `zod` resolver. No exceptions.

### Form Pattern

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/validations/auth';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
};
```

### Validation Rules (Mirror Backend)

| Field | Rules |
|---|---|
| Email | Valid email format, trimmed, lowercased |
| Password | Min 12 chars, max 72 UTF-8 bytes |
| First Name | Required, max 100 chars |
| Last Name | Required, max 100 chars |
| Phone | Optional, 7-32 chars |

### Form UX Rules

1. Show inline validation errors below each field.
2. Disable submit button while `isSubmitting`.
3. Show server errors at the top of the form or inline if field-specific.
4. Use proper `<label>` elements linked to inputs with `htmlFor`.
5. Auto-focus first field on form mount.

---

## 12. Routing & Navigation

### Route Groups

| Group | Path Prefix | Purpose | Auth |
|---|---|---|---|
| `(auth)` | `/login`, `/register`, etc. | Authentication pages | Public (redirect if logged in) |
| `(shop)` | `/`, `/products/*`, etc. | Public storefront | Public |
| `(account)` | `/profile`, `/orders`, etc. | Customer account | Required (CUSTOMER) |
| `(checkout)` | `/cart`, `/checkout` | Checkout flow | Required for checkout |
| `admin` | `/admin/*` | Admin dashboard | Required (ADMIN) |

### Route Protection Strategy

- **Middleware** (`middleware.ts`): Check for auth cookie/token presence, redirect if unauthorized
- **Layout-level guards**: Wrap protected route groups with auth check components
- **Permission-based**: Check user permissions from Zustand store for admin routes

---

## 13. Error Handling

### Error Boundary Pattern

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-serif text-black mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-black text-white rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
```

### API Error Handling

| Backend Error Code | Frontend Action |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | Show "Invalid email or password" inline |
| `AUTH_EMAIL_NOT_VERIFIED` | Redirect to verification page with resend option |
| `AUTH_ACCOUNT_INACTIVE` | Show "Account deactivated" message |
| `DUPLICATE_EMAIL` | Show "Email already registered" inline on email field |
| `DUPLICATE_PHONE` | Show "Phone already in use" inline on phone field |
| `AUTH_SOCIAL_ACCOUNT_CONFLICT` | Show conflict resolution message |
| `VALIDATION_ERROR` (422) | Map `details` array to field-level errors |
| `AUTH_REFRESH_INVALID/REUSED` | Clear auth → redirect to login |
| Any 500 | Show generic error toast |
| Network error | Show "Connection lost" toast with retry |

---

## 14. Loading States

### Loading Patterns

| Scenario | Pattern |
|---|---|
| Page navigation | `loading.tsx` with skeleton UI |
| Data fetching | TanStack Query `isLoading` → skeleton components |
| Form submission | Disable button + spinner inside button |
| Image loading | Blur placeholder → sharp image (Next.js Image) |
| Infinite scroll | Bottom loading indicator |

### Skeleton Rules

- Skeletons should match the **exact layout** of the loaded content.
- Use `animate-pulse` with `bg-gray-200` / `bg-gray-100` blocks.
- Never show a blank page — always show structure.

---

## 15. SEO & Metadata

### Metadata API (Next.js)

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shoezy | Luxury Footwear',
  description: 'Discover our timeless collection of premium footwear.',
};
```

### SEO Rules

1. **Every page** must have a unique `title` and `description`.
2. Title format: `Page Name | Shoezy` or `Product Name — Shoezy`
3. One `<h1>` per page. Always.
4. Use semantic HTML: `<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`.
5. Products should use `generateMetadata` with dynamic data from the API.
6. Use `<link rel="canonical">` for product pages accessible via multiple paths.

---

## 16. Animations & Interactions

### Framer Motion — Usage Policy

**Sparingly.** Only for:
- Page transitions (subtle fade/slide)
- Modal open/close
- Cart drawer slide-in
- Product image gallery transitions
- Toast notifications entrance/exit
- Hover interactions on product cards (subtle scale/shadow)

### Animation Tokens

| Animation | Duration | Easing |
|---|---|---|
| Fade in | `200ms` | `ease-out` |
| Slide in | `300ms` | `ease-out` |
| Modal overlay | `200ms` | `ease-in-out` |
| Hover scale | `150ms` | `ease-out` |
| Page transition | `300ms` | `ease-in-out` |

### Rules

1. **Never animate for the sake of animating.** Every animation must serve UX.
2. **Respect `prefers-reduced-motion`.** Disable animations for users who prefer it.
3. **No janky animations.** If it can't be smooth at 60fps, remove it.

---

## 17. Icons

### Lucide React

```tsx
import { ShoppingBag, Heart, Search, User, X } from 'lucide-react';
```

### Icon Sizing

| Context | Size | Tailwind Class |
|---|---|---|
| Inline text | 16px | `w-4 h-4` |
| Button icon | 20px | `w-5 h-5` |
| Navigation | 24px | `w-6 h-6` |
| Feature icon | 32px | `w-8 h-8` |
| Hero icon | 48px | `w-12 h-12` |

### Rules

1. Use `lucide-react` exclusively. No mixing icon libraries.
2. Always add `aria-hidden="true"` to decorative icons.
3. For icon-only buttons, add `aria-label` describing the action.
4. Consistent `strokeWidth` across the app (default 2).

---

## 18. Image Handling

### Next.js Image Component

```tsx
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={500}
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Rules

1. **Always use `next/image`** for optimized loading. Never raw `<img>` tags.
2. Always provide meaningful `alt` text. Never empty alt on content images.
3. Use `priority` for above-the-fold hero images.
4. Configure `next.config.ts` `images.remotePatterns` for backend image domains.
5. Aspect ratios: Product thumbnails `1:1`, Product detail `3:4`, Hero `16:9`.

---

## 19. Business Rules (Frontend-Enforced)

### Non-Negotiable

1. **COD is the ONLY payment method.** NEVER render credit card inputs, expiration fields, CVC fields, or any online payment form. Always show "Cash on Delivery" prominently.
2. **Prices are display-only.** The frontend never calculates or submits prices. All price calculations happen server-side.
3. **Cart quantity cannot exceed stock.** Show max available stock and disable increment beyond it.
4. **Social accounts are never auto-linked.** If `AUTH_SOCIAL_ACCOUNT_CONFLICT`, show the user a message about the conflict — don't try to merge.

### Product Display

1. Only show `ACTIVE` products to customers. `DRAFT` products are admin-only.
2. Show "Out of Stock" badge when `stockQuantity === 0`.
3. Show original price with strikethrough when `compareAtPrice` exists and is higher than `basePrice`.
4. Show savings percentage badge when discount exists.

### Order Status Display

| Status | Customer Label | Color |
|---|---|---|
| `PENDING` | "Order Placed" | `text-yellow-600` |
| `CONFIRMED` | "Confirmed" | `text-blue-600` |
| `SHIPPED` | "Shipped" | `text-purple-600` |
| `DELIVERED` | "Delivered" | `text-green-600` |
| `CANCELLED` | "Cancelled" | `text-red-600` |
| `RETURNED` | "Returned" | `text-gray-600` |

---

## 20. Currency & Price Display

### Currency: TND (Tunisian Dinar)

| Data Source | Format | Conversion |
|---|---|---|
| Product `basePrice` (DTO) | `"129.99"` string | Already in major units — parse as float |
| Variant `priceMinor` (DTO) | `"129990"` string | **Divide by 1000** for TND display |
| Order `totalMinor` (DTO) | `"25998"` string | **Divide by 1000** for TND display |

### Display Format

```typescript
// lib/utils/formatPrice.ts
export function formatPrice(priceInDinars: number): string {
  return `${priceInDinars.toFixed(3)} TND`;
}

export function formatPriceFromMinor(priceMinor: string | number): string {
  const dinars = Number(priceMinor) / 1000;
  return formatPrice(dinars);
}
```

### Rules

1. **1 TND = 1000 millimes.** Backend uses millimes for variant/order prices.
2. Always show 3 decimal places for TND (e.g., `129.990 TND`).
3. Position currency code after the amount: `129.990 TND`.
4. Never show raw millime values to customers.

---

## 21. Backend API Reference (Summary)

> Full contracts are in [`shoozy_backend/spec/CONSTITUTION.md`](file:///c:/Users/ReMoST11/Downloads/Shoezy/shoozy_backend/spec/CONSTITUTION.md). This section summarizes what the frontend integrates with.

### Auth Endpoints (`/api/v1/auth`)

| Endpoint | Method | Auth | Frontend Use |
|---|---|---|---|
| `/register` | POST | Public | Registration form |
| `/verify-email` | POST | Public | Email verification page |
| `/resend-verification` | POST | Public | Resend button |
| `/login` | POST | Public | Login form |
| `/refresh` | POST | Cookie | Silent refresh interceptor |
| `/logout` | POST | Bearer | Logout action |
| `/logout-all` | POST | Bearer | Settings action |
| `/change-password` | POST | Bearer | Settings form |
| `/forgot-password` | POST | Public | Forgot password form |
| `/reset-password` | POST | Public | Reset password form |
| `/google` | POST | Public | Google OAuth button |
| `/facebook` | POST | Public | Facebook OAuth button |

### User Endpoints (`/api/v1/users`)

| Endpoint | Method | Permission | Frontend Use |
|---|---|---|---|
| `/me` | GET | `profile.read.own` | Profile page, auth context |
| `/me` | PATCH | `profile.update.own` | Profile edit form |

### Address Endpoints (`/api/v1/addresses`)

| Endpoint | Method | Permission |
|---|---|---|
| `/` | GET | `addresses.read.own` |
| `/` | POST | `addresses.create.own` |
| `/:addressId` | GET/PATCH/DELETE | `addresses.*.own` |
| `/:addressId/default` | POST | `addresses.update.own` |

### Admin Endpoints (`/api/v1/admin/...`)

Brands, Categories, Size Guides, Products, Product Options, Variants — all CRUD. See backend constitution for full contracts.

### Planned Endpoints (Not Yet Available)

Public catalog, carts, orders, shipping, returns, wishlists, reviews — schemas exist but no backend implementation yet. Frontend features for these should be designed against the planned contracts in the backend constitution.

---

## 22. Backend Error Codes (Frontend Must Handle)

### Auth Errors

| Code | Action |
|---|---|
| `AUTH_INVALID_CREDENTIALS` | Inline form error |
| `AUTH_EMAIL_NOT_VERIFIED` | Redirect to verify page + show message |
| `AUTH_ACCOUNT_INACTIVE` | Show deactivation message |
| `AUTH_ACCOUNT_DELETED` | Show deletion message |
| `AUTH_SOCIAL_ACCOUNT_CONFLICT` | Show conflict message with provider info |
| `AUTH_REFRESH_INVALID` | Silent → redirect to login |
| `AUTH_REFRESH_REUSED` | Clear all → redirect to login (security event) |
| `AUTH_GOOGLE_UNAVAILABLE` | Hide Google login button or show unavailable message |
| `AUTH_FACEBOOK_UNAVAILABLE` | Hide Facebook login button or show unavailable message |
| `AUTH_RATE_LIMITED` | Show "Too many attempts, try later" |

### Validation Errors (422)

Map `error.details` array to form field errors:
```typescript
// details: [{ field: "email", message: "Invalid email format" }]
details.forEach(({ field, message }) => {
  form.setError(field, { message });
});
```

### Conflict Errors (409)

| Code | Action |
|---|---|
| `DUPLICATE_EMAIL` | Inline error on email field |
| `DUPLICATE_PHONE` | Inline error on phone field |
| `BRAND_SLUG_ALREADY_EXISTS` | Inline error on slug field |
| `VARIANT_SKU_ALREADY_EXISTS` | Inline error on SKU field |

---

## 23. Accessibility

### WCAG 2.1 AA Compliance

1. **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text.
2. **Keyboard navigation:** All interactive elements must be reachable and operable via keyboard.
3. **Focus indicators:** Visible focus ring on all interactive elements. Use `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black`.
4. **ARIA labels:** All icon-only buttons, form inputs without visible labels, and custom interactive elements.
5. **Semantic HTML:** Use `<button>` for actions, `<a>` for navigation. Never `<div onClick>`.
6. **Alt text:** All content images. Decorative images get `alt=""`.
7. **Skip navigation:** Provide a "Skip to main content" link.
8. **Form errors:** Associate errors with inputs via `aria-describedby`.

---

## 24. Performance

### Optimization Strategies

1. **Server Components** for data fetching — no client-side waterfall.
2. **Code splitting** via Next.js dynamic imports for heavy components (maps, modals).
3. **Image optimization** via `next/image` with appropriate sizing.
4. **TanStack Query caching** to minimize redundant API calls.
5. **Lazy loading** below-the-fold images and components.
6. **Bundle analysis** — keep initial JS bundle under 200KB.

### Caching Strategy

| Data Type | Stale Time | GC Time | Notes |
|---|---|---|---|
| Product catalog | 5 min | 30 min | Aggressive cache |
| Product detail | 5 min | 30 min | |
| User profile | 30s | 5 min | Short stale time |
| Cart | 0 (always fresh) | 5 min | Always refetch |
| Order history | 1 min | 10 min | |

---

## 25. Environment & Configuration

### Environment Variables

| Variable | Required | Default | Usage |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:3000/api/v1` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | No | — | Facebook OAuth app ID |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3001` | Canonical site URL |

### Configuration Rules

1. All client-side env vars must start with `NEXT_PUBLIC_`.
2. Never expose secrets on the client. Auth tokens are in memory only.
3. Use `.env.local` for local development (git-ignored).
4. Validate env vars at build time where possible.

---

## 26. Spec-Driven Development Workflow

### For Every Feature

```
1. SPECIFICATION   → spec/features/<feature>/<feature>_spec.md
2. CLARIFICATION   → spec/features/<feature>/<feature>_clarify.md
3. PLAN            → spec/features/<feature>/<feature>_plan.md
4. TASKS           → spec/features/<feature>/<feature>_tasks.md
5. IMPLEMENTATION  → Actual code files
6. VERIFICATION    → Tests, visual QA
```

### Step Details

1. **Specification (`_spec.md`):** Full feature requirements — UI, behavior, API contracts, data shapes, edge cases, error states. Written by the agent based on the user's feature description.

2. **Clarification (`_clarify.md`):** Questions the agent asks the user about ambiguous or missing details. User answers are appended. The spec is then updated to reflect the answers.

3. **Plan (`_plan.md`):** Technical implementation plan — which files to create/modify, component hierarchy, state management approach, API integration details. Must reference the constitution for patterns.

4. **Tasks (`_tasks.md`):** Ordered checklist of implementation steps. Each task is small, atomic, and testable. Tasks are checked off as completed.

5. **Implementation:** Write code following the plan and tasks, adhering to every rule in this constitution.

6. **Verification:** Run linter, type-check, and verify the feature visually.

### Rules

- **Never skip the specification step.** Even for "simple" features.
- **Always ask clarifying questions** before planning. Missing details cause rework.
- **Update the spec** when answers come back. The spec is the living document.
- **The constitution overrides any ad-hoc decision.** If there's a conflict, follow this document.

---

## 27. Feature Domains

### Domain Map (Planned)

| Domain | Features | Priority |
|---|---|---|
| **Identity** | Login, Register, Verify Email, Forgot/Reset Password, Social Auth, Profile, Addresses | High |
| **Catalog** | Product Listing, Product Detail, Category Browse, Search, Filters, Size Guide | High |
| **Commerce** | Cart, Checkout (COD), Order Placement | High |
| **Account** | Order History, Order Detail, Address Management, Profile Settings | Medium |
| **Admin** | Dashboard, Product CRUD, Brand/Category CRUD, Order Management, Variant Management | Medium |
| **Experience** | Wishlist, Reviews, Collections | Low |
| **Polish** | Homepage Hero, Animations, Newsletter, Footer | Ongoing |

---

*This constitution was created on 2026-08-19 and reflects the current state of the frontend project setup and backend API contracts. Update this document when architectural decisions change, new libraries are adopted, or the backend constitution is updated.*

# Shoezy Frontend

Shoezy is a luxury e-commerce platform for premium footwear. This repository contains the frontend application, built with modern web technologies focusing on performance, accessibility, and a high-end user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js 16.3](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**:
  - Global Client State: [Zustand](https://github.com/pmndrs/zustand)
  - Server State & Data Fetching: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (with interceptors for auth & token refresh)
- **Animations & UI**: [Framer Motion](https://www.framer.com/motion/), `tw-animate-css`, `embla-carousel-react`
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Architecture & Directory Structure

The project strictly follows the **Next.js App Router** architecture with Server Components enabled by default.

```text
Shoozy-Frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (login, register, etc.)
│   ├── (public)/                 # Public storefront (homepage, products, categories)
│   ├── (admin)/                  # Admin dashboard (protected routes)
│   │   └── admin/
│   │       ├── brands/
│   │       ├── categories/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── reviews/
│   │       └── users/
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles, Tailwind imports, and CSS variables
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui atomic components
│   ├── layout/                   # Layout components (Header, Footer, Sidebar, etc.)
│   └── shared/                   # Cross-feature shared components
├── lib/                          # Core utilities
│   ├── api/                      # Axios instance, interceptors, API functions
│   ├── hooks/                    # Custom React hooks
│   └── utils/                    # Pure utility functions (e.g., formatting)
├── stores/                       # Zustand stores (e.g., auth-store, cart-store)
├── types/                        # Shared TypeScript types & interfaces
├── validations/                  # Zod schemas for frontend form validations
├── providers/                    # React context providers (QueryProvider, ThemeProvider)
├── spec/                         # Spec-Driven Development files (CONSTITUTION.md)
└── components.json               # shadcn/ui configuration
```

## ✨ Key Features & Implementations

### 1. Advanced Authentication & Security
- Secure JWT-based authentication using HTTP-only cookies for refresh tokens.
- Access tokens are stored securely in memory via **Zustand** (never in `localStorage`).
- Axios interceptors automatically handle silent token refreshes in the background without interrupting the user experience.
- Role-Based Access Control (RBAC) protecting all `(admin)` routes based on dynamic backend permissions.

### 2. Form Handling
- All forms are handled by **React Hook Form** for performance (minimizing re-renders).
- Strict client-side validation mirrored from the backend using **Zod**.

### 3. Server State & Caching
- **TanStack Query** manages all API interactions, providing automatic caching, background fetching, and optimistic updates.
- Aggressive caching for the public product catalog to ensure blazing fast navigation, with short stale times for user-specific data.

### 4. Luxury Design System
- Generous whitespace and a curated color palette (predominantly monochrome with a gold-orange accent).
- Sophisticated typography combining serif fonts (`Playfair Display`) for headings and sans-serif (`Inter`/`Geist`) for UI elements.
- Fluid, subtle animations using **Framer Motion** and **Tailwind Animate**.
- Fully responsive design engineered with Tailwind CSS.

### 5. Spec-Driven Development
This project is built using a strict Spec-Driven Development (SDD) workflow. Every architectural decision and standard is documented in `spec/CONSTITUTION.md`. 

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

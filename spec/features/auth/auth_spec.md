# Auth Feature — Specification (Updated)

> **Status:** ✅ Final — Ready for Implementation  
> **Feature:** Login, Register, Verify Email, Forgot/Reset Password, Splash Screen  
> **Roles Served:** Customer + Admin (same pages, role-based redirect)  
> **Last Updated:** 2026-08-19 (post-clarification)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Routes](#2-routes)
3. [Splash Screen](#3-splash-screen)
4. [AuthLayout — Split-Screen](#4-authlayout--split-screen)
5. [Login Page](#5-login-page)
6. [Register Page](#6-register-page)
7. [Register Success Page](#7-register-success-page)
8. [Verify Email Page](#8-verify-email-page)
9. [Forgot Password Page](#9-forgot-password-page)
10. [Reset Password Page](#10-reset-password-page)
11. [API Contracts](#11-api-contracts)
12. [State Management](#12-state-management)
13. [Zod Validation Schemas](#13-zod-validation-schemas)
14. [File Structure](#14-file-structure)
15. [Visual Reference](#15-visual-reference)

---

## 1. Overview

The Auth feature is the complete authentication flow for Shoezy. It serves both **Customer** and **Admin** roles through the same pages — role detection happens after login and determines the redirect destination.

**Included sub-features:**
- Splash screen on app load
- Login page (`/login`)
- Register page (`/register`)
- Register success page (`/register/success`)
- Email verification page (`/verify-email`)
- Forgot password page (`/forgot-password`)
- Reset password page (`/reset-password`)

---

## 2. Routes

| Route | Page Component | Auth Guard |
|---|---|---|
| `/login` | `LoginPage` | Redirect to `/` if already authenticated |
| `/register` | `RegisterPage` | Redirect to `/` if already authenticated |
| `/register/success` | `RegisterSuccessPage` | Public |
| `/verify-email` | `VerifyEmailPage` | Public |
| `/forgot-password` | `ForgotPasswordPage` | Public |
| `/reset-password` | `ResetPasswordPage` | Public |

All routes live under `app/(auth)/`.

---

## 3. Splash Screen

### 3.1 Behavior

- **Triggers:** Every time the app is opened/loaded in the browser (initial mount).
- **Shows:** Shoezy logo (`public/logo.png`) centered on a white background with a subtle fade-in animation.
- **Duration:** ~1.5 seconds, then fades out to reveal the actual page.
- **Implementation:** A `SplashScreen` Client Component rendered in the root `layout.tsx`. It overlays the full viewport (`fixed inset-0 z-[9999]`), shows the logo, then animates out using Framer Motion after a 1500ms delay.
- **No second splash on route changes** — only on hard page load/refresh (tracked via `sessionStorage` flag).

### 3.2 Design

| Element | Spec |
|---|---|
| Background | `#FFFFFF` (white) |
| Logo | `public/logo.png` centered, `w-32` or `w-40` |
| Animation | Fade in (200ms) → hold (1000ms) → fade out (300ms) |
| Exit | After fade-out, component unmounts and page content is visible |

### 3.3 Implementation

```tsx
// components/SplashScreen.tsx — 'use client'
// Use framer-motion AnimatePresence + motion.div
// useEffect: set sessionStorage flag after first show, skip on subsequent navigations
```

---

## 4. AuthLayout — Split-Screen

### 4.1 Layout Description

Inspired by the reference image (NOVRAYA-style luxury split screen):

```
┌──────────────────────┬──────────────────────────────┐
│                      │                              │
│   [Logo top-center]  │                              │
│                      │   LUXURY SHOE PHOTO          │
│   Form content       │   (full-height, object-cover)│
│   (white background) │                              │
│                      │                              │
│   [Footer links]     │                              │
└──────────────────────┴──────────────────────────────┘
```

- **Left panel:** White (`#FFFFFF`) background, generous padding, contains all form content.
- **Right panel:** Full-height luxury shoe image (generated craftsman/shoe photo), `object-cover`, hidden on mobile.
- **Mobile:** Right panel hidden. Left panel takes full width. Logo centered at top.
- **Layout split:** `50% / 50%` on desktop (`lg` and above), full-width on mobile.

### 4.2 Left Panel Structure (top-to-bottom)

1. **Logo** — `<Image src="/logo.png">` centered or left-aligned at top, links to `/`
2. **Page heading** — e.g., "Welcome Back" (serif, large)
3. **Subtitle** — e.g., "Sign in to access your Shoezy account." (sans-serif, muted)
4. **Form content** (varies per page)
5. **Bottom navigation link** — e.g., "Don't have an account? Sign up"

### 4.3 Right Panel

- Static or server-generated luxury shoe/craftsman image.
- Generated via `generate_image` tool before implementation.
- Stored in `public/auth-hero.jpg`.
- `alt=""` (decorative).
- `priority` load via `next/image`.

---

## 5. Login Page

### 5.1 URL
`/login`

### 5.2 Visual Design (reference: provided NOVRAYA image)

- Large serif heading: **"Welcome Back"**
- Subtitle: "Sign in to access your Shoezy account."
- Minimal form inputs (underline style or clean bordered)
- "Remember Me" checkbox (left) + "Forgot Password?" link (right) on same row
- Social buttons: Google button (outlined, with Google icon), Facebook button (outlined, with Facebook icon)
- Divider: "or" between social buttons and email/password form (or below social)
- Primary CTA: "SIGN IN" — solid black, full-width, uppercase
- Bottom link: "Don't have an account? **Join Shoezy**"

### 5.3 Fields

| Field | Input Type | ID | Required |
|---|---|---|---|
| Email | `email` | `login-email` | Yes |
| Password | `password` + show/hide toggle | `login-password` | Yes |
| Remember Me | `checkbox` | `login-remember` | No |

### 5.4 Behavior

1. Client-side validation via Zod on submit.
2. On submit: `POST /api/v1/auth/login`
3. On **success (200):**
   - Store `accessToken` in Zustand (memory only — never localStorage).
   - Store `user` object in Zustand.
   - Backend sets HTTP-only refresh cookie automatically.
   - **Role-based redirect:**
     - User has `ADMIN` role → redirect to `/admin`
     - User is `CUSTOMER` → redirect to `/`
4. On **error:**

| Error Code | User-facing message | Location |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | "Incorrect email or password." | Form-level (above form) |
| `AUTH_EMAIL_NOT_VERIFIED` | "Please verify your email. [Resend verification email →]" | Form-level with link |
| `AUTH_ACCOUNT_INACTIVE` | "This account has been deactivated. Contact support." | Form-level |
| `AUTH_RATE_LIMITED` | "Too many attempts. Please try again later." | Form-level |
| Generic 5xx | Toast: "Something went wrong. Please try again." | Toast |

### 5.5 Role Detection After Login

The backend `login` response returns the `user` object. Role detection:
```typescript
// After storing user in Zustand:
// Fetch /api/v1/users/me to get full user info including role
// OR: Check user.role from the login response
// Admin → push('/admin')
// Customer → push('/')
```

> **Note:** The login API response doesn't include `roleCodes`. After login, call `GET /api/v1/users/me` to verify role, OR rely on the legacy `user.role` field (`ADMIN` | `CUSTOMER`) returned in the login response for redirect only.

---

## 6. Register Page

### 6.1 URL
`/register`

### 6.2 Visual Design

- Large serif heading: **"Create Your Account"**
- Subtitle: "Join Shoezy for an exclusive luxury experience."
- Single-page form — all fields visible at once
- Two-column layout for some fields (First Name / Last Name side by side on desktop)
- Gender selector at top (styled toggle: Male / Female)
- Country — dropdown/select input
- Social auth section at the top (same as login): "Continue with Google" / "Continue with Facebook"
- Divider: "or register with email"
- Primary CTA: "CREATE ACCOUNT" — solid black, full-width
- Bottom link: "Already have an account? **Sign in**"

### 6.3 Fields

| Field | Input Type | ID | Required | Validation |
|---|---|---|---|---|
| Gender | Toggle (Male / Female) | `register-gender` | Yes | One of `male`, `female` |
| First Name | `text` | `register-first-name` | Yes | Min 1, max 100 chars |
| Last Name | `text` | `register-last-name` | Yes | Min 1, max 100 chars |
| Email | `email` | `register-email` | Yes | Valid email |
| Phone | `tel` | `register-phone` | No — labeled "(Optional)" | 7–32 chars if provided |
| Country | `select` | `register-country` | Yes | Valid country from list |
| Password | `password` + show/hide toggle | `register-password` | Yes | Min 12 chars, max 72 bytes |
| Confirm Password | `password` + show/hide toggle | `register-confirm-password` | Yes | Must match password |

> **Gender note:** The backend `User` model does not have a `gender` field — this is stored client-side for personalization preference or omitted from the API call. Only fields accepted by the backend are sent: `email`, `password`, `firstName`, `lastName`, `phone?`.

> **Country note:** Same as gender — not in the current backend User schema. Store locally in Zustand or include in a future profile update call. For now, collect and store in Zustand only.

### 6.4 Password Strength Indicator

Below the password field, show a dynamic strength bar:

| Strength | Condition | Color | Label |
|---|---|---|---|
| Weak | < 12 chars OR common pattern | `#DC2626` (red) | "Weak" |
| Fair | 12+ chars, mixed case or numbers | `#F59E0B` (amber) | "Fair" |
| Strong | 12+ chars, mixed case + numbers + special char | `#16A34A` (green) | "Strong" |

Strength logic runs on every keystroke (controlled input or `watch` from react-hook-form).

### 6.5 Behavior

1. Client-side validation on submit via Zod.
2. On submit: `POST /api/v1/auth/register` with `{ email, password, firstName, lastName, phone? }`
3. On **success (201):**
   - Redirect to `/register/success` page.
4. On **error:**

| Error Code | User-facing message | Location |
|---|---|---|
| `DUPLICATE_EMAIL` | "This email is already registered." | Inline on Email field |
| `DUPLICATE_PHONE` | "This phone number is already in use." | Inline on Phone field |
| `422` | Map `details` array to field errors | Per-field |
| Generic 5xx | Toast: "Something went wrong. Please try again." | Toast |

### 6.6 Navigation

- Link to `/login`: "Already have an account? **Sign in**"

---

## 7. Register Success Page

### 7.1 URL
`/register/success`

### 7.2 Design

Centered content on a white background (uses AuthLayout left panel, right panel hidden or still showing image):

- ✅ Success icon (large, green checkmark or envelope icon from lucide-react)
- Heading: **"Check Your Email"** (serif)
- Body: "We've sent a verification link to your email address. Click the link to activate your account."
- Resend button: "Resend verification email" (outlined button, triggers `POST /api/v1/auth/resend-verification`)
- Resend feedback: "Email sent!" shown after successful resend. Disable button for 60 seconds after sending.
- Link: "Back to Login →"

---

## 8. Verify Email Page

### 8.1 URL
`/verify-email?token=<token>`

### 8.2 Behavior

1. On mount: Extract `token` from URL query params.
2. If no token: Show "Invalid link" immediately.
3. If token present: Auto-call `POST /api/v1/auth/verify-email` with `{ token }`.
4. Show loading spinner while request is in-flight.
5. On **success:** Show "Email verified! Your account is ready." + "Go to Login" button.
6. On **error:**

| Error Code | Message Shown |
|---|---|
| `TOKEN_INVALID` | "This verification link is invalid or has expired." |
| `AUTH_TOKEN_EXPIRED` | "This link has expired." + "Request a new link →" button |
| `AUTH_TOKEN_USED` | "This link has already been used." + "Go to Login →" button |

---

## 9. Forgot Password Page

### 9.1 URL
`/forgot-password`

### 9.2 Visual Design

- Heading: **"Forgot Password?"**
- Subtitle: "Enter your email and we'll send you a reset link."
- Single field: Email
- CTA: "SEND RESET LINK" — solid black, full-width

### 9.3 Behavior

1. On submit: `POST /api/v1/auth/forgot-password`
2. **Always** show success message after submit (enumeration-safe, regardless of response):
   - "If an account exists with this email, you'll receive a reset link shortly."
3. Disable submit button for 30 seconds after sending (prevent spam clicks).

---

## 10. Reset Password Page

### 10.1 URL
`/reset-password?token=<token>`

### 10.2 Visual Design

- Heading: **"Set New Password"**
- Fields: New Password (with toggle + strength bar), Confirm Password (with toggle)
- CTA: "UPDATE PASSWORD" — solid black, full-width

### 10.3 Behavior

1. Extract `token` from URL on mount.
2. On submit: `POST /api/v1/auth/reset-password` with `{ token, newPassword }`.
3. On **success:** Show "Password updated successfully." + "Go to Login →" button.
4. On **error:**

| Error Code | Message Shown |
|---|---|
| `TOKEN_INVALID` | "This reset link is invalid." |
| `AUTH_TOKEN_EXPIRED` | "This link has expired." + "Request new link →" |
| `AUTH_TOKEN_USED` | "This link has already been used." |

---

## 11. API Contracts

### Register
```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName, phone? }
→ 201: { success: true, data: { id, email, firstName, lastName, provider, emailVerifiedAt } }
→ 409: DUPLICATE_EMAIL | DUPLICATE_PHONE
→ 422: Validation errors in details[]
```

### Login
```
POST /api/v1/auth/login
Body: { email, password }
→ 200: { success: true, data: { user: UserDto, accessToken: string } }
→ Sets HTTP-only refresh cookie (shoe_refresh)
→ 401: AUTH_INVALID_CREDENTIALS
→ 403: AUTH_EMAIL_NOT_VERIFIED | AUTH_ACCOUNT_INACTIVE
```

### Verify Email
```
POST /api/v1/auth/verify-email
Body: { token }
→ 200: { success: true, data: { ..., emailVerifiedAt: string } }
→ 401: TOKEN_INVALID | AUTH_TOKEN_EXPIRED | AUTH_TOKEN_USED
```

### Resend Verification
```
POST /api/v1/auth/resend-verification
Body: { email }
→ 202: Always (enumeration-safe)
```

### Forgot Password
```
POST /api/v1/auth/forgot-password
Body: { email }
→ 202: Always (enumeration-safe)
```

### Reset Password
```
POST /api/v1/auth/reset-password
Body: { token, newPassword }
→ 200: { success: true, data: { passwordReset: true } }
→ 401: TOKEN_INVALID | AUTH_TOKEN_EXPIRED | AUTH_TOKEN_USED
```

### Google OAuth
```
POST /api/v1/auth/google
Body: { idToken }
→ 200: Same as login response
→ 401: AUTH_GOOGLE_TOKEN_INVALID
→ 409: AUTH_SOCIAL_ACCOUNT_CONFLICT
→ 503: AUTH_GOOGLE_UNAVAILABLE
```

### Facebook OAuth
```
POST /api/v1/auth/facebook
Body: { accessToken }
→ 200: Same as login response
→ 401: AUTH_FACEBOOK_TOKEN_INVALID
→ 409: AUTH_SOCIAL_ACCOUNT_CONFLICT
→ 503: AUTH_FACEBOOK_UNAVAILABLE
```

---

## 12. State Management

### Zustand Auth Store (`stores/auth-store.ts`)

```typescript
interface UserDto {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'INACTIVE';
  provider: 'EMAIL' | 'GOOGLE' | 'FACEBOOK';
  role: 'ADMIN' | 'CUSTOMER';  // legacy field, used for redirect only
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
```

**Rules:**
- `accessToken` is stored in memory (Zustand state) **only** — never `localStorage` / `sessionStorage`.
- On app mount, call `POST /api/v1/auth/refresh` to rehydrate session from the HTTP-only cookie.
- `user.role` is used **only** for initial post-login redirect. Permission checks use the backend's RBAC system.

---

## 13. Zod Validation Schemas (`validations/auth.ts`)

```typescript
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  gender: z.enum(['male', 'female'], { required_error: 'Please select your gender' }),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7).max(32).optional().or(z.literal('')).transform(v => v || undefined),
  country: z.string().min(1, 'Please select your country'),
  password: z.string().min(12, 'Password must be at least 12 characters').max(72),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(12, 'Password must be at least 12 characters').max(72),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

---

## 14. File Structure

```
app/
└── (auth)/
    ├── layout.tsx                        # AuthLayout — split screen wrapper
    ├── login/
    │   └── page.tsx                      # LoginPage (Server Component shell)
    ├── register/
    │   ├── page.tsx                      # RegisterPage (Server Component shell)
    │   └── success/
    │       └── page.tsx                  # RegisterSuccessPage
    ├── verify-email/
    │   └── page.tsx                      # VerifyEmailPage
    ├── forgot-password/
    │   └── page.tsx                      # ForgotPasswordPage
    └── reset-password/
        └── page.tsx                      # ResetPasswordPage

components/
└── auth/
    ├── LoginForm.tsx                     # 'use client' — login form with all logic
    ├── RegisterForm.tsx                  # 'use client' — register form with all logic
    ├── ForgotPasswordForm.tsx            # 'use client'
    ├── ResetPasswordForm.tsx             # 'use client'
    ├── VerifyEmailContent.tsx            # 'use client' — auto-calls API on mount
    ├── RegisterSuccessContent.tsx        # 'use client' — resend logic
    ├── SocialAuthButtons.tsx             # 'use client' — Google + Facebook buttons
    ├── GenderToggle.tsx                  # 'use client' — Male/Female styled toggle
    ├── PasswordInput.tsx                 # 'use client' — password + show/hide toggle
    └── PasswordStrengthBar.tsx           # 'use client' — Weak/Fair/Strong indicator

components/
└── SplashScreen.tsx                     # 'use client' — full-viewport splash with logo

lib/
└── api/
    └── auth.ts                           # All auth API functions (axios)

stores/
└── auth-store.ts                         # Zustand auth store

validations/
└── auth.ts                               # All Zod schemas + inferred types

types/
└── auth.ts                               # UserDto, AuthState interfaces

public/
├── logo.png                              # ✅ Exists — Shoezy logo
└── auth-hero.jpg                         # Generated luxury shoe image (to be created)
```

---

## 15. Visual Reference

### Login Page Layout

```
┌──────────────────────────────────┬──────────────────────────────────┐
│  [logo.png]  (centered, top)     │                                  │
│                                  │                                  │
│  Welcome Back                    │   [Luxury shoe/craftsman image]  │
│  Sign in to access your...       │   full-height, object-cover      │
│                                  │                                  │
│  ┌──────────────────────────┐    │                                  │
│  │ Email                    │    │                                  │
│  └──────────────────────────┘    │                                  │
│  ┌──────────────────────────┐    │                                  │
│  │ Password              👁 │    │                                  │
│  └──────────────────────────┘    │                                  │
│                                  │                                  │
│  ☐ Remember Me   Forgot Pwd? →  │                                  │
│                                  │                                  │
│  [G] Continue with Google        │                                  │
│  [F] Continue with Facebook      │                                  │
│                                  │                                  │
│  ┌──────────────────────────┐    │                                  │
│  │        SIGN IN           │    │                                  │
│  └──────────────────────────┘    │                                  │
│                                  │                                  │
│  Don't have an account? Sign up  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

### Register Page Layout (same split, left panel form)

```
[logo] 
Create Your Account
Join Shoezy for an exclusive luxury experience.

[G] Continue with Google    [F] Continue with Facebook
────────────── or register with email ──────────────

[Male]  [Female]   ← Gender Toggle

[First Name]    [Last Name]
[Email]
[Phone (Optional)]
[Country ▼]
[Password 👁]
  ███░░ Fair
[Confirm Password 👁]

[      CREATE ACCOUNT      ]

Already have an account? Sign in
```

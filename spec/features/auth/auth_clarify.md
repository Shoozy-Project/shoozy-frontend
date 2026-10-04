# Auth Feature — Clarification

> **Status:** ✅ Answers Received — Spec Updated  
> **Feature:** Login & Register Pages  
> **Created:** 2026-08-19

---

## Instructions

Below are questions about the auth spec. Please answer each question.
After your answers, the spec (`auth_spec.md`) will be updated to reflect them,
and then the plan + tasks will be created.

---

## Questions

---

### Q1 — Auth Page Layout Style

What should the auth pages (login/register) look like visually?

**Options:**
- **A — Split Screen:** Left side = luxury brand visual (full-height image or pattern), Right side = form. Clean and modern.
- **B — Centered Card:** A white card centered on a light grey/white background. Minimal and elegant.
- **C — Full-Bleed Image:** Full background image with a semi-transparent overlay, form floats on top.
- **D — Other:** Describe your preferred layout.

**Your Answer:** **A — Split Screen** — Left: form on white background (like the reference image), Right: luxury shoe/craftsman photo.

---

### Q2 — Visual Content on Auth Pages

If you choose A or C above, what should the visual side show?

**Options:**
- **A — A luxury shoe/product photo** (I will generate one)
- **B — A clean brand pattern** (geometric, abstract — luxury feel)
- **C — Solid color** using the brand palette (e.g., deep black or gold-orange)
- **D — Brand tagline + logo** on dark/black background
- **E — Other:** Describe

**Your Answer:** **A — Luxury shoe/product photo** (reference image shows a craftsman polishing a shoe — generate a similar high-end image).

---

### Q3 — Social Authentication

Should the login and register pages show social sign-in buttons?

**Options:**
- **A — Yes, both Google and Facebook**
- **B — Yes, Google only**
- **C — No social auth** — email/password only

**Your Answer:** **A — Yes, both Google and Facebook.**

---

### Q4 — Register Form Layout

How should the register form present its fields?

**Options:**
- **A — Single page, all fields visible at once** (First Name, Last Name, Email, Phone, Password, Confirm Password)
- **B — Two steps:** Step 1: Name + Email + Phone, Step 2: Password + Confirm Password
- **C — Three steps:** Step 1: Name, Step 2: Contact (email/phone), Step 3: Password

**Your Answer:** **A — Single page, all fields at once.** Fields: Gender (Male/Female toggle), First Name, Last Name, Email, Phone (optional), Password, Confirm Password, Country.

---

### Q5 — Phone Field on Register

The phone number field is optional in the backend. How should it appear on the register form?

**Options:**
- **A — Show it** as an optional field with a label "(Optional)"
- **B — Hide it** — don't show phone during registration, let users add it later in profile settings

**Your Answer:** **A — Show it** as an optional field labeled "(Optional)".

---

### Q6 — Admin Login

Should admin users use the **same** `/login` page as customers, or have a **separate** `/admin/login` route?

**Options:**
- **A — Same `/login` page** — after login, redirect based on role (admin → `/admin`, customer → `/`)
- **B — Separate `/admin/login`** — a distinct, minimal admin login page at its own URL

**Your Answer:** **A — Same `/login` page.** After login redirect by role: Admin → `/admin`, Customer → `/`.

---

### Q7 — "Remember Me" Option

Should the login form have a "Remember me" or "Stay signed in" checkbox?

> Note: The backend's refresh token already lasts 30 days by default regardless. This would be a UI-level indicator only (no functional change to session lifetime unless the backend supports it).

**Options:**
- **A — Yes, show it** (UI-only, cosmetic)
- **B — No, omit it**

**Your Answer:** **A — Yes, show it** (UI-only / cosmetic).

---

### Q8 — Password Strength Indicator

Should the register form show a visual password strength indicator as the user types?

**Options:**
- **A — Yes** — show a strength bar (Weak / Fair / Strong) below the password field
- **B — No** — just show the min 12 characters requirement hint

**Your Answer:** **A — Yes** — show a strength bar (Weak / Fair / Strong) below the password field.

---

### Q9 — After Successful Registration

After a user successfully registers, what should happen?

**Options:**
- **A — Stay on register page**, replace the form with a success message: "Check your email to verify your account." + resend button
- **B — Redirect to a dedicated `/register/success` page** with the same message
- **C — Redirect to `/login`** with a toast: "Account created! Check your email."

**Your Answer:** **B — Redirect to `/register/success`** page with success message + resend button.

---

### Q10 — After Successful Login

After a customer successfully logs in, where should they go?

**Options:**
- **A — Redirect to `/`** (homepage) always
- **B — Redirect to the page they came from** (if `?redirect=` param exists), otherwise `/`
- **C — Redirect to `/account/profile`** (their account page)

**Your Answer:** Customer → `/` (homepage). Admin → `/admin` (dashboard).

---

### Q11 — Shoezy Logo on Auth Pages

What should the logo/brand name look like on auth pages?

**Options:**
- **A — Text logo only:** "SHOEZY" in large serif font
- **B — Image logo** (do you have a logo file? If not, I'll create one)
- **C — Text + tagline:** "SHOEZY" + a short luxury tagline below it

**Your Answer:** **B — Image logo** from `public/logo.png` (confirmed to exist).

---

## Answers Summary

| Q | Question | Answer |
|---|---|---|
| Q1 | Auth page layout style | Split-screen (form left, photo right) |
| Q2 | Visual content | Luxury shoe/craftsman photo (generated) |
| Q3 | Social auth | Yes — Google + Facebook |
| Q4 | Register form layout | Single page, all fields: Gender, First Name, Last Name, Email, Phone (optional), Password, Confirm Password, Country |
| Q5 | Phone field | Show as optional |
| Q6 | Admin login | Same `/login` page, redirect by role |
| Q7 | Remember me | Yes (UI only) |
| Q8 | Password strength | Yes — Weak/Fair/Strong bar |
| Q9 | After registration | Redirect to `/register/success` page |
| Q10 | After login | Customer → `/`, Admin → `/admin` |
| Q11 | Logo on auth pages | Image logo from `public/logo.png` |
| Q12 | Splash screen | Show logo splash on every page load / first open |

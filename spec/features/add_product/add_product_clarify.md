# Add Product Feature — Clarification

> **Status:** ✅ Answers Proposed — Ready for Review  
> **Feature:** Add Product Page  
> **Created:** 2026-08-20  

---

## Questions & Proposed Answers

### Q1 — Options & Variants Generation
How should options and variants be input?
- **Option A (Recommended):** Dynamic variant matrix. The admin defines options (e.g., Size: `40, 41` and Color: `Black, White`) and the system automatically generates a table of variants (`Black / 40`, `Black / 41`, `White / 40`, `White / 41`) where the admin sets price and stock.
- **Option B:** Static variants. The admin manually adds variants one by one, typing out name, price, stock, and SKU.

**Proposed Answer:** **Option A**. This matches professional Shopify/Next.js Commerce workflows and prevents manual entry errors.

---

### Q2 — Categories and Brands Dropdowns
Should categories and brands be fetched dynamically from the database or fall back to mock lists?
- **Proposed Answer:** Fall back to the active Categories and Brands lists (`Nike`, `Adidas` etc. for Brands; `Sneakers`, `Boots` etc. for Categories) with a fallback to type custom ones if the backend database is empty. This guarantees a seamless developer/client test environment.

---

### Q3 — Image Media Input
How should product image files be handled?
- **Proposed Answer:** A visual drag-and-drop file preview zone using custom React states. We will show local preview thumbnails when files are chosen, and allow admins to add external image URL links.

---

### Q4 — Price Formatting in TND
How should inputs for prices behave relative to millimes?
- **Proposed Answer:** The input field shows regular Dinar units (e.g., `129.99` TND). Upon submitting the form, the values are automatically converted to millimes (multiplied by 1000) for variant payloads.

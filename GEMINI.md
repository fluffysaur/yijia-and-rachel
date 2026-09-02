# Project Guidelines: Yi Jia & Rachel Wedding Website

This project follows specific design system invariants and verification rules.

## Core Rules

1. **4px Design Grid**:
   - All Tailwind spacing, sizing, and typography tokens must align strictly with a 4px grid (multiples of 4px; 0, 1, 2px permitted for fine borders).
   - Never introduce fractional classes like `py-1.5` or font-sizes like `0.875rem` (14px).
   - Test suite: `npx vitest run src/lib/designGrid.test.ts`.

2. **Aesthetic & Stationery Styling**:
   - **Border Geometry**: Avoid bubbly SaaS-style rounded corners (`rounded-lg`, `rounded-xl`, `rounded-2xl`). Favor crisp luxury editorial geometry: micro-radii (`rounded-xs` / 2px or `rounded-none`), fine hairlines (`border-taupe/15` to `border-taupe/20`), and subtle letterpress/matting frame details.
   - **Editorial Over Clichés**: Avoid generic decorative icons (e.g. heart icons in content sections). Favor editorial typography (Roman numerals, hairline dividers, italic serif quotes).
   - **Control Alignment**: Companion controls, icon buttons, and action buttons in the same container (e.g. navbar logout, hamburger, RSVP) must share identical height tokens (`size-11` / `min-h-11` = 44px on the 4px grid).

3. **Typography & Readability Standards**:
   - **Hero Headline**: The couple's names (*"Yi Jia & Rachel"*) in the hero use elegant cursive calligraphy (`font-script` / Pinyon Script) with `leading-tight` to avoid clipping flourishes.
   - **Headings & Titles**: Use high-contrast serif (`font-display` / Cormorant Garamond).
   - **Body Text Standard**: All narrative body paragraphs, card details, FAQ answers, and Q&A text must be standardized to **16px (`text-base`)** with `leading-relaxed`.
   - **Text Contrast**: Maintain strong legibility against ivory/cream backgrounds using deep charcoal (`text-ink/80` or `text-ink`) rather than light/muted taupe.

4. **Admin & Dashboard Stationery Suite**:
   - **Visual Language**: Administrative dashboards and management suites must match the wedding stationery aesthetic: high-contrast Cormorant Garamond serif headings, double-hairline matting frames (`before:pointer-events-none before:absolute before:inset-2 before:border before:border-taupe/10`), micro-radii (`rounded-xs`), and subtle cream hover highlights.
   - **Editorial Ledger Tables**: Tables must feature uppercase tracked headers (`text-xs font-semibold uppercase tracking-[0.16em] text-taupe`), clean hairline dividers, and high-contrast charcoal cell text (`text-ink` or `text-ink/80`) rather than muted taupe.
   - **Stationery Form Controls**: Inputs, selects, textareas, and modal cards use micro-radii (`rounded-xs`), hairline borders (`border-taupe/20`), and subtle cream matting (`bg-cream/30 border border-taupe/15`).

5. **Gallery & Media**:
   - All preview images in the gallery must be full-bleed `object-cover` without borders or background letterboxing.
   - Paired row items must have matching height classes across responsive breakpoints.
   - Button text should be "View gallery".

6. **Hero-Scoped Ambient Animations**:
   - Particle/canvas ambient animations (falling petals or leaves) are confined to the Hero section to keep reading sections legible.
   - Must respect `prefers-reduced-motion`.

7. **Verification**:
   - Always run `npm test -- --run` and `npm run build` before completing work.

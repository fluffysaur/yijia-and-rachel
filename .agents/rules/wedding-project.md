# Wedding Project Guidelines (`yijia-and-rachel`)

## 1. 4px Design Grid Invariant
- Every Tailwind spacing (`p-`, `m-`, `gap-`), dimension (`h-`, `w-`, `size-`), and typography size (`text-`) must resolve strictly to a multiple of 4px (or allowed fine values: 0px, 1px, 2px).
- **Prohibited**: Fractional Tailwind classes like `py-1.5` (6px), `h-7` (28px vs 24/32), or non-grid font sizes like `0.875rem` (14px).
- Always verify compliance by running `npx vitest run src/lib/designGrid.test.ts`.

## 2. Gallery & Media Layout
- Image preview grids must be full-bleed (`object-cover`) with zero letterbox borders, zero padding that reveals background containers, and no empty white letterboxing.
- Paired grid tiles in the same row must share explicit, matching height breakpoints (e.g., `sm:h-115 lg:h-135`).
- Action button copy: use clean, concise labels (e.g., "View gallery" instead of "View all 29 photos").

## 3. Ambient Effects & Animations
- Ambient animations (such as falling petals or leaves) must be constrained exclusively to the Hero section to avoid distracting from reading content (Story, Events, FAQs).
- Always respect `prefers-reduced-motion` and pause render loops when the browser tab is hidden.

## 4. Verification Workflow
- Before declaring UI or code changes complete, always execute:
  1. `npm test -- --run`
  2. `npm run build`

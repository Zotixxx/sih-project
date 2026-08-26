---
name: MetriX Design System
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1440px
  sidebar-width: 260px
  gutter: 24px
---

## Brand & Style

The design system is engineered for the high-stakes environment of legal metrology, where precision, regulatory compliance, and public trust are paramount. It adopts a **Corporate / Modern** style that merges the efficiency of high-end enterprise SaaS with the accessibility and stability of modern government digital services.

The aesthetic is intentionally restrained, focusing on high-density information management without sacrificing legibility. It utilizes a "safe" visual identity—relying on the Inter typeface and a structured layout to evoke a sense of institutional permanence. The emotional response is one of clarity and confidence; the UI disappears to let the data, certifications, and legal workflows take center stage. 

Visual attributes include:
- **Utilitarian Precision:** Every pixel serves a functional purpose, utilizing a strict 4px grid.
- **Institutional Authority:** A palette anchored in deep navies and slate neutrals.
- **Measured Confidence:** Use of semantic signaling (Success, Warning, Error) that is clear but never alarming.

## Colors

This design system utilizes a sophisticated, high-contrast palette designed for long-session endurance and immediate recognition of status.

- **Primary & Neutrals:** The foundation is built on `#0F172A` (Slate 900), providing a heavy "anchor" for navigation and headers. Backgrounds utilize `#F8FAFC` to minimize eye strain while maintaining a crisp, clean appearance.
- **Semantic Logic:** Status colors are high-chroma but used sparingly. 
    - **Emerald Green** is reserved for valid certifications and successful verifications.
    - **Amber** signifies pending inspections or items requiring administrative attention.
    - **Rose Red** is strictly for expired certificates, failed inspections, or critical system errors.
- **Interactive States:** Hover states should shift the primary blue toward a slightly lighter slate (`#1E293B`) rather than a vibrant blue, maintaining the professional tone.

## Typography

The typography system is purely functional, leveraging **Inter** for its exceptional legibility in data-heavy interfaces. 

- **Hierarchy:** We use a tight scale where `body-md` (14px) is the workhorse size for all form inputs and table data.
- **Labels:** Small, uppercase labels (`label-sm`) are used for table headers and section titles to differentiate structural elements from user data.
- **Monospace:** For certificate numbers, tracking IDs, and technical measurements, a secondary monospace font is used to ensure character distinction (e.g., distinguishing '0' from 'O').
- **Mobile Scaling:** For mobile viewports, `display-lg` should downscale to 28px, and `headline-lg` to 22px to ensure content remains readable without excessive scrolling.

## Layout & Spacing

The design system employs a **Fixed-Fluid Hybrid Grid**. The main dashboard area uses a 12-column grid with 24px gutters, constrained to a maximum width of 1440px to ensure line lengths remain readable on ultra-wide monitors.

- **The Sidebar:** A persistent left-hand navigation (260px) anchors the experience. On tablet devices, this collapses into an icon-only rail (72px).
- **The Worksurface:** Content is organized into cards or "slabs" that sit on the `#F8FAFC` background. These slabs use `md` (16px) or `lg` (24px) padding depending on the density of the data.
- **Rhythm:** We adhere to a strict 4px baseline. All heights for buttons, inputs, and rows are multiples of 8px (e.g., 32px, 40px, 48px).

## Elevation & Depth

To maintain a "government-grade" aesthetic, the system avoids dramatic shadows or glass effects. Depth is communicated primarily through **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Level 0 (Background):** `#F8FAFC` — The base layer.
2.  **Level 1 (Slabs/Cards):** White background with a 1px border of `#E2E8F0`. No shadow is used for static elements.
3.  **Level 2 (Interactive/Floating):** Used for dropdowns and tooltips. These utilize a very subtle, diffused shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`.
4.  **Level 3 (Modals):** A centered modal with a slightly heavier shadow and a backdrop overlay of `#0F172A` at 40% opacity to focus user attention on the task at hand.

## Shapes

The shape language is "Soft" (Level 1), utilizing a 4px (0.25rem) corner radius for most UI components. This provides a modern touch without appearing overly "bubbly" or consumer-oriented.

- **Standard Elements:** Buttons, Inputs, and Cards use `rounded` (4px).
- **Larger Containers:** Complex data sections or modals may use `rounded-lg` (8px) to soften the large visual mass.
- **Status Badges:** Use a slightly higher roundedness (`rounded-full`) to differentiate them from interactive buttons.

## Components

### Buttons & Inputs
- **Primary Button:** Solid `#0F172A` background, white text, 4px radius. 
- **Secondary/Ghost:** 1px `#E2E8F0` border, `#334155` text.
- **Inputs:** 1px `#E2E8F0` border, `14px` text. On focus, the border shifts to the primary navy with a subtle 2px outer ring of the same color at 10% opacity.

### Data Tables
- **Header:** Light slate background (`#F1F5F9`), uppercase `label-sm` text.
- **Rows:** 48px minimum height, 1px bottom border. Hover state uses a subtle `#F8FAFC` highlight.
- **Density:** Provide a "Condensed" toggle that reduces row height to 40px for power users.

### Status Badges
- **Visuals:** Use a "Soft Palette" approach. For example, a Success badge has a background of `#D1FAE5` (Emerald 100) and text of `#065F46` (Emerald 800). This ensures high legibility and a professional look.

### Specialized Components
- **QR Code Certificate:** A Level 1 slab containing a high-contrast QR code, the MetriX logo, and a "Verification Date" timestamp.
- **Metric Cards:** Large `title-lg` value with a `label-sm` caption. Trend indicators (up/down arrows) use the semantic success/error colors.
- **Progress Indicators:** A horizontal stepper for multi-step verification filings. Completed steps use a solid primary blue circle; current steps use a blue ring.
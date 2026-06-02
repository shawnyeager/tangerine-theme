---
name: tangerine-theme
description: Shared design-system foundation for shawnyeager.com, shawnyeager-share, and gtm-map. Tinted neutrals, one earned accent, Satoshi/Inter, flat chrome. This is the canonical token layer; consuming projects reference it and document only their deltas.
colors:
  trust-revolution-orange: "light-dark(#d63900, #FF5733)"
  trust-revolution-orange-hover: "light-dark(#bf3300, #FF6B47)"
  text-primary: "light-dark(#1a1a1a, #f2f2f2)"
  text-secondary: "light-dark(#444444, #dadada)"
  text-meta: "light-dark(#666666, #a5a5a5)"
  text-subtle: "light-dark(#767676, #737b85)"
  text-bold: "light-dark(#1a1a1a, #ffffff)"
  text-on-brand: "light-dark(#ffffff, #151b23)"
  highlight-bg: "light-dark(#fef3cd, #232932)"
  border-color: "light-dark(#d5d5d5, #32363a)"
  background-body: "light-dark(#fdfcfa, #151b23)"
  background-card: "light-dark(#f5f5f5, #1d232c)"
typography:
  display:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.05em"
rounded:
  sm: "2px"
  interactive: "4px"
  md: "8px"
  none: "0"
spacing:
  3xs: "2px"
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.trust-revolution-orange}"
    textColor: "{colors.text-on-brand}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-ghost-muted:
    backgroundColor: "transparent"
    textColor: "{colors.text-meta}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  input-email:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 0"
---

# Design System Foundation: tangerine-theme

This is the **canonical, shared foundation** for every site that imports tangerine-theme:
`shawnyeager.com`, `shawnyeager-share`, and `gtm-map` (which syncs the tokens manually, as it
is a Next.js app rather than a Hugo consumer). Token values here are implemented in
`assets/css/_tokens.css` — that file is the machine source of truth; this document is the
human one. Keep the two in lockstep.

Consuming projects do **not** copy this document. Their own `DESIGN.md` opens with a one-line
pointer back to this file and then documents only what they add or override (their deltas).
Anything genuinely shared belongs here, not in a site doc.

## 1. Overview

### Creative North Star: "Calibrated, not decorated."

The system is a precision instrument shared across a reading site, a private portal, and a
diagnostic tool. The neutrals are tinted so nothing feels sterile; the typography carries the
hierarchy so no decoration has to; the single accent earns its presence by being rare. Structure
recedes so content advances. Every consumer inherits this posture before it adds anything of
its own.

**Key characteristics:**
- Tinted-neutral palette: warm in light mode, cool blue-charcoal in dark mode. Never pure black or white.
- One earned accent (Trust Revolution Orange) on ≤10% of any surface.
- Two-font hierarchy: Satoshi (geometric) for structure and UI, Inter (humanist) for prose.
- Light and dark via CSS `light-dark()` and `color-scheme`. Never duplicate stylesheets.
- Flat chrome; a single tier of content elevation. Depth from tint and hairline borders, not shadow.
- WCAG 2.1 AA contrast as a baseline, verified in both modes.
- Motion limited to focus, hover, and instant feedback. Never layout-property animation.

## 2. Colors

A tinted-neutral palette anchored by a single accent.

### Primary

- **Trust Revolution Orange** (`#d63900` light / `#FF5733` dark): The brand bar, the home-square logo, the filled primary CTA, the link hover color, the focus-ring outline. Used on roughly 10% of any surface and never more. WCAG AA verified against both backgrounds.
- **Trust Revolution Orange (Hover)** (`#bf3300` light / `#FF6B47` dark): Hover state for the filled primary button and link treatments. One tier darker in light, one tier lighter in dark.

### Neutral

- **Reading Body / Primary** (`#1a1a1a` light / `#f2f2f2` dark): Headings, lead text, the canonical foreground.
- **Reading Secondary** (`#444444` light / `#dadada` dark): Body paragraphs, descriptions, secondary information. The default body color.
- **Reading Meta** (`#666666` light / `#a5a5a5` dark): Dates, timestamps, footer nav. Carries information without competing with the writing.
- **Reading Subtle** (`#767676` light / `#737b85` dark): Placeholder text, disabled states.
- **Bold/Strong** (`#1a1a1a` light / `#ffffff` dark): Bold/strong emphasis. Shifts to pure white in dark for extra emphasis on a darker surface.
- **Manuscript Cream** (`#fdfcfa` light): Page background in light mode. A warm off-white tinted toward the brand hue. Pure white feels clinical; this feels like paper.
- **Press Charcoal** (`#151b23` dark): Page background in dark mode. A cool blue-charcoal in the GitHub-dark family (hue ~256°, chroma committed, not washed out). Body weight lifts to 325 (from 300) in dark mode to compensate for the lower-contrast surface.
- **Card Surface** (`#f5f5f5` light / `#1d232c` dark): The only secondary surface in the system. Used sparingly. The dark value sits one lightness step above the page background in the same blue-charcoal hue.
- **Hairline Border** (`#d5d5d5` light / `#32363a` dark): The single border color. A half-opacity variant (`--border-subtle`) is the default for dividers.
- **Highlight Mark** (`#fef3cd` light / `#232932` dark): The `<mark>` background. Soft yellow in light, cool charcoal in dark.
- **On-Brand Text** (`#ffffff` light / `#151b23` dark): Text on top of a Trust Revolution Orange background (the filled primary button). The dark value tracks `--background-body` so the label reads as the page color punched out of the orange.

### Named Rules

**The 90/10 Rule.** Trust Revolution Orange is used on no more than 10% of any rendered surface: the brand bar, the home-square, one filled CTA, link/focus accents. If the orange feels loud, the page has too much; remove until it punches again.

**The Tinted-Neutral Rule.** No `#000` or `#fff` anywhere. Every neutral carries a faint cast: warm in light mode (toward the brand hue), cool in dark mode (a blue-charcoal in the GitHub-dark family). Pure black and white feel like defaults; a chosen cast feels intentional. Each mode commits to its own direction.

**The Light-Dark Rule.** Mode switching is handled exclusively through CSS `light-dark()` and the `color-scheme` property. Never duplicate stylesheets. Never hardcode mode-specific values outside `_tokens.css`. A manual override (`html[data-theme="light|dark"]`) flips `color-scheme`; everything else follows.

## 3. Typography

**Display Font:** Satoshi (variable, 300–900) with `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` fallback.
**Body Font:** Inter (variable, 100–900, italic) with the same fallback.
**Mono Font:** system stack only (SF Mono / Monaco / Cascadia Code / Roboto Mono / Consolas / Courier New).

**Character:** Satoshi is geometric and modern, used for structure and UI. Inter is humanist and readable, used for long-form prose. The pairing creates hierarchy by font choice as well as size.

The base size is fluid: `clamp(1rem, 0.965rem + 0.15vw, 1.09rem)` (16px → 17.5px). The scale follows a Perfect Fourth ratio (1.333).

### Hierarchy

- **Display** (Satoshi, 600, 56px / 40px mobile, line-height 1.15, tracking -0.03em): Hero use only.
- **Headline** (Satoshi, 600, 32px, line-height 1.3, tracking -0.025em): Default H1.
- **Title** (Satoshi, 600, 24px, line-height 1.3, tracking -0.02em): H2 / section headings.
- **Body** (Inter, 300, fluid 16–17.5px, line-height 1.5, tracking -0.01em): The reading body. Line length capped at ~65–75ch. Weight steps to 325 in dark mode.
- **Label** (Satoshi, 500, 14px, tracking +0.05em): Section labels, small UI text, ghost buttons.

### Named Rules

**The Two-Font Rule.** Satoshi for structure (headings, nav, UI labels, buttons). Inter for prose (body, lists, blockquotes, captions). Never mix within an element; the contrast carries the hierarchy.

**The Tight-Tracking Rule.** Headings use negative tracking (-0.02em to -0.03em) for optical density; body uses -0.01em. Wide tracking (+0.05em) is reserved for labels and small uppercase. Never mix tracking strategies within one element.

## 4. Elevation

Flat by default, with **one tier of content elevation**. Page chrome (header, footer, nav, body) carries no shadow; depth is implied through tinted backgrounds and hairline borders. The single shadow vocabulary is reserved for content images.

- **Content Lift** (`0 1px 3px rgba(0,0,0,0.15)` light, adjusted for dark in `main.css`): Content images via the `{{< image >}}` shortcode. Token: `--shadow-content-light`.
- **Button Emphasis Ring** (`inset 0 0 0 1px var(--brand-orange-hover)`): Ghost-button hover. A 1px thicken with no layout shift. Token: `--shadow-button-emphasis`.

No `text-shadow`, glow, glassmorphism, or `backdrop-filter` anywhere. Drop-shadows on UI are forbidden.

### Named Rules

**The Flat-Chrome Rule.** Chrome is flat. Depth comes from tinted backgrounds (`--background-card`) and hairline borders, not elevation.

**The Content-Only-Lift Rule.** Shadows belong to content (images), not interface. UI separation uses a border or a tinted background; never invent a new shadow level.

## 5. Components (shared chrome)

These ship from the theme and render identically across every consumer. Sites add their own components in their own `DESIGN.md`; they do not redefine these.

### Brand Bar
A 3px-tall fixed strip of Trust Revolution Orange across the top of the viewport (z-index 9999). On reading pages it doubles as a scroll-progress indicator. The bar is the entire visual identity above the content; no wordmark needed.

### Home Square
A 24px solid orange square in the header, anchoring the home link. Hover steps opacity from 100% to 85%. The smallest possible logo that still functions as one.

### Buttons
Two voices: a single filled primary (loud) and a small set of ghost variants (quiet).
- **Primary** (`.btn-primary`): Orange background, on-brand text, Satoshi 500, square corners, padding 12px 24px, a trailing `→` that nudges 3px on hover. Background shifts to hover-orange via `--transition-instant`. Conversion CTA only.
- **Ghost-Muted** (`.btn-ghost--muted`): Transparent, meta-colored border and text, 2px corners. Border and text shift to orange on hover. The quiet voice (e.g. newsletter signup).
- **Ghost-Primary** (`.btn-ghost--primary`): Transparent, orange border and text, square corners. Inset emphasis ring thickens the border 1px on hover.

### Email Input
Underline-only (no box): `border-bottom` hairline, padding 8px 0, body font at the small label size. On focus the bottom border switches to orange. Used in the footer signup where enabled (`show_email_signup`).

## 6. Do's and Don'ts (universal)

These apply to every consumer. Sites add register-specific rules in their own doc.

### Do
- **Do** flow every visual value through the tokens in `assets/css/_tokens.css`. Comments may reference token names, never pixel values.
- **Do** use Satoshi for headings/nav/labels/buttons and Inter for body/lists/blockquotes/captions.
- **Do** use `light-dark()` and `color-scheme` for all theme-aware values.
- **Do** keep Trust Revolution Orange to ≤10% of any surface.
- **Do** use the existing transition tokens: `--transition-instant` (0.15s), `--transition-fast` (0.3s), `--transition-base` (0.4s).
- **Do** ship variable fonts with `font-display: optional` and preload them. Layout shift is not acceptable.
- **Do** verify WCAG AA contrast for any new color pairing in both modes.

### Don't
- **Don't** use `#000` or `#fff` anywhere. The neutrals are tinted: warm in light, cool blue-charcoal in dark.
- **Don't** hardcode pixel values, hex colors, or font weights. If a value lacks a token, ask before creating one.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored stripe accent. Use full borders, leading numbers, or nothing.
- **Don't** apply `background-clip: text` with a gradient. Gradient text is forbidden; emphasis comes from weight, size, or color.
- **Don't** invent new shadow levels. The system has Content Lift and Button Emphasis Ring.
- **Don't** use gradient heroes, hero-metric templates, feature-card grids, or glassmorphism.
- **Don't** add scroll-driven animations, parallax, view transitions, or fade-ins.
- **Don't** use em dashes anywhere in copy. Commas, colons, semicolons, periods, parentheses only.

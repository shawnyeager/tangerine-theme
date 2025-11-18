# Design System Specification
## shawnyeager.com & notes.shawnyeager.com
### Version 2.4 - November 2025

---

## Overview

This document defines the complete design system for both shawnyeager.com (professional site) and notes.shawnyeager.com (personal notes). Both sites share the same visual design system but with different configurations for content and behavior.

**All colors in this specification are WCAG AA compliant and Lighthouse-tested.**

---

## Brand Identity

### Trust Revolution Orange

**Primary Brand Color:**
- Implementation: `#d63900` (light mode) / `#FF5733` (dark mode)
- Original brand: `#F84200` (Trust Revolution podcast)
- Adjusted for WCAG AA compliance (4.5:1 minimum contrast)
- Usage: Links, CTAs, accents, brand bar

**Color Variations:**

**Light Mode:**
- Primary: `#d63900`
- Hover: `#bf3300`

**Dark Mode:**
- Primary: `#FF5733`
- Hover: `#FF6B47`

**Application Principle:** Sparingly. 90% neutral (black/white/gray), 10% orange accent.

---

## Favicon Design

### Philosophy

Two distinct favicons reinforce the gallery/workshop distinction:

**shawnyeager.com (The Gallery):**
- Solid filled square in Trust Revolution Orange (#F84200)
- Metaphor: Complete, finished, polished work
- 32×32px with 2px margin

**notes.shawnyeager.com (The Workshop):**
- Outlined square in Trust Revolution Orange (#F84200)
- Metaphor: Open, evolving, work in progress
- 32×32px, 4px stroke weight

### Technical Specifications

**Both favicons:**
- Primary color: #F84200 (visual brand, not text)
- SVG source files provided
- Generate .ico at 32×32 and 16×16
- Maintain 2px margin on filled version
- Maintain 4px stroke on outlined version

**Browser display:**
At 16×16 (actual tab size), both remain clearly distinguishable while maintaining the gallery/workshop metaphor.

**Files:**
- `favicon-com.svg` - Source for .com
- `favicon-notes.svg` - Source for notes.shawnyeager.com
- `favicon-comparison.html` - Visual reference

**Usage:**
```
shawnyeager.com/static/favicon.ico (generated from favicon-com.svg)
notes.shawnyeager.com/static/favicon.ico (generated from favicon-notes.svg)
```

### Implementation Notes

**Generating .ico files:**

Option 1: Online converter (recommended)
- Upload SVG to https://realfavicongenerator.net/
- Download generated files
- Place in static/ directory

Option 2: ImageMagick
```bash
convert favicon-com.svg -resize 32x32 static/favicon-32x32.png
convert favicon-com.svg -resize 16x16 static/favicon-16x16.png
convert favicon-com.svg static/favicon.ico
```

**Verification:**
- Test in Chrome, Firefox, Safari
- Verify at 16×16 display size
- Confirm distinction between .com (solid) and .notes (outlined)
- Check both light and dark browser themes

---

## Color System

### Light Mode (White Background: #FFFFFF)

**Text Colors:**
| Element | Hex | Contrast | Usage |
|---------|-----|----------|-------|
| Body text | `#1a1a1a` | 16.1:1 ✓ | Main content, essay body, headings |
| Secondary text | `#555555` | 6.4:1 ✓ | Bio, descriptions, now page content |
| Tertiary text | `#555555` | 6.4:1 ✓ | Topic tags (interactive elements) |
| Meta text | `#666666` | 5.7:1 ✓ | Dates, footer, reading time, "Updated" |
| Subtle labels | `#767676` | 4.5:1 ✓ | Section headers like "BROWSE BY TOPIC" |

**UI Colors:**
| Element | Hex | Usage |
|---------|-----|-------|
| Borders | `#e5e5e5` | Navigation border, footer border, dividers |
| Backgrounds | `#fafafa` | Podcast box, bio boxes on media page |

**Brand/Interactive:**
| Element | Hex | Contrast | Usage |
|---------|-----|----------|-------|
| Links/CTAs | `#d63900` | 6.5:1 ✓ | All interactive text elements |
| Hover | `#bf3300` | 7.0:1 ✓ | Link hover state |

### Dark Mode (Background: #2a2a2a)

**Text Colors:**
| Element | Hex | Contrast | Usage |
|---------|-----|----------|-------|
| Body text | `#e8e8e8` | 12.6:1 ✓ | Main content, essay body, headings |
| Secondary text | `#d0d0d0` | 9.4:1 ✓ | Bio, descriptions, now page content |
| Tertiary text | `#aaaaaa` | 6.0:1 ✓ | Topic tags (interactive elements) |
| Meta text | `#999999` | 4.9:1 ✓ | Dates, footer, reading time, "Updated" |
| Subtle labels | `#a0a0a0` | 5.5:1 ✓ | Section headers like "BROWSE BY TOPIC" |

**UI Colors:**
| Element | Hex | Usage |
|---------|-----|-------|
| Borders | `#404040` | Navigation border, footer border, dividers |
| Card backgrounds | `#333333` | Podcast box, bio boxes on media page |

**Brand/Interactive:**
| Element | Hex | Contrast | Usage |
|---------|-----|----------|-------|
| Links/CTAs | `#FF5733` | 6.9:1 ✓ | All interactive text elements |
| Hover | `#FF6B47` | 8.2:1 ✓ | Link hover state |

### WCAG Compliance

**All colors meet WCAG AA standards:**
- Body text (16px): Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 4.5:1 contrast ratio

**Lighthouse tested:** Both sites achieve 100/100 accessibility scores with these values.

**Key Principle:** Contrast values are inverted between light and dark modes. What's darker in light mode becomes lighter in dark mode, and vice versa.

---

## Typography

### Font Family

**Primary Typeface: Inter Variable**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Why Inter:**
- Superior weight differentiation (400 vs 600 is dramatically clearer than system fonts)
- Consistent rendering across all platforms (eliminates Windows/Linux font weight issues)
- Designed for screens with exceptional readability at 16-18px
- Variable font technology: single 72KB file for full weight range 100-900
- Open source (SIL Open Font License)

**Fallback strategy:** System font stack provides instant fallback if Inter fails to load.

**Performance:**
- File size: 72KB WOFF2 (ASCII subset, Latin characters only)
- Load time: ~75ms on cable, ~200ms on 3G (first visit only, cached on repeat visits)
- Font display: swap (prevents invisible text flash)
- Preloaded for optimal rendering performance

**Font Rendering:**
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Type Scale

| Element | Size | Weight | Letter Spacing | Usage |
|---------|------|--------|----------------|-------|
| H1 (Site name) | 2rem (32px) | 700 | -0.025em | Header/site title |
| H2 (Page title) | 1.25rem (20px) | 600 | -0.02em | "Essays", "Now", etc. |
| H3 (Section) | 1.1rem (17.6px) | 600 | -0.015em | "Trust Revolution Podcast" |
| Topic header | 0.8rem (12.8px) | 500 | 0.05em | "BROWSE BY TOPIC" (uppercase) |
| Essay title (single) | 2.5rem (40px) | 700 | -0.03em | Individual essay page |
| Essay title (listing) | 1.5rem (24px) | 600 | -0.02em | Latest essay on homepage |
| Body text | 16px | 400 | normal | Standard content |
| Essay body | 18px | 400 | normal | Long-form reading |
| Meta text | 0.9rem (14.4px) | 400 | normal | Dates, footer |
| Nav links | 16px | 500 | normal | Navigation |

### Line Height

| Context | Line Height |
|---------|-------------|
| Body text | 1.6 |
| Essay body | 1.7 |
| Headings | 1.2-1.3 |

### Text Formatting

**Special Cases:**
- Topic headers: `text-transform: uppercase`
- Essay dates: `font-variant-numeric: tabular-nums` (for alignment)
- Links: `text-decoration: none` (except in essay body)
- Essay body links: `text-decoration: underline`

### Dark Mode Header Brightness

While most headers inherit from `--text-primary` (#e8e8e8) in dark mode, H2 and H3 headers receive enhanced contrast for improved visual hierarchy:

- **H2**: `#ffffff` (pure white) - maximum impact for primary section headers
- **H3**: `#f5f5f5` (near-white) - secondary hierarchy while remaining clearly distinct from body text

This enhanced contrast applies across all contexts (essay-body, note-body, page-body) and ensures headers remain scannable and prominent in dark mode.

---

## Layout & Spacing

### Container

```css
max-width: 700px;
margin: 0 auto;
padding: 2rem 1rem;
```

**Mobile:**
```css
padding: 1.5rem 1rem;
```

### Content Width

- **Standard pages:** 700px max-width
- **Essays/reading content:** 700px max-width
- **All content:** Centered with auto margins

### Semantic Spacing Variables

**Layout zones use --space-* variables (not scale --margin-* variables):**

| Variable | Value | Usage |
|----------|-------|-------|
| `--space-section` | 3rem | Major section breaks - optimal for 700px layout |
| `--space-divider` | 2rem | Within sections, around dividers |
| `--space-element` | 1.5rem | Between related elements |
| `--space-tight` | 1rem | Tight coupling (intro to form) |

**Principle:** Layout zones control spacing. Clear hierarchy: 3rem / 2rem / 1.5rem / 1rem. Everything uses these four values, with one exception: footer gets explicit 4rem for distinct zone separation.

### CSS Variable Scales

The design system uses CSS variables for consistent sizing across the codebase (~120 hard-coded values replaced with 27 semantic variables).

**Typography Scale (Font Sizes):**
| Variable | Value | Usage |
|----------|-------|-------|
| `--font-xs` | 0.85rem | Meta text, dates, footer |
| `--font-sm` | 0.9rem | Small text |
| `--font-md` | 0.95rem | Medium text, topic tags |
| `--font-base` | 1rem | Body text |
| `--font-lg` | 1.1rem | Large text, H3 |
| `--font-xl` | 1.25rem | Extra large, H2 |
| `--font-2xl` | 1.5rem | Essay titles in listings |
| `--font-3xl` | 2rem | H1, site name |
| `--font-4xl` | 2.5rem | Essay title (single page) |

**Gap Scale (flexbox/grid gaps):**
| Variable | Value |
|----------|-------|
| `--gap-xs` | 0.25rem |
| `--gap-sm` | 0.5rem |
| `--gap-md` | 0.75rem |
| `--gap-lg` | 1rem |
| `--gap-xl` | 1.5rem |

**Margin Scale (vertical rhythm):**
| Variable | Value |
|----------|-------|
| `--margin-xs` | 0.5rem |
| `--margin-sm` | 0.75rem |
| `--margin-md` | 1rem |
| `--margin-lg` | 1.5rem |
| `--margin-xl` | 2rem |
| `--margin-2xl` | 2.5rem |

**Border Width:**
| Variable | Value |
|----------|-------|
| `--border-width` | 1px |

### Spacing Examples

| Element | Margin/Padding |
|---------|----------------|
| Header zone to main | `var(--space-section)` (3rem) |
| H1 margin-bottom | `2.5rem` (hard value, between divider and section) |
| Navigation padding bottom | `var(--space-divider)` (2rem) |
| Footer top margin | `4rem` (explicit - distinct zone separation) |
| Footer top padding | `var(--space-divider)` (2rem) |
| Latest essay margin-bottom | `var(--space-section)` (3rem) |
| Podcast card margin-bottom | `var(--space-section)` (3rem) |
| Topics section margin-bottom | `var(--space-section)` (3rem) |
| Podcast box padding | 2rem |
| Bio box padding | 1.5rem |

---

## Components

### Brand Bar

**Fixed top bar:**
```css
position: fixed;
top: 0;
left: 0;
right: 0;
height: 3px;
background: #F84200;
z-index: 9999;
```

**Dark mode:**
```css
background: #FF5733;
```

### Navigation

**Structure:**
- Horizontal flexbox
- Gap: 1.5rem between items
- Border bottom: 1px solid
- Padding bottom: 2rem (via --space-divider, symmetric with footer)
- Margin bottom: 3rem

**Links:**
- Color: Body text color
- Weight: 500
- Active state: Trust Revolution Orange
- Hover state: Trust Revolution Orange

**Border colors:**
- Light: `#e5e5e5`
- Dark: `#404040`

### Footer

**Layout:**
- Flexbox, space-between
- Border top: 1px solid
- Padding top: 2rem (via --space-divider)
- Margin top: 4rem (explicit value - distinct zone)
- Font size: 0.9rem

**Structure:**
```
Left: ©2025 Shawn Yeager
Right: Nostr | GitHub | RSS | Notes → | Email
```

**Link spacing:** 1.5rem gap

**Responsive:** Stacks vertically on mobile (<600px)

### Topic Tags

**Layout:**
- Flexbox with wrap
- Gap: 0.75rem

**Styling:**
- Font size: 0.95rem
- No underline
- Hover: Trust Revolution Orange

### Essay Listings

**Date format:** `2025 · 10` (year · month)

**Structure:**
- Date: 0.9rem, tabular-nums, min-width 85px
- Title: Flex 1 (takes remaining space)
- Gap: 0.5rem
- Baseline aligned

### Podcast Feature Box

**Container:**
- Background: `#fafafa` (light) / `#333333` (dark)
- Padding: 2rem
- Border radius: 8px
- Margin bottom: 3rem

**Podcast artwork:**
- Size: 120px × 120px
- Border radius: 8px
- Background: Trust Revolution Orange
- Flex-shrink: 0
- Text: White, 1.5rem, 700 weight, centered

**Layout:** Flexbox, gap 1.5rem

### Buttons/CTAs

**Read more / Listen now links:**
```css
color: #d63900; /* or #FF5733 in dark mode */
font-weight: 500;
display: inline-flex;
align-items: center;
gap: 0.25rem;
```

**Arrow alignment:**
```css
span[aria-hidden="true"] {
    display: inline-block;
    vertical-align: middle;
    transform: translateY(-0.1em);
}
```

---

## Content Elevation System

### Visual Hierarchy Exception

The design system maintains a flat aesthetic with **one strategic exception**: content images receive subtle elevation through shadows.

**Core principle:** Structure is flat, content floats.

### What Receives Elevation

All content images use consistent shadow treatment:

- Podcast cover art (`.podcast-art`)
- Images in essay bodies (`.essay-body img`)
- Images in note bodies (`.note-body img`)
- Media page photos (all content images)

### What Remains Flat

- All structural elements (borders, dividers, navigation)
- Interactive elements (buttons, inputs, forms)
- Cards and containers (background color provides definition)
- Text and typography

### Implementation

**CSS Variables:**

```css
:root {
    --shadow-content-light: 0 1px 3px rgba(0, 0, 0, 0.15);
    --shadow-content-dark: 0 2px 4px rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
    :root {
        --shadow-content-light: 0 2px 4px rgba(0, 0, 0, 0.4);
        --shadow-content-dark: 0 3px 6px rgba(0, 0, 0, 0.5);
    }
}
```

**Unified Application:**

```css
.podcast-art,
.essay-body img,
.note-body img {
    box-shadow: var(--shadow-content-light);
    transition: box-shadow var(--transition-fast);
}
```

### Rationale

Images need visual definition in both light and dark modes. Shadows provide this without the visual weight of borders, creating clear distinction between structural elements and content.

**Benefits:**
- Single source of truth via CSS variables
- Automatic dark mode adjustment
- Consistent treatment across all content images
- Easy to adjust globally
- Better performance (grouped selector, reused variable)

---

## Page-Specific Designs

### Homepage

**Sections (in order):**
1. Bio paragraph
2. Latest essay (with excerpt and "Read more →")
3. Podcast feature box
4. Topic tags section
5. Recent essays (5 items)

### Essays Page

**Sections:**
1. Page title: "Essays"
2. Topic tags section
3. Essay list (chronological, newest first)

**No RSS in header** - moved to footer

### Single Essay Page

**Structure:**
1. Meta (date · reading time)
2. Essay title (large)
3. Essay body
4. Footer (optional CTA)
5. Back link ("← All essays")

**Essay body specifics:**
- Font size: 18px
- Line height: 1.7
- H2: 1.5rem, 600 weight
- H3: 1.25rem, 600 weight
- Paragraph spacing: 1.5rem bottom margin

### Now Page

**Structure:**
1. Page title: "What I'm Focused On Now"
2. Updated date (italic, small)
3. Sections with H3 headers
4. Content paragraphs and lists

### Media Page (unlisted)

**Structure:**
1. Page title: "Media"
2. Subtitle explaining purpose
3. Sections:
   - Short bio (50 words)
   - Extended bio (150 words)
   - Professional photo
   - Contact info
   - Current focus
   - Topics
   - About Trust Revolution

**Bio boxes:**
- Background: `#fafafa` / `#333333`
- Padding: 1.5rem
- Border radius: 8px
- Line height: 1.7

---

## Responsive Design

### Breakpoints

```css
@media (max-width: 600px) {
    /* Mobile styles */
}

/* Tablet: 768-1024px */
/* Desktop: >1024px */
```

### Mobile Adjustments

**Container:**
```css
padding: 1.5rem 1rem;
```

**Podcast header:**
```css
flex-direction: column;
```

**Podcast artwork:**
```css
width: 100px;
height: 100px;
```

**Footer:**
```css
flex-direction: column;
gap: 1rem;
align-items: flex-start;
```

---

## Transitions & Animations

**Standard transition:**
```css
transition: color 0.3s ease;
transition: background-color 0.3s ease;
transition: border-color 0.3s ease;
```

**Applied to:**
- Link colors
- Background colors
- Border colors
- All color changes for smooth light/dark mode switching

---

## Accessibility

### Contrast Ratios

All text meets WCAG AA standards (tested in Lighthouse):
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 4.5:1 minimum

**Both sites achieve 100/100 Lighthouse accessibility scores.**

### Keyboard Navigation

- All interactive elements keyboard accessible
- Focus states visible
- Logical tab order

### Semantic HTML

- Proper heading hierarchy
- Semantic elements (nav, footer, article, section)
- Alt text for images
- ARIA labels where appropriate

---

## Implementation Notes

### CSS Custom Properties

Implement using CSS variables for easy theme switching:

```css
:root {
    --brand-orange: #d63900;
    --brand-orange-hover: #bf3300;
    --text-primary: #1a1a1a;
    --text-secondary: #555555;
    --text-tertiary: #555555;
    --text-meta: #666666;
    --text-subtle: #767676;
    --border-color: #e5e5e5;
    --background-card: #fafafa;
    
    /* Content Elevation */
    --shadow-content-light: 0 1px 3px rgba(0, 0, 0, 0.15);
    --shadow-content-dark: 0 2px 4px rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
    :root {
        --brand-orange: #FF5733;
        --brand-orange-hover: #FF6B47;
        --text-primary: #e8e8e8;
        --text-secondary: #d0d0d0;
        --text-tertiary: #aaaaaa;
        --text-meta: #999999;
        --text-subtle: #a0a0a0;
        --border-color: #404040;
        --background-card: #333333;
        --background-body: #2a2a2a;
        
        /* Content Elevation - Dark Mode */
        --shadow-content-light: 0 2px 4px rgba(0, 0, 0, 0.4);
        --shadow-content-dark: 0 3px 6px rgba(0, 0, 0, 0.5);
    }
}
```

### Dark Mode Detection

Use `prefers-color-scheme` media query. No JavaScript toggle needed - respects system preference.

### Performance

- No web fonts (instant loading)
- Minimal CSS
- No JavaScript required for core functionality
- Fast first contentful paint

---

## Quality Checklist

**Before deployment, verify:**

- [ ] Trust Revolution Orange (#d63900 light / #FF5733 dark) used consistently for all links/CTAs
- [ ] System fonts loading properly on all platforms
- [ ] Dark mode contrast ratios meet standards
- [ ] Light mode contrast ratios meet standards
- [ ] All transitions smooth (0.3s ease)
- [ ] Mobile responsive at all breakpoints
- [ ] Footer has 5 links in correct order
- [ ] Topic tags hierarchy clear (header subtle, tags prominent)
- [ ] Essay dates aligned properly with tabular-nums
- [ ] Arrow alignment correct on all CTAs
- [ ] Brand bar fixed at top (3px)
- [ ] All spacing matches specification
- [ ] Favicons display correctly on both sites
- [ ] Favicon distinction clear at 16x16
- [ ] Headers clearly visible in dark mode (H2: #ffffff, H3: #f5f5f5)
- [ ] Content images have consistent shadow elevation
- [ ] **Lighthouse accessibility scores: 100/100 on both sites**

---

## Differences Between .com and .notes

Both sites use the SAME design system. Only differences are configuration:

| Feature | .com | .notes |
|---------|------|--------|
| Domain | shawnyeager.com | notes.shawnyeager.com |
| Content type | Essays | Notes |
| Date format | Long (October 11, 2025) | Short (Jan · 02) |
| Reading time | Show | Hide |
| SEO | Indexed | Blocked (noindex meta tag) |
| Newsletter signup | Shown in footer | Hidden |
| Favicon | Solid square | Outlined square |

Visual design, colors, typography, spacing - ALL identical.

---

## Version History

**v2.3 (October 2025):**
- Replaced system font stack with Inter variable font
- Resolves weight differentiation issues across platforms (especially Windows/Linux)
- 72KB WOFF2 file (ASCII subset) with font-display: swap
- Maintains 100/100 Lighthouse scores with proper preload
- Typography hierarchy now consistent across all operating systems
- Weight 400→600 jump dramatically more visible for clear hierarchy
- Single variable font file (100-900 weight range) vs loading multiple static weights

**v2.2 (October 2025):**
- Fixed divider spacing symmetry: nav padding-bottom changed from 1rem to 2rem
- Nav and footer now have symmetric divider spacing (both use `--space-divider`)
- Rationale: Dividers are visual separators requiring consistent spacing on both sides
- Creates visual balance and reinforces nav/footer as symmetric framing elements
- Spacing between content and dividers now consistent top and bottom of page

**v2.1 (October 2025):**
- Refined spacing for 700px layout: `--space-section` reduced from 4rem to 3rem
- Footer gets explicit 4rem margin-top (not variable) for distinct zone separation
- Rationale: 3rem optimal for 700px content density, matching editorial standards (Medium ~40px, Substack ~48px)
- 4rem works better for wider layouts (900px+) or sparser content, but creates crowding at 700px
- Footer remains distinct zone with 4rem, maintaining internal 1rem tight coupling for intro-to-form
- Page feels more unified without losing readability

**v2.0 (October 2025):**
- Reset vertical rhythm system to simpler 4-value hierarchy (4rem / 2rem / 1.5rem / 1rem)
- Removed `--space-card` variable - all major sections now use `--space-section` (4rem)
- Changed `--space-section` from 3rem to 4rem for more generous breathing room
- Changed `--space-tight` from 1.5rem to 1rem for true tight coupling (intro to form)
- Footer intro-to-form becomes 1rem (tight), but footer zone separation remains 4rem
- Eliminated complexity: everything uses one of four values, no exceptions
- Rationale: Simpler system with clear hierarchy is easier to maintain and more consistent

**v1.8 (October 2025):**
- Adjusted latest essay section margin-bottom from `--space-section` to `--space-card`
- Rationale: Podcast card is a visually heavy element requiring equal breathing room above and below (4rem both sides)
- Previous asymmetry (3rem above, 4rem below) created visual imbalance around podcast card
- Updated spacing examples table to reflect latest essay section uses `--space-card`

**v1.7 (October 2025):**
- Adjusted topics section margin-bottom from `--space-card` to `--space-section`
- Rationale: Topics and Recent Essays are related navigation elements requiring standard section spacing (3rem), not card spacing (4rem)
- The `--space-card` above topics section provides sufficient separation from podcast card's visual weight
- Updated spacing examples table to reflect topics section uses `--space-section`

**v1.6 (October 2025):**
- Updated brand orange hover color from #b83200 to #bf3300 for better brand harmony
- Adjusted hover to be closer to brand orange #F84200 while maintaining WCAG AA compliance
- Light mode links now harmonize better with podcast cover art and brand assets
- Dark mode colors unchanged (#FF5733, #FF6B47 remain optimal)

**v1.5 (October 2025):**
- Added `--space-card` variable (4rem) for visually weighted elements
- Updated `--space-tight` from 1rem to 1.5rem for better internal padding
- Changed h1 margin-bottom to hard value 2.5rem (between semantic values)
- Applied `--space-card` to podcast card and topics section
- Documented Visual Weight Principle: cards and bordered sections need more breathing room
- Updated spacing examples with new values

**v1.4 (October 2025):**
- Added CSS Variable Scales section documenting systematic refactoring
- Documented 27 semantic CSS variables replacing ~120 hard-coded values
- Added Typography Scale (--font-xs through --font-4xl)
- Added Gap Scale (--gap-xs through --gap-xl)
- Added Margin Scale (--margin-xs through --margin-2xl)
- Added Border Width variable (--border-width)
- Documented semantic spacing principle: layout zones use --space-* variables
- Fixed vertical spacing: header controls zone-to-zone spacing, nav manages internal padding
- Clarified h1 uses --space-divider for semantic "space before divider line"

**v1.3 (October 2025):**
- Added Content Elevation System documentation
- Introduced shadow variables for consistent content image treatment
- Documented systematic approach to image shadows
- Established pattern: structure is flat, content floats

**v1.2 (October 2025):**
- Updated all color values to actual WCAG-compliant implementation
- Added contrast ratios to all color tables
- Verified Lighthouse 100/100 scores
- Clarified orange adjustment (#F84200 → #d63900 in light mode)
- Added note about Lighthouse testing

**v1.1 (October 2025):**
- Added dark mode header brightness specifications
- Integrated H2/H3 enhanced contrast documentation
- Consolidated from separate addendum

**v1.0 (October 2025):**
- Initial specification

---

## Files This Specification Supports

This spec provides complete information for:
- `static/css/main.css` - All visual styling
- Hugo templates - Layout and structure
- `hugo.toml` - Configuration differences
- Component partials - Individual UI elements

---

**Last Updated:** November 15, 2025
**Version:** 2.4
**Maintained By:** Shawn Yeager

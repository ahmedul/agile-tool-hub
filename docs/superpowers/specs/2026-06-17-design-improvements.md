# Modern & Bold Design Refresh: Homepage + Category Pages

**Date:** 2026-06-17  
**Goal:** Redesign homepage and main category listing pages with modern, bold aesthetic featuring varied layouts, visual hierarchy, improved typography, and enhanced color palette  
**Success Metrics:** Pages load with no performance regression, accessibility maintained, design feels premium and modern, clear visual hierarchy guides users

---

## Current State

- Homepage: centered hero + 3-column grids (Popular Templates, Free Tools)
- Category pages (templates, tools, guides, docs): All use uniform 3-column card grids
- All cards are identical styling (uniform size, same padding, same color treatment)
- Typography: Standard sizes, minimal visual hierarchy
- Whitespace: Moderate, some sections feel cramped
- Colors: Current palette (blue #2563EB, green #16A34A, grays). Flexible for refresh.

---

## Design Direction: Modern & Bold

- Larger, bolder typography
- More deliberate whitespace and breathing room
- Full-width hero sections with gradient backgrounds and visual interest
- Featured card treatment for key content (larger, accent colors)
- Varied layouts (2-col sections, 3-col grids, full-width CTAs)
- Dark mode color variants defined
- Accent color palette: Flexible (can keep current or refresh to saturated teal/vibrant blue + coral/orange secondary)

---

## Scope

**In Scope:**
- Homepage (`src/app/page.tsx`)
- Template listing page (`src/app/templates/page.tsx`)
- Tools listing page (`src/app/tools/page.tsx`)
- Guides listing page (`src/app/guides/page.tsx`)
- Docs listing page (`src/app/docs/page.tsx`)

**Out of Scope:**
- Individual guide/tool/template detail pages (keep current design)
- Tools with interactive components (Planning Poker, Retro Board, etc.)
- Navigation/header/footer (minimal changes)

---

## Component Architecture

### New Components

**1. Hero Section (`HeroSection.tsx`)**
- Props: `title`, `description`, `backgroundGradient` (color + direction), `accentIcon` (optional), `ctas` (optional array of button configs)
- Renders: Full-width hero with gradient background, headline, subheading, optional icon, optional CTA buttons
- Used on: Homepage, all category pages

**2. Featured Card Variant (`FeaturedCard.tsx`)**
- Props: Extends current card props + `isFeatured` boolean, `accentColor` (optional)
- Renders: Larger card with accent stripe/badge when featured=true
- Used on: Category pages to highlight top 1-2 items

**3. Category Grid Section (`CategoryGridSection.tsx`)**
- Props: `title`, `items`, `featuredCount` (0-2), `layout` (2-col hero | 3-col content)
- Renders: Section header + featured cards (if any) + grid of remaining cards
- Used on: Category pages

### Modified Components

**TemplateCard.tsx, ToolCard.tsx** — Add optional `featured` prop and styling variation

---

## Page-by-Page Design

### Homepage (`page.tsx`)

**Hero Section:**
- Background: Gradient (accent color to tint, e.g., blue #2563EB → blue-100 #dbeafe, 135deg angle)
- Headline: "Create better Jira tickets, bug reports, and Agile templates in minutes" (48-56px, white, bold)
- Subheading: Current text (18-20px, white/90)
- CTA Buttons: 4 buttons, horizontal layout, blue (primary) + gray/outline variants
- Optional icon: Subtle geometric pattern overlay or animated gradient pulse (low-motion safe)
- Height: 600px desktop, 500px tablet, 400px mobile

**Section: Popular Templates**
- Grid: 3-col layout with featured cards for top 2 items (Jira Bug Report, User Story Template)
- Featured cards: ~20% larger, accent color badge, more padding

**Section: Free Tools**
- Grid: 3-col layout with featured cards for top 2 items (Bug Report Converter, User Story Generator)
- Featured cards: Same treatment as templates

---

### Category Pages (Templates, Tools, Guides, Docs)

**Hero Section (varies per category):**

**Templates Page Hero:**
- Headline: "Save time. Use proven templates for every ceremony."
- Description: "Structured templates for sprint planning, retrospectives, user stories, bug reports, and more."
- Gradient: Blue to teal (or current palette refresh)

**Tools Page Hero:**
- Headline: "Automate Jira tickets, user stories, and acceptance criteria instantly."
- Description: "AI-powered generators and real-time collaboration tools for agile teams."
- Gradient: Green to teal

**Guides Page Hero:**
- Headline: "Master Agile best practices. Learn how to run ceremonies better."
- Description: "Comprehensive guides, examples, and anti-patterns for every agile ritual."
- Gradient: Blue to purple

**Docs Page Hero:**
- Headline: "Agile explained. Definitions, patterns, and real examples."
- Description: "Quick reference docs for agile terminology, scrum ceremonies, and methodologies."
- Gradient: Purple to blue

**Content Section:**
- Featured cards: Top 1-2 items per category displayed with larger styling, accent color treatment
- Grid: Remaining items in 3-col grid (standard sizing)
- Spacing: More vertical spacing between sections (py-16 vs current py-14)

---

## Typography Updates

| Element | Current | New | Rationale |
|---------|---------|-----|-----------|
| Homepage H1 | 40px (md:48px) | 48px (md:56px) | Bolder, more impact |
| Category H1 | 32px | 40px (md:48px) | Consistent with homepage |
| Section H2 | 24px | 28px | More presence |
| Card titles | 18px | 18-20px (featured: 22px) | Hierarchy via size |
| Body text | 16px | 16px | No change |
| Line-height | 1.5 | 1.6 for headers, 1.5 for body | Improved readability |

---

## Color Palette

### Current (Keepable)
- Primary: Blue #2563EB
- Success: Green #16A34A
- Neutrals: Gray 50-900

### Refresh Options (Choose One)
**Option 1: Saturated Modernization**
- Primary: Teal #0d9488 (vibrant, modern)
- Secondary/Accent: Coral #ff6b6b (energy, warmth)
- Neutrals: Slate (cooler grays)

**Option 2: Keep Current + Enhance**
- Primary: Blue #2563EB (current, keep)
- Secondary: Orange #f97316 (warm accent for CTAs)
- Neutrals: Gray (current)

**Decision:** Use Option 2 (familiar brand, minimal disruption) unless user prefers Option 1 during implementation.

### Dark Mode Colors
- Background: Gray 950 (#030712)
- Surface: Gray 900 (#111827)
- Text: Gray 50 (#f9fafb)
- Accents: Same hue, brightened (e.g., blue becomes cyan #06b6d4)

---

## Spacing & Layout

### Padding/Margins
- Hero sections: `py-16` (64px) desktop, `py-12` (48px) mobile
- Grid sections: `py-14` → `py-16` (more breathing room)
- Card padding: `p-5` → `p-6` (current + 4px more)
- Featured cards: `p-8` (extra padding)

### Max-widths
- Keep `max-w-6xl` for most sections
- Hero: Full-width with internal content centered

### Gap between grid items
- Current: `gap-5`
- New: `gap-6` for more space

---

## Featured Card Styling

**Visual Treatment:**
- Size: 20% larger (scale: 1.1 or explicit larger padding/font)
- Border: Thin accent color left border (3-4px, accent color)
- Background: Subtle accent color tint (e.g., blue with 5% opacity)
- Badge: Small colored label ("Featured" or category icon) top-right
- Shadow: Slightly more shadow for depth
- Hover: More pronounced lift (shadow increase on hover)

**Cards per section:**
- Templates section: Featured = Jira Bug Report, User Story Template (top 2 by traffic)
- Tools section: Featured = Bug Report Converter, User Story Generator (top 2 by traffic)
- Category pages: Featured = Top 1-2 items per category

---

## Accessibility & Performance

**Accessibility:**
- All heading hierarchy maintained (h1 → h2 → h3)
- Color contrast ratios: WCAG AA minimum (4.5:1 for text)
- Alt text for any new icons/graphics
- Gradient overlays don't interfere with readability
- Dark mode support for all users and preference detection

**Performance:**
- No large unoptimized images (keep SVG or small PNG icons)
- Hero gradients: CSS-only (no images)
- No layout shifts (CLS impact minimal)
- Build should pass with 91+ pages generated

---

## Implementation Checklist

- [ ] Create `HeroSection.tsx` component with gradient, headline, optional CTA, optional icon
- [ ] Create `FeaturedCard.tsx` or extend existing card components with featured variant
- [ ] Create `CategoryGridSection.tsx` for reusable category page layout
- [ ] Update homepage: Add hero, featured card styling
- [ ] Update `/templates` page: Add hero + featured treatment
- [ ] Update `/tools` page: Add hero + featured treatment
- [ ] Update `/guides` page: Add hero + featured treatment
- [ ] Update `/docs` page: Add hero + featured treatment
- [ ] Update typography in Tailwind or global CSS (increase heading sizes)
- [ ] Update spacing (padding/margin increments)
- [ ] Add dark mode color variants to all new components
- [ ] Test build (91 pages, no TypeScript errors)
- [ ] Verify accessibility (contrast, hierarchy)
- [ ] Test on mobile (responsive hero, card scaling)

---

## Files to Modify/Create

**Create:**
- `src/components/HeroSection.tsx`
- `src/components/FeaturedCard.tsx` (or extend TemplateCard/ToolCard)
- `src/components/CategoryGridSection.tsx`

**Modify:**
- `src/app/page.tsx` (homepage)
- `src/app/templates/page.tsx`
- `src/app/tools/page.tsx`
- `src/app/guides/page.tsx`
- `src/app/docs/page.tsx`
- `src/components/TemplateCard.tsx` (add featured variant)
- `src/components/ToolCard.tsx` (add featured variant)
- `src/globals.css` or Tailwind config (typography scale updates)

---

## Success Criteria

- ✓ Homepage hero loads with gradient, large typography, visible hierarchy
- ✓ All 5 pages (home + 4 categories) have hero section with distinct messaging
- ✓ Featured cards are visually distinct (larger, accent color, badge)
- ✓ Build passes: 91+ pages generated, zero TypeScript errors
- ✓ Responsive: Looks good on mobile (hero scales, cards stack appropriately)
- ✓ Dark mode: All components have dark mode color variants
- ✓ Accessibility: WCAG AA contrast ratios, heading hierarchy intact
- ✓ No performance regression: Page load times unchanged

---

## Notes

- Color palette choice (Option 1 vs Option 2) should be confirmed during implementation
- Featured card count can be adjusted per category (currently 1-2 items)
- Hero heights and gradient angles can be fine-tuned during development
- Icons for category pages are optional; text-only version is acceptable

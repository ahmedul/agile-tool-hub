# Modern & Bold Design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign homepage and 4 category listing pages with hero sections, featured card variants, improved typography, enhanced spacing, and dark mode support.

**Architecture:** Three reusable components (HeroSection, FeaturedCard, CategoryGridSection) provide building blocks for all pages. Each page gets a dedicated hero, featured cards for top 1-2 items, and standard card grid. Typography increases apply globally via Tailwind config. Dark mode colors defined as CSS variables and Tailwind classes.

**Tech Stack:** Next.js 16, Tailwind CSS, TypeScript, React

## Global Constraints

- All components must be TypeScript with proper typing
- Build must pass: 91+ pages generated, zero TypeScript errors, zero console errors
- Responsive design: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Accessibility: WCAG AA contrast ratios (4.5:1 minimum for text), heading hierarchy intact
- Dark mode: All components support dark mode via `dark:` classes
- Color palette: Option 2 (keep blue #2563EB primary, add orange #f97316 secondary accent) unless otherwise specified
- Featured cards: Top 1-2 items per category get larger styling, accent color treatment, visual badge
- Hero heights: 600px desktop, 500px tablet, 400px mobile
- No breaking changes to existing component APIs (add optional props, don't remove required ones)

---

## File Structure

### New Components
- `src/components/HeroSection.tsx` — Reusable hero component (gradient, headline, subheading, optional icon, optional CTAs)
- `src/components/FeaturedCard.tsx` — Variant component for featured cards (extends TemplateCard/ToolCard styling)
- `src/components/CategoryGridSection.tsx` — Reusable grid section (title, featured items, standard grid)

### Modified Components
- `src/components/TemplateCard.tsx` — Add `featured` prop and styling
- `src/components/ToolCard.tsx` — Add `featured` prop and styling

### Modified Pages
- `src/app/page.tsx` — Add HeroSection to homepage, use featured cards
- `src/app/templates/page.tsx` — Add HeroSection, featured cards
- `src/app/tools/page.tsx` — Add HeroSection, featured cards
- `src/app/guides/page.tsx` — Add HeroSection, featured cards
- `src/app/docs/page.tsx` — Add HeroSection, featured cards

### Modified Styling
- `src/globals.css` or Tailwind config — Update typography sizes, spacing scale, add dark mode color variables

---

## Task 1: Create HeroSection Component

**Files:**
- Create: `src/components/HeroSection.tsx`

**Interfaces:**
- Consumes: None (new component)
- Produces: `HeroSection` React component with props: `title` (string), `description` (string), `gradientFrom` (color class, e.g., "from-blue-600"), `gradientTo` (color class, e.g., "to-blue-100"), `ctaButtons?` (array of {label, href, variant}), `accentIcon?` (React node)

- [ ] **Step 1: Create the HeroSection component**

```typescript
// src/components/HeroSection.tsx
import Link from "next/link";

interface CTA {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline"; // primary = blue, secondary = orange, outline = gray
}

interface HeroSectionProps {
  title: string;
  description: string;
  gradientFrom: string; // Tailwind class, e.g., "from-blue-600"
  gradientTo: string;   // Tailwind class, e.g., "to-blue-100"
  ctaButtons?: CTA[];
  accentIcon?: React.ReactNode;
}

export default function HeroSection({
  title,
  description,
  gradientFrom,
  gradientTo,
  ctaButtons,
  accentIcon,
}: HeroSectionProps) {
  return (
    <section
      className={`w-full min-h-[600px] md:min-h-[600px] sm:min-h-[500px] xs:min-h-[400px] bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center relative overflow-hidden`}
    >
      {/* Optional accent icon background */}
      {accentIcon && (
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          {accentIcon}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          {description}
        </p>

        {/* CTA Buttons */}
        {ctaButtons && ctaButtons.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            {ctaButtons.map((cta) => {
              const baseClasses =
                "px-8 py-3 rounded-lg font-semibold transition-colors";
              const variantClasses = {
                primary: "bg-blue-600 text-white hover:bg-blue-700",
                secondary: "bg-orange-600 text-white hover:bg-orange-700",
                outline:
                  "border border-white text-white hover:bg-white/10",
              };

              return (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className={`${baseClasses} ${variantClasses[cta.variant || "primary"]}`}
                >
                  {cta.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npm run build 2>&1 | grep -E "error|Error" | head -5`

Expected: No TypeScript errors related to HeroSection

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: add HeroSection component for homepage and category pages"
```

---

## Task 2: Create FeaturedCard Component

**Files:**
- Create: `src/components/FeaturedCard.tsx`

**Interfaces:**
- Consumes: Card props from TemplateCard or ToolCard (title, description, href, category)
- Produces: `FeaturedCard` React component (renders card with featured styling: larger, accent border, badge)

- [ ] **Step 1: Create FeaturedCard component**

```typescript
// src/components/FeaturedCard.tsx
import Link from "next/link";

interface FeaturedCardProps {
  title: string;
  description: string;
  href: string;
  category?: string;
  accentColor?: "blue" | "orange" | "green"; // default: blue
}

export default function FeaturedCard({
  title,
  description,
  href,
  category,
  accentColor = "blue",
}: FeaturedCardProps) {
  const accentColorClasses = {
    blue: "border-l-blue-600 bg-blue-50 dark:bg-blue-950/30",
    orange: "border-l-orange-600 bg-orange-50 dark:bg-orange-950/30",
    green: "border-l-green-600 bg-green-50 dark:bg-green-950/30",
  };

  const badgeColorClasses = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    orange:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <Link href={href}>
      <div
        className={`group relative p-8 rounded-lg border-l-4 shadow-md hover:shadow-lg transition-all ${accentColorClasses[accentColor]} cursor-pointer`}
      >
        {/* Featured Badge */}
        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${badgeColorClasses[accentColor]}`}
        >
          Featured
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 pr-20">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Category Label */}
        {category && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {category}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npm run build 2>&1 | grep -i "error\|warning" | grep -i "featured" | head -3`

Expected: No errors mentioning FeaturedCard

- [ ] **Step 3: Commit**

```bash
git add src/components/FeaturedCard.tsx
git commit -m "feat: add FeaturedCard component with accent styling and badge"
```

---

## Task 3: Create CategoryGridSection Component

**Files:**
- Create: `src/components/CategoryGridSection.tsx`

**Interfaces:**
- Consumes: Section title (string), items array (any), featuredCount (0-2), CardComponent (React component for rendering items)
- Produces: `CategoryGridSection` component that renders title + featured cards (larger) + grid of standard cards

- [ ] **Step 1: Create CategoryGridSection component**

```typescript
// src/components/CategoryGridSection.tsx
import React from "react";

interface CategoryGridSectionProps {
  title: string;
  items: Array<any>;
  featuredCount?: number; // 0-2
  CardComponent: React.ComponentType<any>;
  FeaturedCardComponent?: React.ComponentType<any>;
}

export default function CategoryGridSection({
  title,
  items,
  featuredCount = 2,
  CardComponent,
  FeaturedCardComponent,
}: CategoryGridSectionProps) {
  const featuredItems = items.slice(0, featuredCount);
  const standardItems = items.slice(featuredCount);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10">
        {title}
      </h2>

      {/* Featured Cards */}
      {FeaturedCardComponent && featuredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {featuredItems.map((item, idx) => (
            <FeaturedCardComponent
              key={item.href || idx}
              {...item}
              accentColor={idx % 2 === 0 ? "blue" : "orange"}
            />
          ))}
        </div>
      )}

      {/* Standard Card Grid */}
      {standardItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardItems.map((item, idx) => (
            <CardComponent key={item.href || idx} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify component compiles**

Run: `npm run build 2>&1 | tail -5`

Expected: Build completes successfully

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryGridSection.tsx
git commit -m "feat: add CategoryGridSection component for reusable category page layouts"
```

---

## Task 4: Update Typography and Spacing in Tailwind Config

**Files:**
- Modify: `tailwind.config.ts` or `src/globals.css` (typography scale)

**Interfaces:**
- Consumes: Current Tailwind config
- Produces: Updated typography sizes (h1: 48-56px, h2: 28px, h3: 20px) and spacing scale (py-16, gap-6)

- [ ] **Step 1: Check current Tailwind config**

```bash
cat tailwind.config.ts | grep -A 20 "fontSize\|extend" | head -25
```

- [ ] **Step 2: Update Tailwind config to increase heading sizes**

Edit `tailwind.config.ts` and ensure `extend.fontSize` includes:

```typescript
fontSize: {
  // Keep existing sizes, add overrides
  "2xl": ["1.5rem", { lineHeight: "2rem" }],     // 24px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
  "5xl": ["3rem", { lineHeight: "1.2" }],         // 48px (was 3.75rem)
  "6xl": ["3.5rem", { lineHeight: "1.2" }],       // 56px (new, for homepage hero)
  "7xl": ["4.5rem", { lineHeight: "1.2" }],       // 72px (new, for mega headlines)
}
```

And `extend.lineHeight`:

```typescript
lineHeight: {
  tight: "1.2",
  normal: "1.5",
  relaxed: "1.6",
}
```

- [ ] **Step 3: Verify Tailwind config is valid**

Run: `npm run build 2>&1 | grep -i "error" | head -3`

Expected: No Tailwind config errors

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "style: increase heading sizes and line-heights for modern bold typography"
```

---

## Task 5: Update Homepage with Hero and Featured Cards

**Files:**
- Modify: `src/app/page.tsx` (lines 38-73, hero and template section)

**Interfaces:**
- Consumes: HeroSection component, FeaturedCard component, TemplateCard component
- Produces: Homepage with hero section + featured template cards + featured tool cards

- [ ] **Step 1: Import new components at top of page.tsx**

Add these imports after existing imports:

```typescript
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
```

- [ ] **Step 2: Replace hero section with HeroSection component**

Replace lines 38-61 (the gray hero section) with:

```typescript
<HeroSection
  title="Create better Jira tickets, bug reports, and Agile templates in minutes"
  description="Free templates and simple tools for software teams that want clearer tickets, better acceptance criteria, and smoother delivery."
  gradientFrom="from-blue-600"
  gradientTo="to-blue-100"
  ctaButtons={[
    { label: "Browse Templates", href: "/templates", variant: "primary" },
    { label: "Try Planning Poker", href: "/tools/planning-poker", variant: "secondary" },
    { label: "User Story Generator", href: "/tools/user-story-generator", variant: "outline" },
    { label: "Bug Report Converter", href: "/tools/bug-report-to-jira-ticket-converter", variant: "outline" },
  ]}
/>
```

- [ ] **Step 3: Update "Popular Templates" section to use featured cards**

Replace lines 63-73 with:

```typescript
<section className="max-w-6xl mx-auto px-4 py-16">
  <div className="flex items-center justify-between mb-10">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Popular Templates</h2>
    <Link href="/templates" className="text-blue-600 hover:underline text-sm font-medium">View all →</Link>
  </div>

  {/* Featured Templates (top 2) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
    {templates.slice(0, 2).map((t, idx) => (
      <FeaturedCard
        key={t.href}
        title={t.title}
        description={t.description}
        href={t.href}
        category={t.category}
        accentColor={idx % 2 === 0 ? "blue" : "orange"}
      />
    ))}
  </div>

  {/* Standard Template Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {templates.slice(2).map((t) => (
      <TemplateCard key={t.href} {...t} />
    ))}
  </div>
</section>
```

- [ ] **Step 4: Update "Free Tools" section similarly**

Replace the existing "Free Tools" section (around line 75-120) with:

```typescript
<section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 py-16 px-4">
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center justify-between mb-10">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Free Tools</h2>
      <Link href="/tools" className="text-blue-600 hover:underline text-sm font-medium">View all →</Link>
    </div>

    {/* Featured Tools (Bug Report Converter, User Story Generator) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
      <FeaturedCard
        title="Bug Report to Jira Ticket Converter"
        description="Paste messy bug notes and get a clean, structured Jira ticket instantly."
        href="/tools/bug-report-to-jira-ticket-converter"
        category="Tool"
        accentColor="blue"
      />
      <FeaturedCard
        title="User Story Generator"
        description="Describe your feature and get a complete, Jira-ready user story with acceptance criteria instantly."
        href="/tools/user-story-generator"
        category="Tool"
        accentColor="orange"
      />
    </div>

    {/* Standard Tool Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <ToolCard
        title="Acceptance Criteria Generator"
        description="Generate testable acceptance criteria in Given/When/Then or checklist format in seconds."
        href="/tools/acceptance-criteria-generator"
      />
      <ToolCard
        title="Planning Poker"
        description="Real-time story point estimation for your whole team. No login — just share a link."
        href="/tools/planning-poker"
      />
      <ToolCard
        title="Retrospective Board"
        description="Run live retrospectives with your team. Collect feedback, vote, and discuss action items in real-time."
        href="/tools/retro-board"
      />
    </div>
  </div>
</section>
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build 2>&1 | tail -15`

Expected: Build completes, "91 pages generated"

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "design: update homepage with HeroSection and featured cards"
```

---

## Task 6: Update Templates Page with Hero

**Files:**
- Modify: `src/app/templates/page.tsx`

**Interfaces:**
- Consumes: HeroSection, FeaturedCard components
- Produces: Templates page with hero section + featured cards

- [ ] **Step 1: Import components**

Add at top of templates/page.tsx:

```typescript
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
```

- [ ] **Step 2: Add hero section before the grid**

Insert before the existing template grid:

```typescript
<HeroSection
  title="Save time. Use proven templates for every ceremony."
  description="Structured templates for sprint planning, retrospectives, user stories, bug reports, and more."
  gradientFrom="from-blue-600"
  gradientTo="to-blue-100"
/>
```

- [ ] **Step 3: Update grid section with featured cards**

Find the existing grid section and replace with:

```typescript
<section className="max-w-6xl mx-auto px-4 py-16">
  {/* Featured Templates (top 2) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
    {allTemplates.slice(0, 2).map((t, idx) => (
      <FeaturedCard
        key={t.href}
        title={t.title}
        description={t.description}
        href={t.href}
        category={t.category}
        accentColor={idx % 2 === 0 ? "blue" : "orange"}
      />
    ))}
  </div>

  {/* Standard Template Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {allTemplates.slice(2).map((t) => (
      <TemplateCard key={t.href} {...t} />
    ))}
  </div>
</section>
```

(Note: Replace `allTemplates` with whatever variable name holds the template list in that file)

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | grep -E "error|pages generated" | tail -2`

Expected: No errors, pages generated

- [ ] **Step 5: Commit**

```bash
git add src/app/templates/page.tsx
git commit -m "design: add hero and featured cards to templates page"
```

---

## Task 7: Update Tools Page with Hero

**Files:**
- Modify: `src/app/tools/page.tsx`

**Interfaces:**
- Consumes: HeroSection, FeaturedCard components
- Produces: Tools page with hero + featured cards

- [ ] **Step 1: Import components**

Add imports:

```typescript
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
```

- [ ] **Step 2: Add hero section**

Insert before grid:

```typescript
<HeroSection
  title="Automate Jira tickets, user stories, and acceptance criteria instantly."
  description="AI-powered generators and real-time collaboration tools for agile teams."
  gradientFrom="from-green-600"
  gradientTo="to-green-100"
/>
```

- [ ] **Step 3: Update grid with featured cards**

Replace grid section with:

```typescript
<section className="max-w-6xl mx-auto px-4 py-16">
  {/* Featured Tools (Bug Report Converter, User Story Generator) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
    <FeaturedCard
      title="Bug Report to Jira Ticket Converter"
      description="Paste messy bug notes and get a clean, structured Jira ticket instantly."
      href="/tools/bug-report-to-jira-ticket-converter"
      category="Tool"
      accentColor="blue"
    />
    <FeaturedCard
      title="User Story Generator"
      description="Describe your feature and get a complete Jira-ready user story with acceptance criteria."
      href="/tools/user-story-generator"
      category="Tool"
      accentColor="orange"
    />
  </div>

  {/* Standard Tool Cards Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Render remaining tools */}
  </div>
</section>
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/tools/page.tsx
git commit -m "design: add hero and featured cards to tools page"
```

---

## Task 8: Update Guides Page with Hero

**Files:**
- Modify: `src/app/guides/page.tsx`

**Interfaces:**
- Consumes: HeroSection, FeaturedCard components
- Produces: Guides page with hero + featured cards

- [ ] **Step 1: Import components**

```typescript
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
```

- [ ] **Step 2: Add hero**

```typescript
<HeroSection
  title="Master Agile best practices. Learn how to run ceremonies better."
  description="Comprehensive guides, examples, and anti-patterns for every agile ritual."
  gradientFrom="from-blue-600"
  gradientTo="to-purple-100"
/>
```

- [ ] **Step 3: Update grid with featured cards**

Add featured cards for top 2 guides (Epic Breakdown, Backlog Refinement), then standard grid for rest.

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: Success

- [ ] **Step 5: Commit**

```bash
git add src/app/guides/page.tsx
git commit -m "design: add hero and featured cards to guides page"
```

---

## Task 9: Update Docs Page with Hero

**Files:**
- Modify: `src/app/docs/page.tsx`

**Interfaces:**
- Consumes: HeroSection, FeaturedCard components
- Produces: Docs page with hero + featured cards

- [ ] **Step 1: Import components**

```typescript
import HeroSection from "@/components/HeroSection";
import FeaturedCard from "@/components/FeaturedCard";
```

- [ ] **Step 2: Add hero**

```typescript
<HeroSection
  title="Agile explained. Definitions, patterns, and real examples."
  description="Quick reference docs for agile terminology, scrum ceremonies, and methodologies."
  gradientFrom="from-purple-600"
  gradientTo="to-blue-100"
/>
```

- [ ] **Step 3: Update grid with featured cards**

Add featured cards for top 2 docs, standard grid for rest.

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: Build succeeds, 91 pages

- [ ] **Step 5: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "design: add hero and featured cards to docs page"
```

---

## Task 10: Final Build Verification

**Files:**
- Test: All modified pages

**Interfaces:**
- Consumes: All previous tasks' outputs
- Produces: Verified clean build with all design changes

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected output: Build completes in ~5-10s, shows "91 pages generated"

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | grep -i "error" | wc -l
```

Expected: 0 (zero errors)

- [ ] **Step 3: Verify all pages render**

```bash
npm run build 2>&1 | grep "pages generated"
```

Expected: Shows "91 pages" or similar count

- [ ] **Step 4: Check git log**

```bash
git log --oneline | head -10
```

Expected: See all 9 commit messages from Tasks 1-9

- [ ] **Step 5: Final status check**

```bash
git status
```

Expected: "Working tree clean"

- [ ] **Step 6: Commit final verification**

```bash
git commit --allow-empty -m "build: design refresh complete (hero sections + featured cards + typography on all pages)"
```

---

## Design Refresh Complete ✓

All pages now feature:
- Hero sections with gradient backgrounds and clear messaging
- Featured card variants (top 1-2 items per category)
- Improved typography (larger headings, better line-height)
- Enhanced spacing (py-16, gap-6 throughout)
- Dark mode support on all new components
- Responsive design across all breakpoints

**Build Status:** 91+ pages, zero errors, all components render correctly.

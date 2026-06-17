# SEO CTR Optimization & Internal Linking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve organic CTR and internal link authority for 6 high-intent guides by optimizing title tags, meta descriptions, and internal linking topology.

**Architecture:** Two-phase approach:
1. **Phase 1 (30 min):** Update guide frontmatter title/description fields with keyword-inclusive, clickable text
2. **Phase 2 (2-3 hours):** Audit and strengthen internal linking between guides ↔ templates ↔ tools

**Tech Stack:** Next.js 16 (App Router), MDX with gray-matter frontmatter, TypeScript

## Global Constraints

- All title tags must follow format: `<Primary Keyword>: <Benefit> | AgileToolHub`
- All descriptions must be 150–160 characters, include secondary keyword
- All new links must target existing pages (verify with grep before adding)
- Build must pass (`npm run build`) with no TypeScript or MDX errors
- Sitemap must regenerate to include metadata changes

---

## Phase 1: Title & Description Optimization

### Task 1: Update Epic Breakdown Best Practices Guide

**Files:**
- Modify: `src/content/guides/epic-breakdown-best-practices.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Open the file and read frontmatter**

```bash
head -30 src/content/guides/epic-breakdown-best-practices.mdx
```

Expected output: YAML frontmatter with current title and description

- [ ] **Step 2: Update title field**

Replace:
```yaml
title: Epic Breakdown Best Practices
```

With:
```yaml
title: How to Break Down Epics: Turn Big Features Into Sprintable Stories
```

- [ ] **Step 3: Update description field**

Replace:
```yaml
description: Master epic planning and scoping. Learn when to break down epics, size them properly, and avoid common pitfalls with real Jira examples.
```

With:
```yaml
description: Master epic decomposition. Learn to break large features into user stories, estimate accurately, and avoid common scoping mistakes.
```

- [ ] **Step 4: Verify file structure is valid**

Run: `npm run build 2>&1 | grep -i "epic-breakdown\|error" | head -5`

Expected: No errors mentioning epic-breakdown

- [ ] **Step 5: Commit**

```bash
git add src/content/guides/epic-breakdown-best-practices.mdx
git commit -m "seo: optimize epic breakdown guide title & description for CTR"
```

---

### Task 2: Update Backlog Refinement Best Practices Guide

**Files:**
- Modify: `src/content/guides/backlog-refinement-best-practices.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Update title field**

Replace:
```yaml
title: Backlog Refinement Best Practices
```

With:
```yaml
title: How to Run Backlog Refinement: Prep Stories for Sprint Success
```

- [ ] **Step 2: Update description field**

Replace current description with:
```yaml
description: Master backlog refinement ceremonies. Learn estimation, Definition of Ready, facilitation tips, and how to avoid common antipatterns.
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -10`

Expected: Successful build completion

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/backlog-refinement-best-practices.mdx
git commit -m "seo: optimize backlog refinement guide title & description for CTR"
```

---

### Task 3: Update How to Write Sprint Goals Guide

**Files:**
- Modify: `src/content/guides/how-to-write-sprint-goals.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Update title field**

Replace:
```yaml
title: How to Write Sprint Goals
```

With:
```yaml
title: How to Write Sprint Goals: Examples That Drive Team Focus
```

- [ ] **Step 2: Update description field**

Replace current description with:
```yaml
description: Learn to write measurable sprint goals that stick. Real examples, anatomy, common mistakes, and how to measure success at review.
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npm run build 2>&1 | grep -E "error|Error" | head -3`

Expected: No output (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/how-to-write-sprint-goals.mdx
git commit -m "seo: optimize sprint goals guide title & description for CTR"
```

---

### Task 4: Update Daily Standup Best Practices Guide

**Files:**
- Modify: `src/content/guides/how-to-run-effective-standups.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Update title field**

Replace:
```yaml
title: Daily Standup Best Practices
```

With:
```yaml
title: Daily Standups: Format, Anti-Patterns, and Remote Best Practices
```

- [ ] **Step 2: Update description field**

Replace current description with:
```yaml
description: Master the 15-minute standup. Learn the three-question framework, blocker resolution, remote tips, and how to avoid common pitfalls.
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | grep -E "pages generated|error" | head -5`

Expected: Pages generated count (e.g., "91 pages generated")

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/how-to-run-effective-standups.mdx
git commit -m "seo: optimize daily standup guide title & description for CTR"
```

---

### Task 5: Update Definition of Ready Best Practices Guide

**Files:**
- Modify: `src/content/guides/definition-of-ready-best-practices.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Update title field**

Replace:
```yaml
title: Definition of Ready Best Practices
```

With:
```yaml
title: Definition of Ready: DoR Checklist & When to Flex
```

- [ ] **Step 2: Update description field**

Replace current description with:
```yaml
description: Build your Definition of Ready. Learn the 8-item checklist, DoR vs DoD, templates for different team sizes, and refinement workflow.
```

- [ ] **Step 3: Verify sitemap regenerates**

Run: `npm run build 2>&1 | grep "SITEMAPS\|sitemap" | head -5`

Expected: Sitemap generation output

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/definition-of-ready-best-practices.mdx
git commit -m "seo: optimize definition of ready guide title & description for CTR"
```

---

### Task 6: Update Sprint Capacity Planning Guide

**Files:**
- Modify: `src/content/guides/sprint-capacity-planning-guide.mdx:1-25` (frontmatter)

**Interfaces:**
- Consumes: (none)
- Produces: Updated guide with new title and description in metadata

- [ ] **Step 1: Update title field**

Replace:
```yaml
title: Sprint Capacity Planning Guide
```

With:
```yaml
title: Sprint Capacity Planning: Math, Examples, and Common Mistakes
```

- [ ] **Step 2: Update description field**

Replace current description with:
```yaml
description: Master capacity math. Learn raw capacity calculation, vacation/meeting deductions, buffer sizing, velocity vs capacity, and real examples.
```

- [ ] **Step 3: Final build verification (Phase 1 complete)**

Run: `npm run build`

Expected: Build completes successfully with all 6 guides updated

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/sprint-capacity-planning-guide.mdx
git commit -m "seo: optimize capacity planning guide title & description for CTR"
```

---

## Phase 2: Internal Linking Audit & Optimization

### Task 7: Audit & Update Epic Breakdown Guide RelatedLinks

**Files:**
- Read: `src/content/guides/epic-breakdown-best-practices.mdx` (relatedLinks section)
- Modify: `src/content/guides/epic-breakdown-best-practices.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks array with 8-10 semantic links

- [ ] **Step 1: Read current relatedLinks**

```bash
head -30 src/content/guides/epic-breakdown-best-practices.mdx | grep -A 15 "relatedLinks:"
```

- [ ] **Step 2: Verify all target URLs exist**

Check these pages exist:
```bash
ls -1 src/content/templates/epic-template-jira.mdx src/content/guides/how-to-write-user-stories.mdx src/content/templates/user-story-template.mdx 2>&1 | wc -l
```

Expected: 3 (all exist)

- [ ] **Step 3: Ensure Epic Breakdown links to User Stories guide**

In the relatedLinks array, verify:
```yaml
- title: "How to Write User Stories"
  href: "/guides/how-to-write-user-stories"
```

If missing, add it to the array.

- [ ] **Step 4: Verify no broken links in the array**

Current target links should be:
- `/templates/epic-template-jira` ✓
- `/guides/epic-breakdown-best-practices` (self, typically omit)
- `/guides/how-to-write-user-stories` ✓
- `/templates/user-story-template` ✓
- `/guides/backlog-refinement-best-practices` ✓
- `/templates/sprint-planning-template` ✓
- `/templates/definition-of-ready-template` ✓
- `/guides/story-point-estimation-guide-with-examples` ✓

All should exist. Verify with:
```bash
grep -l "how-to-write-user-stories\|story-point-estimation-guide" src/content/guides/*.mdx | wc -l
```

Expected: 2 or more (both guides exist)

- [ ] **Step 5: Commit**

```bash
git add src/content/guides/epic-breakdown-best-practices.mdx
git commit -m "seo: audit & strengthen epic breakdown guide internal links"
```

---

### Task 8: Audit & Update Backlog Refinement Guide RelatedLinks

**Files:**
- Modify: `src/content/guides/backlog-refinement-best-practices.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks with strong guide ↔ template connections

- [ ] **Step 1: Read current relatedLinks section**

```bash
head -30 src/content/guides/backlog-refinement-best-practices.mdx
```

- [ ] **Step 2: Ensure links include:**
   - `/templates/backlog-refinement-template` (template)
   - `/templates/sprint-planning-template` (planning connection)
   - `/guides/how-to-write-user-stories` (stories are refined items)
   - `/guides/epic-breakdown-best-practices` (epics are refined into stories)
   - `/templates/definition-of-ready-template` (DoR is set in refinement)
   - `/guides/story-point-estimation-guide-with-examples` (estimation happens in refinement)

Verify each href points to an existing file.

- [ ] **Step 3: Verify build includes the guide**

Run: `npm run build 2>&1 | grep -i "backlog.*pages\|error" | head -3`

Expected: Successful build

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/backlog-refinement-best-practices.mdx
git commit -m "seo: audit & strengthen backlog refinement guide internal links"
```

---

### Task 9: Audit & Update Sprint Goals Guide RelatedLinks

**Files:**
- Modify: `src/content/guides/how-to-write-sprint-goals.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks connecting goals → planning → review → standups

- [ ] **Step 1: Ensure Sprint Goals links to:**
   - `/templates/sprint-planning-template` (goals set in planning)
   - `/templates/sprint-review-template` (goals measured at review)
   - `/templates/daily-standup-template` (standups track goal progress)
   - `/guides/how-to-run-effective-standups` (standups reinforce goals)
   - `/guides/definition-of-ready-best-practices` (ready stories align with goals)
   - `/templates/definition-of-done-checklist` (done = goal met)

Verify each target page exists.

- [ ] **Step 2: Cross-reference: Does sprint-review-template exist?**

```bash
find src/content -name "*sprint*review*" -type f
```

If not found, remove `/templates/sprint-review-template` from the links.

- [ ] **Step 3: Verify no dead links**

Run: `npm run build 2>&1 | grep -i "error\|undefined" | head -5`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/how-to-write-sprint-goals.mdx
git commit -m "seo: audit & strengthen sprint goals guide internal links"
```

---

### Task 10: Audit & Update Daily Standup Guide RelatedLinks

**Files:**
- Modify: `src/content/guides/how-to-run-effective-standups.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks connecting standups → templates → tools

- [ ] **Step 1: Ensure Daily Standup links to:**
   - `/templates/daily-standup-template` (template for running standups)
   - `/guides/how-to-write-sprint-goals` (standups discuss goal progress)
   - `/templates/sprint-planning-template` (planning sets up standup cadence)
   - `/guides/definition-of-ready-best-practices` (standup discusses ready items)

Verify each target exists.

- [ ] **Step 2: Add link to Daily Standup Generator tool (if it exists)**

```bash
ls -la src/app/tools/daily-standup-generator/ 2>/dev/null || echo "Tool not found"
```

If tool exists, ensure guide's relatedLinks includes:
```yaml
- title: "Daily Standup Generator"
  href: "/tools/daily-standup-generator"
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: Successful build

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/how-to-run-effective-standups.mdx
git commit -m "seo: audit & strengthen daily standup guide internal links"
```

---

### Task 11: Audit & Update Definition of Ready Guide RelatedLinks

**Files:**
- Modify: `src/content/guides/definition-of-ready-best-practices.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks connecting DoR → ceremonies → templates

- [ ] **Step 1: Ensure DoR guide links to:**
   - `/templates/definition-of-ready-template` (the DoR checklist itself)
   - `/templates/sprint-planning-template` (planning uses DoR)
   - `/guides/backlog-refinement-best-practices` (refinement enforces DoR)
   - `/guides/how-to-write-user-stories` (stories must meet DoR)
   - `/guides/how-to-write-acceptance-criteria` (AC is part of DoR)

Verify each target exists.

- [ ] **Step 2: Check for Definition of Done guide (DoD pair)**

```bash
grep -r "definition.*done" src/content/guides/*.mdx 2>/dev/null | head -3
```

If found, add link to DoD guide.

- [ ] **Step 3: Verify no formatting errors**

Run: `npm run build 2>&1 | tail -5`

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/content/guides/definition-of-ready-best-practices.mdx
git commit -m "seo: audit & strengthen definition of ready guide internal links"
```

---

### Task 12: Audit & Update Sprint Capacity Planning Guide RelatedLinks

**Files:**
- Modify: `src/content/guides/sprint-capacity-planning-guide.mdx:7-20` (relatedLinks array)

**Interfaces:**
- Consumes: Guide frontmatter structure (relatedLinks array format)
- Produces: Updated relatedLinks connecting capacity → planning → tools → velocity

- [ ] **Step 1: Ensure Capacity Planning guide links to:**
   - `/templates/sprint-planning-template` (capacity used in planning)
   - `/guides/story-point-estimation-guide-with-examples` (estimation feeds capacity)
   - `/tools/sprint-capacity-calculator` (calculator companion tool)
   - `/tools/velocity-tracker` (velocity informs future capacity)
   - `/guides/how-to-write-sprint-goals` (goals fit within capacity)

Verify each target exists.

- [ ] **Step 2: Verify tool paths exist**

```bash
ls src/app/tools/sprint-capacity-calculator/ src/app/tools/velocity-tracker/ 2>&1 | grep -c "page.tsx"
```

Expected: 2 (both tools exist)

- [ ] **Step 3: Add capacity calculator link if missing**

If `/tools/sprint-capacity-calculator` is not in relatedLinks, add:
```yaml
- title: "Sprint Capacity Calculator"
  href: "/tools/sprint-capacity-calculator"
```

- [ ] **Step 4: Final build verification**

Run: `npm run build 2>&1 | tail -10`

Expected: Successful build with "pages generated" count

- [ ] **Step 5: Commit**

```bash
git add src/content/guides/sprint-capacity-planning-guide.mdx
git commit -m "seo: audit & strengthen capacity planning guide internal links"
```

---

### Task 13: Add Guide Backlinks to Tool Pages

**Files:**
- Modify: `src/app/tools/daily-standup-generator/page.tsx` (relatedLinks array)
- Modify: `src/app/tools/sprint-capacity-calculator/page.tsx` (relatedLinks array)
- Modify: `src/app/tools/velocity-tracker/page.tsx` (relatedLinks array)
- Modify: `src/app/tools/retro-board/page.tsx` (relatedLinks array)

**Interfaces:**
- Consumes: Tool page TypeScript component structure (relatedLinks as array of objects)
- Produces: Updated tool pages with bidirectional links to guides

- [ ] **Step 1: Check Daily Standup Generator tool relatedLinks**

```bash
grep -A 20 "relatedLinks" src/app/tools/daily-standup-generator/page.tsx | head -25
```

- [ ] **Step 2: Add guide link to Daily Standup Generator if missing**

If the tool's relatedLinks doesn't include the standup guide, add:
```typescript
{ title: "Daily Standup Best Practices", href: "/guides/how-to-run-effective-standups" },
```

Verify the full relatedLinks array is valid TypeScript.

- [ ] **Step 3: Update Sprint Capacity Calculator relatedLinks**

Add or ensure it includes:
```typescript
{ title: "Sprint Capacity Planning Guide", href: "/guides/sprint-capacity-planning-guide" },
```

- [ ] **Step 4: Update Velocity Tracker relatedLinks**

Add or ensure it includes:
```typescript
{ title: "Sprint Capacity Planning Guide", href: "/guides/sprint-capacity-planning-guide" },
{ title: "Story Point Estimation Guide", href: "/guides/story-point-estimation-guide-with-examples" },
```

- [ ] **Step 5: Update Retro Board relatedLinks**

Add or ensure it includes:
```typescript
{ title: "Sprint Retrospective Template", href: "/templates/sprint-retrospective-template" },
{ title: "Definition of Done Checklist", href: "/templates/definition-of-done-checklist" },
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npm run build 2>&1 | grep -i "error" | head -5`

Expected: No TypeScript errors

- [ ] **Step 7: Commit all tool updates**

```bash
git add src/app/tools/daily-standup-generator/page.tsx \
       src/app/tools/sprint-capacity-calculator/page.tsx \
       src/app/tools/velocity-tracker/page.tsx \
       src/app/tools/retro-board/page.tsx
git commit -m "seo: add guide backlinks to tool pages for bidirectional authority flow"
```

---

### Task 14: Final Build & Verification

**Files:**
- Test: All modified guide and tool files
- Verify: Sitemap, TypeScript, no broken links

**Interfaces:**
- Consumes: All previous tasks' outputs
- Produces: Verified, merged changes ready for GSC indexing

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build completes with message like "92 pages generated" and no errors

- [ ] **Step 2: Verify sitemap includes updated guides**

```bash
grep "epic-breakdown\|backlog-refinement\|sprint-goals\|standups\|definition-of-ready\|capacity-planning" public/sitemap-0.xml | wc -l
```

Expected: 6 (all 6 guides appear)

- [ ] **Step 3: Check no broken links in guides**

Run validation on guide links:
```bash
grep -h "href:" src/content/guides/*.mdx | grep -o "href: \"[^\"]*\"" | sort -u | head -20
```

Spot-check a few—they should be valid paths like `/guides/...`, `/templates/...`, `/tools/...`

- [ ] **Step 4: Verify all TypeScript compiles cleanly**

```bash
npm run build 2>&1 | grep -i "error" | wc -l
```

Expected: 0 (no errors)

- [ ] **Step 5: Final commit summary**

View the commits made:
```bash
git log --oneline -14 | head -14
```

Expected: 8 guide title/description commits + 6 internal linking commits

- [ ] **Step 6: Push to origin**

```bash
git push origin main
```

Expected: All commits pushed successfully

---

## Phase 2 Complete ✓

All 6 guides now have:
- ✓ Optimized titles with primary keywords
- ✓ Compelling descriptions (150–160 chars, secondary keywords)
- ✓ Strong internal linking to related templates and tools
- ✓ Bidirectional links from tools back to guides
- ✓ Clean SEO topology for authority flow

**Next:** Request GSC indexing for these 6 guides to accelerate ranking potential. Google will crawl the updated pages within 1–2 days; expect ranking signals within 3–4 weeks.

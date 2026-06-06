# Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth animations, celebratory moments, personality copy, and shareability polish to Planning Poker, Retro Board, and Velocity Tracker tools.

**Architecture:** 
- Shared animation config library (`animations.ts`) with easing presets and duration constants
- Reusable `CelebrationMoment` component for confetti + messaging
- Accessibility hook (`useAnimation`) respects `prefers-reduced-motion`
- Each tool independently enhanced with phase-specific animations and personality

**Tech Stack:** Framer Motion (animations), react-confetti (celebration effects), existing React/Tailwind

---

## Phase 0: Setup (Shared Infrastructure)

### Task 1: Add Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add framer-motion and react-confetti to package.json**

Open `package.json` and add to `dependencies`:
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "react-confetti": "^6.1.0"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
npm install
```

Expected: Dependencies installed, `node_modules` updated, `package-lock.json` updated

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and react-confetti for tool animations"
```

---

### Task 2: Create Animation Config Library

**Files:**
- Create: `src/lib/animations.ts`

- [ ] **Step 1: Write animation config presets**

```typescript
// src/lib/animations.ts

// Easing presets
export const EASINGS = {
  smooth: [0.43, 0.13, 0.23, 0.96], // easeOutCubic
  bounce: [0.68, -0.55, 0.265, 1.55], // easeOutBack
  snappy: [0.34, 1.56, 0.64, 1], // easeOutElastic
};

// Duration presets (milliseconds)
export const DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  deliberate: 800,
};

// Common animation variants
export const ANIMATION_VARIANTS = {
  // Entrance animations
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth },
  },

  // Card/note entrance
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.smooth },
  },

  // Scale entrance
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: DURATIONS.normal, ease: EASINGS.bounce },
  },

  // Shake effect (mismatch)
  shake: {
    animate: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  },

  // Pulse effect (highlight)
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 },
    },
  },

  // Button interaction
  buttonClick: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: DURATIONS.fast },
  },
};

// Stagger effect for multiple items
export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATIONS.normal, ease: EASINGS.smooth },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/animations.ts
git commit -m "feat: create animation config library with easing presets and variants"
```

---

### Task 3: Create useAnimation Hook (Accessibility)

**Files:**
- Create: `src/hooks/useAnimation.ts`

- [ ] **Step 1: Write accessibility hook for motion preference**

```typescript
// src/hooks/useAnimation.ts

import { useEffect, useState } from "react";

/**
 * Hook that respects user's prefers-reduced-motion preference.
 * Returns true if animations should be enabled, false if disabled.
 */
export function useAnimation(): boolean {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimationsEnabled(!prefersReduced);

    // Listen for changes to motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setAnimationsEnabled(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return animationsEnabled;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAnimation.ts
git commit -m "feat: create useAnimation hook to respect prefers-reduced-motion"
```

---

### Task 4: Create CelebrationMoment Component

**Files:**
- Create: `src/components/CelebrationMoment.tsx`

- [ ] **Step 1: Write reusable celebration component**

```typescript
// src/components/CelebrationMoment.tsx

"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { DURATIONS, ANIMATION_VARIANTS } from "@/lib/animations";

interface CelebrationMomentProps {
  message: string;
  duration?: number; // milliseconds to show celebration
  onComplete?: () => void;
  emoji?: string;
  showConfetti?: boolean;
}

export default function CelebrationMoment({
  message,
  duration = 3000,
  onComplete,
  emoji = "🎯",
  showConfetti = true,
}: CelebrationMomentProps) {
  const [isVisible, setIsVisible] = useState(true);
  const animationsEnabled = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {showConfetti && animationsEnabled && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={100}
          gravity={0.3}
        />
      )}

      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        variants={ANIMATION_VARIANTS.scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: DURATIONS.normal }}
      >
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center border-2 border-green-500 max-w-sm">
          <div className="text-5xl mb-4">{emoji}</div>
          <p className="text-xl font-semibold text-gray-900">{message}</p>
        </div>
      </motion.div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CelebrationMoment.tsx
git commit -m "feat: create CelebrationMoment component (confetti + messaging)"
```

---

## Phase 1: Planning Poker Animations

### Task 5: Enhance PlanningPokerRoom with Card Animations

**Files:**
- Modify: `src/components/PlanningPokerRoom.tsx`

**Context:** This component manages a real-time Planning Poker session. It displays cards, handles voting, reveals results. Add animations to card reveals, confetti on consensus, and personality copy throughout.

Key areas to enhance:
- Card selection and display (lines ~430-460: card rendering)
- Vote reveal sequence (lines ~300-350: vote display logic)
- Copy/messages (scattered throughout)

- [ ] **Step 1: Import animation libraries and hooks**

At the top of `PlanningPokerRoom.tsx`, add:

```typescript
import { motion } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { ANIMATION_VARIANTS, DURATIONS, STAGGER_CONTAINER, STAGGER_ITEM } from "@/lib/animations";
import CelebrationMoment from "@/components/CelebrationMoment";
```

- [ ] **Step 2: Add state for celebration moment**

In the `PlanningPokerRoom` component state block, add:

```typescript
const [showCelebration, setShowCelebration] = useState(false);
const [celebrationMessage, setCelebrationMessage] = useState("");
const animationsEnabled = useAnimation();
```

- [ ] **Step 3: Add celebration logic when consensus reached**

Find the section where you analyze votes for consensus (look for vote counting/filtering logic around lines 300-350). Add this logic after vote analysis:

```typescript
// Check for consensus (all same non-null vote)
const nonNullVotes = Object.values(participants)
  .map(p => p.vote)
  .filter(v => v !== null);

if (nonNullVotes.length > 1 && new Set(nonNullVotes).size === 1) {
  // Consensus detected - trigger celebration
  setCelebrationMessage("Perfect consensus! Your team's in sync 🎯");
  setShowCelebration(true);
}
```

- [ ] **Step 4: Wrap card renders with Framer Motion**

Find the card display section (around lines 430-460 where cards are rendered). Replace the static card rendering with motion-wrapped versions. Example structure:

```typescript
{/* User's selected card - animated entrance */}
<motion.div
  variants={ANIMATION_VARIANTS.slideIn}
  initial="initial"
  animate="animate"
  transition={{ duration: DURATIONS.normal }}
>
  {/* Existing card rendering JSX */}
</motion.div>

{/* Other players' cards with staggered reveal */}
<motion.div
  variants={STAGGER_CONTAINER}
  initial="initial"
  animate="animate"
>
  {Object.entries(participants).map(([userId, participant]) => (
    <motion.div
      key={userId}
      variants={STAGGER_ITEM}
    >
      {/* Existing card rendering for this participant */}
    </motion.div>
  ))}
</motion.div>
```

- [ ] **Step 5: Render celebration component**

Near the return statement (end of component), add:

```typescript
{showCelebration && (
  <CelebrationMoment
    message={celebrationMessage}
    emoji="🎯"
    onComplete={() => setShowCelebration(false)}
  />
)}
```

- [ ] **Step 6: Update copy for personality**

Find message display areas (status messages, prompts) and update them with personality:

```typescript
// Replace generic messages with personality-driven ones
const getStatusMessage = () => {
  const voted = Object.values(participants).filter(p => p.hasVoted).length;
  const total = Object.keys(participants).length;
  
  if (voted === total && total > 0) {
    return "Everyone's voted! Ready to reveal? 👀";
  }
  return `${voted}/${total} voted — let's go! 🚀`;
};
```

- [ ] **Step 7: Test build**

```bash
npm run build
```

Expected: No TypeScript errors, Planning Poker loads without warnings

- [ ] **Step 8: Commit**

```bash
git add src/components/PlanningPokerRoom.tsx
git commit -m "feat: add animations and celebratory moments to Planning Poker

- Smooth card entrance animations with staggered reveal
- Confetti burst on consensus
- Personality copy with encouraging messages
- Accessibility: respects prefers-reduced-motion"
```

---

## Phase 2: Retro Board Animations

### Task 6: Enhance RetroBoard with Note Animations and Visuals

**Files:**
- Modify: `src/components/RetroBoard.tsx`

**Context:** This component manages a real-time Retro Board with three columns (Went Well, To Improve, Action Items). Add smooth note entrance animations, upvote feedback, and visual polish for screenshots.

Key areas to enhance:
- Note rendering in columns (lines ~150-250)
- Upvote button and feedback (lines ~100-150)
- Column styling (lines ~50-100)

- [ ] **Step 1: Import animation libraries**

At the top of `RetroBoard.tsx`:

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { ANIMATION_VARIANTS, DURATIONS, STAGGER_ITEM } from "@/lib/animations";
```

- [ ] **Step 2: Add animation state**

In component state:

```typescript
const animationsEnabled = useAnimation();
```

- [ ] **Step 3: Wrap note entries with motion**

Find the section rendering notes for each column (Went Well, To Improve, Action Items). Wrap with `AnimatePresence` and `motion.div`:

```typescript
{/* Example: Went Well column */}
<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300 min-h-80">
  <h3 className="font-bold text-gray-900 mb-4">✅ Went Well</h3>
  <AnimatePresence>
    {notes.wentWell.map((note, idx) => (
      <motion.div
        key={note.id}
        variants={ANIMATION_VARIANTS.slideIn}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: DURATIONS.normal, delay: idx * 0.05 }}
        className="p-4 bg-white border border-green-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-3"
      >
        <p className="text-gray-700 text-sm">{note.text}</p>
        <div className="flex items-center gap-2 mt-2">
          <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
            👍 {note.votes}
          </button>
          <button className="text-gray-400 hover:text-red-600 text-sm ml-auto">
            ✕
          </button>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
  
  {notes.wentWell.length === 0 && (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg">✨ Add something great here →</p>
    </div>
  )}
</div>
```

Repeat for "To Improve" and "Action Items" columns with appropriate colors (red and blue respectively).

- [ ] **Step 4: Add empty state messaging**

For each column, show encouraging text when empty (as shown in Step 3 above).

- [ ] **Step 5: Add board completion state**

After all columns, add:

```typescript
const isComplete = notes.wentWell.length > 0 && 
                    notes.toImprove.length > 0 && 
                    notes.actionItems.length > 0;

{isComplete && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="mt-6 p-4 bg-blue-100 border-l-4 border-blue-600 rounded text-blue-900"
  >
    ✓ <strong>Board is complete!</strong> Ready to wrap up? <strong>Screenshot this moment</strong> to share with your team.
  </motion.div>
)}
```

- [ ] **Step 6: Update upvote handler**

Find the upvote button click handler. Update to provide visual feedback:

```typescript
const handleUpvote = (columnKey: string, noteId: string) => {
  // Existing vote logic...
  // Update the note count, broadcast, etc.
};
```

- [ ] **Step 7: Test build**

```bash
npm run build
```

Expected: No errors, Retro Board animations smooth

- [ ] **Step 8: Commit**

```bash
git add src/components/RetroBoard.tsx
git commit -m "feat: add smooth animations and polish to Retro Board

- Note entrance animations with stagger
- Column color gradients for visual clarity
- Empty state encouragement
- Board completion hint for screenshots
- Screenshot-ready layout with better spacing"
```

---

## Phase 3: Velocity Tracker Animations

### Task 7: Enhance VelocityTracker with Chart and Milestone Animations

**Files:**
- Modify: `src/components/VelocityTracker.tsx`

**Context:** This component displays velocity metrics (average, trend, forecast) and a chart. Add animations to chart updates, metric displays, and personality copy for different trend states.

Key areas to enhance:
- Chart rendering (lines ~80-150)
- Metrics display (lines ~150-200)

- [ ] **Step 1: Import animation libraries**

At the top of `VelocityTracker.tsx`:

```typescript
import { motion } from "framer-motion";
import { useAnimation } from "@/hooks/useAnimation";
import { ANIMATION_VARIANTS, DURATIONS } from "@/lib/animations";
import CelebrationMoment from "@/components/CelebrationMoment";
```

- [ ] **Step 2: Add celebration state**

In component state:

```typescript
const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);
const [milestoneMessage, setMilestoneMessage] = useState("");
const animationsEnabled = useAnimation();
```

- [ ] **Step 3: Enhance chart with animation**

Find the Recharts `<LineChart>` component (around line 100-150). Update the `<Line>` element:

```typescript
<Line 
  type="monotone" 
  dataKey="velocity" 
  stroke="#8884d8" 
  isAnimationActive={animationsEnabled}
  animationDuration={DURATIONS.deliberate}
  dot={{ r: 5 }}
  activeDot={{ r: 7 }}
/>
```

- [ ] **Step 4: Animate metrics display**

Find the metrics display section (average velocity, trend, forecast). Wrap with motion:

```typescript
{metrics && (
  <div className="grid grid-cols-3 gap-6 mt-8">
    {/* Average Velocity */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.normal }}
      className="p-6 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <p className="text-gray-600 text-sm font-semibold">Average Velocity</p>
      <motion.p
        className="text-3xl font-bold text-blue-600 mt-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {metrics.averageVelocity} pts
      </motion.p>
    </motion.div>

    {/* Trend */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.normal, delay: 0.1 }}
      className="p-6 bg-green-50 border border-green-200 rounded-lg"
    >
      <p className="text-gray-600 text-sm font-semibold">Trend</p>
      <motion.div
        className="text-3xl font-bold mt-2"
        animate={metrics.trend === "accelerating" ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: metrics.trend === "accelerating" ? 2 : 0 }}
      >
        {metrics.trend === "accelerating" && <span className="text-green-600">📈 +{metrics.trendPercent}%</span>}
        {metrics.trend === "stable" && <span className="text-gray-600">📊 Stable</span>}
        {metrics.trend === "decelerating" && <span className="text-amber-600">📉 -{Math.abs(metrics.trendPercent)}%</span>}
      </motion.div>
    </motion.div>

    {/* Forecast */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.normal, delay: 0.2 }}
      className="p-6 bg-purple-50 border border-purple-200 rounded-lg"
    >
      <p className="text-gray-600 text-sm font-semibold">Next Sprint Forecast</p>
      <motion.p
        className="text-3xl font-bold text-purple-600 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: DURATIONS.normal }}
      >
        {metrics.forecast} pts
      </motion.p>
    </motion.div>
  </div>
)}
```

- [ ] **Step 5: Add personality copy below metrics**

Add messaging based on trend:

```typescript
{metrics && (
  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
    {metrics.trend === "accelerating" && (
      <p className="text-blue-900">
        ⚡ <strong>Your team's on a roll!</strong> Velocity up {metrics.trendPercent}% vs last sprint. Keep it going!
      </p>
    )}
    {metrics.trend === "stable" && (
      <p className="text-gray-700">
        📊 <strong>Steady as it goes.</strong> Consistent velocity is gold for planning.
      </p>
    )}
    {metrics.trend === "decelerating" && (
      <p className="text-amber-900">
        🤔 <strong>Velocity dipped this sprint.</strong> What slowed you down? Let's improve next time.
      </p>
    )}
  </div>
)}
```

- [ ] **Step 6: Add milestone celebration**

When team hits forecast, celebrate. Add this logic where metrics are calculated or when displaying results:

```typescript
{showMilestoneAnimation && (
  <CelebrationMoment
    message={milestoneMessage}
    emoji="🎯"
    onComplete={() => setShowMilestoneAnimation(false)}
  />
)}
```

- [ ] **Step 7: Test build**

```bash
npm run build
```

Expected: No errors, Velocity Tracker renders smoothly

- [ ] **Step 8: Commit**

```bash
git add src/components/VelocityTracker.tsx
git commit -m "feat: add chart animations and milestone celebrations to Velocity Tracker

- Chart line animates to new values over time
- Metrics display with staggered entrance animations
- Trend indicator pulses on acceleration
- Personality copy: different messages per trend
- Milestone celebration on forecast achievement
- Accessibility: animations respect prefers-reduced-motion"
```

---

## Final Verification

### Task 8: Full Build and Cross-Browser Testing

**Files:**
- No code changes (verification only)

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: ✅ Build succeeds, no errors or warnings

- [ ] **Step 2: Verify all 3 tools load**

After build, start dev server:

```bash
npm run dev
```

Navigate to:
1. http://localhost:3000/tools/planning-poker — Should load, no errors in console
2. http://localhost:3000/tools/retro-board — Should load, no errors in console
3. http://localhost:3000/tools/velocity-tracker — Should load, no errors in console

Expected: ✅ All tools accessible, no console errors

- [ ] **Step 3: Visual inspection - Planning Poker**

1. Create a session
2. Add 2-3 participants
3. Have participants vote
4. Observe: cards should slide in smoothly, other votes appear with stagger
5. Reach consensus and verify confetti appears
6. Verify messages are encouraging/personality-driven

Expected: ✅ Smooth animations, confetti fires once, copy is engaging

- [ ] **Step 4: Visual inspection - Retro Board**

1. Create a session
2. Add notes to each column
3. Observe: notes should slide in smoothly, staggered if multiple
4. Upvote a note and observe any feedback
5. Fill all columns and look for completion message
6. Screenshot the board

Expected: ✅ Notes animate smoothly, board is visually polished, ready to screenshot

- [ ] **Step 5: Visual inspection - Velocity Tracker**

1. View the tool
2. Observe: metrics should fade in with stagger
3. Add sprints if example data not shown
4. Observe: chart updates should be smooth
5. Verify trend-based copy matches the state (accelerating = positive message, etc.)

Expected: ✅ Chart animates, metrics staggered, copy matches trend

- [ ] **Step 6: Test accessibility (prefers-reduced-motion)**

Using browser DevTools, emulate `prefers-reduced-motion: reduce`:

1. Reload each tool
2. Verify animations are disabled (no stagger, no confetti, instant state changes)
3. Verify all functionality still works (can still vote, create notes, etc.)

Expected: ✅ Features work without animations

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "test: verify animations and visual polish across all tools

- Planning Poker: card animations, confetti, personality copy ✅
- Retro Board: note animations, completion hint ✅
- Velocity Tracker: chart animation, metrics stagger, trend copy ✅
- Accessibility: prefers-reduced-motion respected ✅
- Build: no errors, all tools load successfully ✅"
```

---

## Summary

**Total tasks:** 8  
**Expected timeline:** 6–8 hours implementation + testing  
**Key deliverables:**
- ✅ Planning Poker: Smooth card reveals, confetti, personality copy
- ✅ Retro Board: Note animations, beautiful layout
- ✅ Velocity Tracker: Chart animations, milestone moments, trend messages
- ✅ All tools: Accessible, cross-browser tested, screenshot-ready

# GA4 Funnel Setup Guide

**Purpose:** Track the conversion flow from page view → tool usage → output copy → user feedback

---

## Step 1: Create a Conversion Funnel in GA4

1. **Go to [Google Analytics 4](https://analytics.google.com)**
2. **Select your property:** AgileToolHub (G-0J6N159QGS)
3. **Left sidebar → Explore → Create new exploration**
4. **Choose template:** Funnel exploration

---

## Step 2: Configure the Funnel Visualization

Name: **"Generator Conversion Funnel"**

### Add Funnel Steps:

| Step # | Event/Condition | Why | GA4 Event Name |
|---|---|---|---|
| **Step 1** | Page View | User lands on tool page | `page_view` |
| **Step 2** | User clicks "Generate" | Triggers generator run | `generator_run` |
| **Step 3** | User clicks "Copy" | Copies output | `output_copy` |
| **Step 4** | User submits feedback | Indicates satisfaction | `output_feedback` |

### How to add each step:

1. Click **"+ Add step"**
2. Choose **Event**
3. Select the event name from the list (or type it in search)
4. Leave other filters blank for now

**Example for Step 1 (Page View):**
- Event: `page_view`
- Filter (optional): Page title contains "User Story" OR "Bug Report" OR "Acceptance Criteria"

**Example for Step 2 (Generator Run):**
- Event: `generator_run`
- No filter needed

---

## Step 3: Add Breakdowns (Optional but Recommended)

To see which tools/modes drive the most conversions:

1. Click **"Breakdown"** (right side)
2. Add dimension: **`tool`** (shows which generator: user_story, bug_report, acceptance_criteria)
3. Add dimension: **`mode`** (shows Local vs AI mode split)

This will show you:
- Which tool has the highest copy rate?
- Does AI mode have higher feedback scores than Local?
- Where do users drop off?

---

## Step 4: Check the Results

Once saved, GA4 will show:

```
Step 1 (Page View)        100 users
    ↓ (conversion 65%)
Step 2 (Generator Run)     65 users
    ↓ (conversion 50%)
Step 3 (Copy Output)       32 users
    ↓ (conversion 75%)
Step 4 (Feedback)          24 users
```

**Key metrics:**
- **Step-to-step drop-off:** Where do users stop? (If Step 2→3 drops 50%, outputs might be hard to copy)
- **Total funnel conversion:** 24/100 = 24% feedback rate (high engagement!)
- **Mode comparison:** AI mode feedback rate vs Local mode

---

## Step 5: Alternative Funnel (Content → Generator)

Create a second funnel for **content-to-tool conversion**:

| Step | Event | Why |
|---|---|---|
| Step 1 | `page_view` (on template page) | User reads template |
| Step 2 | `template_copy` | User copies template |
| Step 3 | `generator_run` | User opens generator |
| Step 4 | `output_copy` | User copies generator output |

**This shows:** Do templates + guides drive tool adoption?

---

## Step 6: Set Comparison Dimension (Optional)

Click **"Comparison"** to split the funnel by:
- **Device:** Mobile vs Desktop (are mobile users dropping off?)
- **Country:** US vs Germany vs India (do international users convert differently?)
- **Traffic source:** Organic vs Direct (does organic traffic have higher funnel completion?)

---

## How Often to Check

**Weekly:**
- Check total funnel conversion rate
- Identify biggest drop-off step
- Monitor mode split (AI vs Local)

**Monthly:**
- Review by country/device
- Compare to previous month
- Identify trends

---

## Expected Baseline (from May 25 data)

Current early signals:
- **Total sessions:** 60 (7-day window)
- **Events:** 356 (high engagement)
- **Active users:** 46

**If funnel looks like:**
- Step 1 (page view): 60 users
- Step 2 (generator run): 35 users (58% conversion)
- Step 3 (copy): 20 users (57% conversion)
- Step 4 (feedback): 12 users (60% conversion)

Then **total funnel conversion = 20%** (20% of page viewers give feedback).

**Goal by June 30:** Increase Step 3→4 (output_feedback rate) to 70%+ (via improved output quality from new templates/AI mode).

---

## Troubleshooting

**I don't see the events in the funnel:**
- Events may take 24–48 hours to appear in GA4
- Verify in **Admin → Events** that the 8 custom events are listed:
  - `generator_run`
  - `output_copy`
  - `session_created`
  - `template_copy`
  - `output_feedback`
  - `feedback_text_submitted`

**Funnel shows 0 users:**
- Go to **Real-time** view and manually trigger the event (click generate, click copy, etc.)
- If you see the event in Real-time, it will appear in the funnel within 24 hrs

**I want to filter by page:**
- In the step configuration, click **"Add filter"**
- Select **`page_location`** or **`page_title`**
- Choose **"contains"** and type "planning-poker" or "bug-report"

---

## Next: GSC Keyword Tracking

Once the funnel is set up, move to [GSC_KEYWORD_TRACKING.md](GSC_KEYWORD_TRACKING.md) to see which search keywords drive traffic to each page.


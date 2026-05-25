# Google Search Console (GSC) — Keyword Tracking Setup

**Purpose:** Monitor which search keywords drive traffic to your site + identify ranking opportunities

---

## Step 1: Verify Site in Google Search Console

If you haven't already:

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click **"Add property"**
3. Select **URL prefix:** `https://agiletoolhub.com`
4. Verify via **DNS TXT record** (you likely already did this)
5. Once verified, proceed to Step 2

---

## Step 2: Check Search Performance Data

1. **Left sidebar → Performance**
2. You should see data starting to populate after 7–14 days of the property being live

**Key metrics GSC shows:**
- **Total clicks** — How many users clicked through from Google Search to your site?
- **Impressions** — How many times did your pages appear in Google Search results?
- **Average CTR** — Click-through rate (% of impressions that resulted in clicks)
- **Average position** — Where does your page rank? (1 = top, 100+ = very low)

---

## Step 3: Analyze Keyword Performance

### View Keywords Driving Traffic

1. **Performance report**
2. **Click the "Queries" tab** (if not already selected)
3. Sort by **"Clicks"** (descending)

This shows you:
- Which search keywords drive the most traffic?
- Which pages are ranking?
- Which keywords have high impressions but low CTR? (opportunity to improve title/description)

**Example expected results (after 4 weeks):**

| Keyword | Clicks | Impressions | CTR | Avg Position | Page |
|---|---|---|---|---|---|
| planning poker free | 8 | 45 | 17.8% | 5 | /tools/planning-poker |
| bug report template | 6 | 32 | 18.8% | 7 | /templates/jira-bug-report-template |
| user story template | 4 | 28 | 14.3% | 9 | /templates/user-story-template |
| scrum retrospective template | 3 | 22 | 13.6% | 12 | /templates/sprint-retrospective-template |

---

## Step 4: Find Ranking Opportunities

### Identify High-Impression, Low-CTR Keywords

These are keywords where your page ranks but doesn't attract clicks (opportunity to improve):

1. **Filter:** CTR < 5% AND Impressions > 10
2. **These keywords:** Google thinks your page is relevant, but your title/description isn't compelling
3. **Action:** Improve the title or meta description for that page

**Example:**
- Keyword: "Agile team retro ideas"
- Impressions: 18, Clicks: 1, CTR: 5.6%, Position: 8
- Action: Improve title from "Sprint Retrospective Template" → "Sprint Retrospective Template + Best Retro Ideas"

---

## Step 5: Track New Keywords You Want to Rank For

### Compare Target Keywords vs Reality

Create a tracking list of keywords you want to rank for (from CONTENT_GAP_ANALYSIS.md):

| Target Keyword | Status | Page | Position | Clicks |
|---|---|---|---|---|
| Jira ticket template | ⏳ Not ranking yet | /templates/jira-ticket-template (new) | — | — |
| API requirements template | ❌ Not ranking | /templates/api-requirements-template (new) | — | — |
| Definition of Ready | ❌ Not ranking | /templates/definition-of-ready (new) | — | — |
| Daily standup template | ❌ Not ranking | /templates/daily-standup-template (exists) | — | — |

**How to find where you're ranking:**
1. Go to **Performance**
2. **Filter:** Queries contains "Jira ticket template"
3. Check position and CTR

Once you publish new content, check back in 2–4 weeks to see if it starts appearing.

---

## Step 6: Identify Content Gaps

### Keywords You're NOT Ranking For

These are opportunities:

1. **Crawl the web** or use a tool like SEMrush/Ahrefs to find keywords related to your niche:
   - "Jira requirements template"
   - "Story point estimation"
   - "QA test case template"
   - "Epic Jira template"

2. **Check GSC:** Do these keywords appear in your Performance report?
   - **Yes, position 10–50?** → You're close; improve content
   - **No impressions at all?** → Google doesn't think you're relevant; create content

3. **Publish new pages** for keywords with 100+ monthly searches where you have 0 impressions

---

## Step 7: Monthly Review Checklist

### Every month, check:

- [ ] **New keywords with clicks** — Which new search terms drove traffic?
- [ ] **Keyword position trends** — Are you ranking higher or lower for top keywords?
- [ ] **CTR by page** — Which pages have low CTR (opportunity to improve titles)?
- [ ] **Search impression growth** — Is Google showing your pages more often each week?
- [ ] **New content performance** — 2–4 weeks after publishing, are new pages getting impressions?

---

## Step 8: Export Data for Analysis

1. **Performance report**
2. **Click the download icon** (top right)
3. **Save as CSV**
4. Open in Google Sheets or Excel

**Track over time:**
- Create a "GSC Tracker" sheet
- Copy data every Sunday
- Chart: Clicks/Impressions/Position over 4+ weeks
- Identify trends (Are clicks growing? Is your ranking improving?)

---

## Expected Timeline

| Week | Expected Data | Action |
|---|---|---|
| Week 1–2 | 0–5 clicks | Verify property is live; check Real-time in GA4 |
| Week 3–4 | 5–15 clicks | First keywords appearing; start tracking |
| Week 5–8 | 20–50 clicks | See which content drives traffic; identify gaps |
| Week 9–12 | 50–150+ clicks | Optimize top performers; expand winning content |

---

## Key Wins to Aim For (by June 30)

| Goal | Why | How |
|---|---|---|
| **50+ clicks from search** | 5–10x growth from current 4 organic sessions/week | Publish 3–4 new "Jira template" pages + improve titles |
| **Average position < 15** | Top 15 = higher CTR | Optimize existing content; build backlinks if time |
| **5+ keywords ranking** | Diversified traffic (not just "planning poker") | Content gap strategy: API, DoR, Jira ticket, QA |
| **10%+ CTR on top pages** | Strong titles/descriptions | Compare title versions; A/B test if possible |

---

## Tools to Monitor Keywords (Free/Cheap)

- **Google Search Console** ✅ (free, built-in)
- **Google Trends** ✅ (free; shows search interest over time)
- **Ubersuggest** (free tier; shows keyword difficulty + search volume)
- **SEMrush** (paid, ~$100/mo; but has a free version with limited data)

For now, focus on GSC + creating the content identified in CONTENT_GAP_ANALYSIS.md. Tools can wait.

---

## Linked Documents

- **[CONTENT_GAP_ANALYSIS.md](CONTENT_GAP_ANALYSIS.md)** — Which keywords to target
- **[GA4_FUNNEL_SETUP.md](GA4_FUNNEL_SETUP.md)** — How users convert after clicking
- **[README.md](README.md)** — Overall roadmap


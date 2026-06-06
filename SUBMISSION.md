# FirstStep — Round 2 Submission
**The Alter Office | Product Builder Intern | Soundhar Raj V**

---

## 01. Problem Statement

**User:** Pranesh, 19, my friend, freelance video editor. Has a UPI-linked savings account, earns ₹2,000–3,000/month, knows Bitcoin exists — but has never invested ₹1 anywhere.

**What stops him:**
- Fear of losing the little money he has
- No mental model — can't tell the difference between a mutual fund, stock, or FD
- Jargon barrier — SIP, NAV, CAGR all read as noise
- Every app he's seen looks like a trading terminal built for someone else
- Doesn't know you can start with ₹100

**What success looks like in 90 days:**
Pranesh has made one real SIP investment of ₹100–500 in a large-cap index fund. He understands what he owns, what the realistic upside and downside look like, and why he chose it over a savings account.

**What I chose not to solve:**
- Stocks, F&O, intraday — not relevant for a first-timer
- Portfolio rebalancing, tax harvesting, goal planning — too advanced for Day 0
- Real KYC, broker integration, live prices — mocked intentionally
- Social features, leaderboards — increase anxiety, not confidence
- News feed — would paralyze, not inform, a first-timer

---

## 02. User Stories

| As… | I want… | So that… | Priority |
|-----|---------|----------|----------|
| Pranesh (first-time investor) | to see ₹500/month projections including realistic loss scenarios | I can decide without feeling blindfolded | Must |
| Pranesh | to compare SIP vs savings account in plain language | I understand the cost of not investing | Must |
| Pranesh | to make a mock ₹100 investment in under 3 minutes | I feel the action without fear of real loss | Must |
| Pranesh | to read a plain-language explainer on what a mutual fund SIP is | I don't need to Google 30 terms before trusting the app | Should |
| Pranesh | to see a simple portfolio summary after mock investing | I feel ownership, not confusion, after the first step | Could |

---

## 03. Prototype

**Live:** https://firststep-thealteroffice.netlify.app

**Screens built:**
1. Welcome — "Your first ₹100 can grow. Here's how."
2. Understand — Plain-language explainer, zero jargon
3. Calculator — Slide ₹100–5,000/month, see 1/3/5 year growth + loss band
4. Compare — SIP vs Savings Account, same amount, side by side
5. Pick a Fund — 3 options only, clear risk label on each
6. Mock Invest — Fake KYC, confirm ₹100 SIP, confirmation screen
7. Portfolio Stub — Shows the mock investment on Day 0

**Stack:** React 18 + TypeScript + Tailwind CSS + Recharts. Deployed on Netlify. Zero backend — all mock data.

---

## 04. Product Note

I built this for Pranesh. Every screen has one test: would Pranesh understand this at 11pm after a long day?

**The key decision:** The calculator shows a loss band by default. Most apps hide this. I put it front and center. If Pranesh sees the worst case and still presses go, he's actually ready.

**What I cut:** Stocks, live prices, news feed, dark mode, animations, multiple fund categories (kept to 3 so the choice doesn't paralyze).

**What I'd build next:**
- Real SIP start via broker API
- Goal-based framing: "Save for a laptop in 18 months" → shows the SIP needed
- WhatsApp nudge at month-end: "Your ₹100 is ₹103. Want to add more?"

**How I used AI:**
- Claude for problem framing, scope enforcement, and reviewing UI copy for jargon
- Cursor for React component generation
- Every string tested: "would a non-finance 19-year-old understand this?"
- AI accelerated the build — the product decisions were mine

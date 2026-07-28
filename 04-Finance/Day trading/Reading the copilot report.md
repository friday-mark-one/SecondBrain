---

---

# Reading the copilot report

> Beginner's decoder for every line of an `options report` output. Written 2026-07-28 using a live NVDA report as the running example (spot $196.51 that day). The one rule that governs everything here: **the report scores conditions, not direction** — "71% favorable" means 10 of 14 operating conditions look normal, never "71% chance it goes up." Direction is always your call.

## The verdict line
`10 green / 3 yellow / 1 red = 71% favorable → CAUTION` — 14 independent checks, like a pre-flight inspection. Green = favorable condition, yellow = worth knowing, red = real problem. Any red → CAUTION; 2+ yellows → MIXED; else CLEAN SETUP. Use ~70%+ as the "worth doing manual research" trigger, nothing more.

## The 14 checks, by information family
- **Screen** (liquidity): price > $20, volume > 1M sh/day, float > 50M sh — is this a big, real, liquid stock.
- **Earnings** (calendar): the quarterly report card; stocks jump/crater 5–10% overnight on it. The scheduled landmine. No entries within 12 *trading* days (weekends don't count). This rule cost the case-study trader $19,206 once.
- **Regime** (macro): is the whole market (SPY) above its long-term trend, and is the VIX (market fear gauge) calm (<20)? A rising tide matters; the case-study trader's best "trades" were his cash periods in bad tape.
- **Trend**: price vs its 50-day and 200-day moving averages (average close over N days — slow lines that smooth noise). Above both = uptrend; above 200d only = *pullback* (strong stock catching its breath — or rolling over; unknowable in advance); below both = downtrend, where long calls fight the tape.
- **Rel strength** (cross-sectional): stock's 60-day return minus SPY's. A stock can "uptrend" while losing the race to the index — this catches quiet fading that absolute trend misses.
- **Momentum (RSI)**: 0–100 thermometer of recent buying/selling pressure. >70 overheated (chasing), <30 beaten-up (knife risk), 40–60 neutral.
- **Extension**: distance from the 50-day average measured in ATRs (see below). Within ±2 = near trend; beyond ±4 = parabolic melt-up / waterfall crash — dangerous entry territory.
- **Daily range (ATR)**: the stock's typical daily swing. Matters because the −15% premium stop ≈ a ~2% stock drop; a 4%/day mover can stop you out on pure noise. Calm names give a thesis room to breathe.
- **Beta**: how much the stock moves when the market moves (1.0 = with the market). Through a ~7× levered option, beta 2.2 ≈ 15× market exposure. Sizing already compensates; you should still know you hold a firecracker.
- **Vol pricing (IV vs realized)**: realized = how much the stock actually moves; implied (IV) = how much movement the option price charges you for. IV ≈ realized → fair. IV ≥ 1.4× realized → you're overpaying; the stock can rise and the option still lose as the premium deflates (IV crush). Think insurance rates: buy when normal, not during the panic.
- **Volume (RVOL)**: today's volume vs normal. ≥3× = the crowd is here — and attention-chasing measurably loses (Phase 10's "attention tax").
- **Short interest**: % of shares bet against. >10% = battleground stock, violent both ways.
- **Options positioning (put/call OI)**: what the options crowd holds. Balanced ≈ 0.5–1.3; put-heavy = hedged/bearish; call-crowded = froth.
- **Insiders**: open-market purchases by executives in 90d are rare and noted; routine selling is normal and means nothing. (Tested Phase 4: informative, not predictive alone.)

Sibling pairs (deliberately overlapping lenses, read as one voice each): RSI + Extension (price stretch), Daily range + Beta (volatility).

## The unscored context (shown, never colored — measured as non-predictive at 0–10 day horizons)
- **Fundamentals**: market cap (company size), trailing P/E ($ paid per $1 of last year's profit), forward P/E (per $1 of *expected* profit — a big gap means growth priced in), revenue growth, profit margin. Describes the business; expresses over years, not your 10-day hold.
- **Analysts**: 1(strong buy)–5(sell) consensus, price targets. They mostly chase price; they were maximally bullish before every drawdown.
- **News**: the current story, for manual research. Headline content is priced in before you can act (Phase 10); news-day chasing loses on average.

## Related
Order tickets, exits, and rules: `80-LifeOS/Options copilot instructions.md` · evidence for every claim above: [[Trading research archive]] · per-stock behavior: the Personalities/ notes.

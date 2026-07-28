---

---

# Evidence-backed swing-trading techniques

> Research library compiled **2026-07-24** for the swing-strategy project. Every technique is rated by how strong the *actual proof* is, not how often it's praised online. See [[Day trading]], [[Trading routine]].

## How to read this note

- **Project frame:** US market · **long-only** · **2–10 day swing hold** · notify-only (I decide + place trades manually in Robinhood) · small account (<$25k) · margin/Instant account (so PDT applies — max 3 same-day round-trips / rolling 5 business days).
- **Core engineering principle:** *code computes every number and every signal from real fetched data; an LLM only synthesizes, explains, and argues on top of that data — it never invents numbers or "backtests in its head."* An LLM asked to "backtest this / give me the Sharpe" in a chat window **fabricates** the numbers.
- **Evidence scale:** **Strong** (peer-reviewed / arithmetic / heavily replicated) · **Moderate** (real out-of-sample data but decayed or single-source) · **Weak–Anecdotal** (single-trader track record or marketing; idea source only).

---

## 0. Reality check — the base rates (read this first)

The uncomfortable, well-sourced truth that frames everything below:

- **Retail day-traders overwhelmingly lose.** Brazil study (19,646 traders): 70% lost on day 1; of the 1,551 who persisted 300+ days, **97% still lost money**; only 1.1% out-earned minimum wage. Taiwan census: **>80% lose in a typical 6-month window**, only ~5% ever positive net, <3% *predictably* skilled; unprofitable traders generate 72–80% of all day-trade volume (the losers *are* the market).
- **Overtrading is a measurable tax.** Barber & Odean: the highest-turnover households earned 11.4%/yr vs. the market's 17.9% — a **6.5-point annual drag** purely from trading too much.
- **Even professionals can't beat the index.** SPIVA (through Dec 2024): active large-cap funds underperforming the S&P 500 — 65% (1yr), 85% (3yr), 84% (10yr), **89.5% (15yr)**. No persistence in who wins.
- **Backtests barely predict live results.** Quantopian, 888 real algos: backtest Sharpe explained **<3%** of live performance — and *more* optimization made the live gap *worse*.
- **Published edges decay.** McLean & Pontiff (97 predictors): returns 26% lower out-of-sample, **58% lower after publication** (arbitraged away once public).

**Implication:** the honest prior is skeptical-until-proven. The realistic goal is a *small* edge, protected by rigorous risk management, validated out-of-sample, paper-traded, and judged **after tax** vs. just buying SPY.

---

## 1. Evidence scorecard

| Technique | Evidence | Fits 2–10 day swing? | Role |
|---|---|---|---|
| Risk mgmt & position sizing | **Strong** (arithmetic) | Any horizon | **Foundation — biggest real edge** |
| Volatility-targeting sizing overlay | **Strong** (peer-reviewed) | Any horizon | Size throttle |
| PEAD / earnings surprise (SUE) | **Strong** (50 yrs) | Partial (front of drift) | Earnings-catalyst module |
| Overnight drift | **Strong** | Structural | Bias to hold overnight, not buy at open |
| Momentum 12-1 | **Strong** | Low (monthly) | Uptrend context filter |
| Connors RSI(2) mean-reversion | **Moderate** (real OOS, decayed) | **High** (~4-day) | Anchor-setup candidate #1 |
| Around-earnings reversal (So-Wang) | Moderate | High | Earnings module |
| 1-day-decline rebound (Cox-Peterson) | Moderate (contested) | High | Candidate, cost-sensitive |
| Analyst-revision drift | Moderate | Medium | Weak long-only (strong leg is short) |
| CAN SLIM | Moderate paper / live funds failed | Low | Borrow breakout trigger only |
| ORB / "Stocks in Play" (Zarattini) | Moderate (unrefereed, leverage, intraday) | Low | Borrow the RVOL *screen* only |
| Minervini VCP, Qullamaggie, Stockbee | Weak–Anecdotal (single-trader) | Mixed | Idea sources |
| Darvas box, Raschke "Holy Grail" | Weak–Anecdotal | Mixed | Idea sources |
| VWAP signal, gap-and-go, "RVOL sweet-spot" | Weak (some stats fabricated; gap-and-go evidence cuts *against*) | — | Skip / screen only |

---

## 2. Foundation — risk management & position sizing (STRONGEST evidence)

This is the part with strong, **non-decaying** proof (it's arithmetic, not an anomaly) and the part every Instagram guru underweights. Build this first.

**Percent-risk position sizing (fixed-fractional).** Size off the stop distance, never off "how much I want to own."
```
Risk_$      = Equity × Risk%            (Risk% = 0.5–1%)
Shares      = floor( Risk_$ / (Entry − Stop) )
```
*Example:* $20k × 1% = $200 risk; entry $50, stop $47 → 66 shares, $3,300 position. If stopped: −$198 ≈ 1%. Recompute off *current* equity each time.

**Drawdown math (why we cap risk).** Recovery needed = `1/(1−DD) − 1`. Down 20% needs +25%; down 50% needs +100%. N consecutive stop-outs at risk r → drawdown ≈ `1 − (1−r)^N`. At 1% risk, 10 straight losses ≈ −9.6% (survivable); at 5% risk ≈ −40% (behavior-breaking). **Circuit breaker:** at −10% from equity high, halve risk; at −20%, stop opening new positions.

**ATR-based stops + Chandelier trailing exit** (volatility-adaptive, so the stop fits each stock):
```
Initial stop (long) = Entry − k × ATR(14)          k = 2 to 2.5
Chandelier trail     = HighestHigh(22) − 3 × ATR(22)   (only ratchets up)
```
Caveat: stops don't protect against overnight gaps — a real, unhedged tail risk for swing holds (mitigated partly by the earnings guard).

**R-multiples & expectancy** (measures whether the system has any edge at all):
```
R-multiple  = (Exit − Entry) / (Entry − Stop)
Expectancy  = winrate × avgWinR − lossrate × avgLossR     (want > 0)
SQN         = √N × mean(R) / stdev(R)     (Tharp: <1.6 untradeable, 2.5+ good)
```
Log every trade's R from day one. Don't trust expectancy/SQN until 30+ trades, provisional to 100+.

**Kelly = ceiling check only, not the sizing engine.** `f* = p − q/b`; use ¼–½ Kelly. In practice Kelly recommends *far* more risk than the 0.5–1% rule, so use it only to confirm we're nowhere near over-betting.

**Volatility-targeting overlay (peer-reviewed, Strong).** Barroso & Santa-Clara: scaling position size inversely to recent volatility raised momentum's Sharpe **0.53 → 0.97 and virtually eliminated crashes** — signal unchanged. Moreira & Muir replicate across factors. → **Reduce size ~30–50% when the stock's or market's realized vol runs well above its trailing average.**

**Small-account defaults:** 0.5–1% risk/trade; cap total open risk 4–6%; single-position cap 20–25% (take the smaller of risk-based and cap); liquid names only (multi-$M avg daily $-volume); limit / stop-limit orders to bound slippage ($0 commissions, but spread+slippage on illiquid names can eat 10%+ of the R budget).

---

## 3. Anchor-setup candidates (we backtest ONE first)

**#1 — Connors RSI(2) mean-reversion** *(Moderate; best horizon fit).* The only practitioner method with real, reproduced out-of-sample backtests, and natively a ~4-day hold.
```
Filter:  Close > 200-day SMA        (only buy dips in an uptrend)
Buy:     RSI(2) < 5   (looser: < 10) on the close
Exit:    Close > 5-day SMA   (or RSI(2) > 65–70)
Variants: 3-day cumulative RSI(2) < 20; or Bollinger %b < 0.2 for 3 closes → exit %b > 0.8
```
High win rate (~80%) but small per-trade edge; **decayed since the 2008 book** (SPY OOS fell to ~1.35%/yr). Co-author Alvarez now excludes large index-member names to restore edge. Treat published numbers as an upper bound; costs matter at this frequency.

**#2 — Earnings-surprise continuation (PEAD / SUE)** *(Strong evidence, partial horizon fit).* Big, clean earnings beat → price drifts up for 60+ trading days. A 2–10 day hold captures only the *front* of the drift, but the mechanism is the most-replicated anomaly in finance (Ball-Brown 1968 → Bernard-Thomas → 50 yrs). Long-only is fine (most of the edge is in the long leg). Decayed but not dead. Signal = SUE (standardized surprise) or the 3-day earnings-announcement return (EAR).

**Alternatives with tighter horizon fit but weaker/contested proof:** around-earnings reversal (So-Wang: ~6× stronger reversal in the days around earnings, liquidity-driven); single-large-down-day rebound (Cox-Peterson — but partly bid-ask-bounce, works after *declines* not advances, cost-sensitive).

---

## 4. Context gates & structural biases (Strong evidence, used as filters not triggers)

- **Momentum 12-1 (Jegadeesh-Titman):** monthly-horizon, so **not** a same-week signal — use as a *quality gate* (only take long setups in stocks already in an established uptrend / near 52-week high). Note momentum "crash" risk in sharp rebounds.
- **Overnight drift (Cooper-Cliff-Gulen; Berkman; Lou-Polk-Skouras):** US equity returns historically accrue overnight, and buying *at the open* into a gap tends to reverse intraday ("hidden cost of buying at the open"). → structural bias to **enter near the close / hold overnight** rather than chase the open. Not a stock-picker; barely exploitable standalone net of costs.
- **Market-regime gate:** only go long in a risk-on tape (SPY above its trend, VIX not spiking). Code computes it; LLM narrates.
- **Relative-volume screen (from the ORB paper):** `RVOL = today's early volume / 14-day avg` to surface "stocks in play." Use as an after-hours *screen* to build the watchlist — there is **no** credible evidence RVOL alone predicts next-day direction (the "RVOL sweet-spot" stats online trace to fabricated sources).
- **Earnings guard:** for every candidate, pull the next earnings date + options-implied move + historical post-earnings gap behavior; **don't hold through earnings.** (JPMorgan-style pre-earnings module from the prompt research.)

---

## 5. Practitioner methods — idea sources only (Weak–Anecdotal)

Real people, real (sometimes huge) track records, but **no independent backtests** — single-trader results with survivorship/variance not shown. Mine them for *setup ideas*, don't treat as proof.

- **Minervini SEPA / VCP:** 8-criterion trend template + "volatility contraction" base → breakout entry, ~7–8% stop, 2% risk. Proof = 2× US Investing Championship wins (audited, but a contest ≠ a backtest; no independent VCP backtest exists).
- **Qullamaggie (Kullamägi):** breakouts + "episodic pivots" (gap ≥10% on heavy volume out of a base, buy above the early-day high); cut losers same/next day, trail winners. Turned ~$5k → ~$100M — but **drew down ~$60M** from the peak (the variance the anecdotes omit).
- **Stockbee (Bonde) 4% breakout:** `close/prior_close > 1.04 AND volume rising`, 3–10 day hold. Clean mechanical rule, **zero independent verification found** — backtest it ourselves before trusting.
- **CAN SLIM (O'Neil):** growth fundamentals + base breakout in an uptrend. AAII's tracked *paper* screen did well for years, but the real-money implementations (CANGX fund, FFTY ETF) **badly underperformed** — a cautionary gap between screen and live.
- **Darvas box, Raschke "Holy Grail" (ADX>30, first pullback to 20-EMA):** influential heuristics, no rigorous backtest; Raschke's is originally a futures/intraday idea.
- **ORB / VWAP (Zarattini):** transparent methodology and eye-catching numbers, but **unrefereed, commercial authors, require 5-minute intraday execution, and lean on 3× leveraged ETFs** for the headline returns. Not swing-compatible; only the "stocks in play" RVOL screen transfers.

---

## 6. Validation discipline — how not to fool ourselves (Strong meta-evidence)

Given backtests explain <3% of live results, the process matters more than the backtest number:

1. **Walk-forward out-of-sample:** optimize on window N, test on unseen N+1, roll forward. Never let the test slice touch parameter selection.
2. **≤3 parameters.** Every extra knob is a dimension to curve-fit noise. Demand robustness (edge shouldn't vanish if a threshold moves 10–20%).
3. **Count how many variants you try.** Harvey-Liu-Zhu: a real new factor should clear **t > 3.0**, not 2.0 — and that bar rises with every variant tested.
4. **Model real frictions from the start:** spread, slippage, and **short-term capital-gains tax = ordinary income** (a same/next-day strategy is 100% short-term → for a high earner, a ~35% fed + ~10% CA haircut on every gain, vs. 15–20% long-term). Watch the wash-sale rule when re-entering the same names.
5. **Demand an economic/behavioral *reason*** the edge exists (underreaction, liquidity premium, forced flow) — not "it backtested well."
6. **Paper-trade live, then small size,** before scaling. Judge everything **after-tax vs. simply holding SPY.**

---

## 7. Key sources

**Base rates / costs:** Chague, De-Losso & Giovannetti "Day Trading for a Living?" (SSRN 3423101) · Barber, Lee, Liu, Odean & Zhang Taiwan studies (2004; RAPS 2020) · Barber & Odean "Trading Is Hazardous to Your Wealth" (JF 2000), "Boys Will Be Boys" (QJE 2001) · SPIVA U.S. Scorecard (spglobal.com/spdji) · Wiecki et al. "All That Glitters Is Not Gold" (SSRN 2745220) · McLean & Pontiff (JF 2016, SSRN 2156623) · Harvey, Liu & Zhu "…and the Cross-Section of Expected Returns" (NBER w20592) · Bailey & López de Prado "Pseudo-Mathematics and Financial Charlatanism" (AMS 2014).

**Anomalies:** Jegadeesh & Titman (JF 1993) · Bernard & Thomas PEAD (JAR 1989, JAE 1990) · Foster-Olsen-Shevlin SUE (1984) · George & Hwang 52-week high (JF 2004) · Womack (JF 1996); Barber et al. "Can Investors Profit from the Prophets?" (JF 2001) · Lehmann (QJE 1990); Cox & Peterson (JF 1994) · So & Wang (JFE 2014).

**Intraday/overnight:** Cooper, Cliff & Gulen (SSRN 1004081) · Berkman et al. (JFQA 2012) · Lou, Polk & Skouras (JFE 2019) · Gao, Han, Li & Zhou "Market Intraday Momentum" (JFE 2018) · Zarattini & Aziz ORB (2023) / Zarattini, Barbon & Aziz (SSRN 4729284) · Haghani et al. "Night Moves" (SSRN 4139328).

**Practitioner:** Connors & Alvarez *Short Term Trading Strategies That Work* (2008) + Alvarez blog re-tests (alvarezquanttrading.com) · O'Neil *How to Make Money in Stocks* + AAII CAN SLIM screen · Minervini *Trade Like a Stock Market Wizard* · Kullamägi (qullamaggie.com) · Bonde (stockbee.blogspot.com).

**Risk/sizing:** Van Tharp *Trade Your Way to Financial Freedom* (R-multiples, expectancy, SQN) · Ralph Vince (fixed-fractional) · Thorp on Kelly · Barroso & Santa-Clara "Momentum Has Its Moments" (JFE 2015, SSRN 2041429) · Moreira & Muir "Volatility-Managed Portfolios" (JF 2017).

---

## 8. Decisions so far (design)

- **Horizon:** widened from strict same/next-day to a **2–10 day swing** — where the real evidence lives, and which eases PDT, short-term-tax, and H1B "trading-as-a-business" pressure. *(Prerequisite: confirm the active-trading question with an immigration attorney before going live.)*
- **Architecture (layered, code-computes-numbers):** market-regime gate → code-driven screen/watchlist → **code-computed entry trigger** → LLM conviction/thesis + forced bear case + earnings guard on real fetched data → risk/exit engine (this note's §2) → **real-code** backtest/validation (§6) → journal + notify.
- **Build order:** (1) the risk/sizing foundation (§2), then (2) one backtestable anchor setup — **Connors RSI(2) mean-reversion** as the leading candidate, with PEAD as the alternative.
- **Never trusted from an LLM:** any number, backtest, or "Sharpe" it didn't compute in real code on real data.

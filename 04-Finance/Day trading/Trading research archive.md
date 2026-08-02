---

---

# Trading research archive (Phases 0–13 + case study, 2026-07-25/29)

> Compacted 2026-07-26 from 24 phase notes at the user's request. Full notes, all research code, and data caches preserved outside the vault at `~/marketdata/swing-research-archive/`. Method throughout: **pre-registration** (rules frozen before results), discovery(2010–18)/vault(2019–24) splits, expectancy-first gates (hit rate never gates), costs + 45% short-term tax modeled, t≥3 bar (t≥4 for large grids), survivorship direction declared (FAIL trustworthy, PASS discounted). Contract: code computes every number; no tuning after results; new hypotheses need fresh pre-registration.

## Phase verdicts (all pre-registered, all final)

| # | Hypothesis | Key numbers | Verdict |
|---|---|---|---|
| 0 | Connors RSI(2) mean-reversion | gross t=3.57 at zero cost; dies at ~11bps/side; +1.6%/yr after tax vs SPY +13.7% | FAIL (costs) |
| 2 | Large-cap PEAD (earnings drift) | 548 OOS trades, **+0.123R, t=3.11 net** — the program's only real net edge | REAL but immaterial at $20k (~39 events/yr) |
| 3 | Signal research (6-agent sweep) | politicians refuted; reddit virality = reversal (−4.7%/20d) → veto; targets/inclusion/FDA/trends dead | Produced approaches #1–5 below |
| 4 | Insider cluster buying | 557 OOS trades, +0.141R, t=2.21; loses to SPY deployed | FAIL |
| 5 | Neglected small-cap PEAD | 1,191 OOS trades, **−0.069R, t=−2.67** | FAIL (actively loses) |
| 6 | 13D activist drift | 641 OOS trades, −0.036R, t=−0.65 | FAIL |
| 7A | Multi-family confluence | 318 events/15y; 75 trades, t=0.35 | FAIL |
| 7B | Calibrated ">80% confidence" engine | Brier 0.2509 vs 0.2497 base = zero discrimination; 6 events ≥0.8 in 13y, hit 66.7% | FAIL — the goal is empirically empty on free data |
| 8 | Reverse discovery ("work backwards from profits") | 15,411 profit episodes; **catchability ceiling 1.69%** (share preceded by any free public event); 11 invented patterns → 10 dead; capitulation passed hit-rate vault but −3.3% expectancy | FAIL except ↓ |
| 9 | Tax-loss rebound (Nov/Dec, YTD≤−40%, insider buy) | vault-confirmed +2.09%/ev vs +0.45% base, but portfolio t=2.47<3, deployed edge ≈ $112/15yr | REAL but beer money |
| 10 | FNSPID news (3.6M articles, typed taxonomy) | news presence directionless (36.8% vs 38.4% controls); **attention tax −0.20%/d, t=−59**; no positive-news cell t>1.5 of ~800 | FAIL — news is priced by next open |
| 11 | Friend's exit mechanics (delta-equivalent) | all 6 cells negative (t −3.7…−10.1); every arm **worse than plain 10d hold** (−0.07…−0.29%/ev) while making 58–60% hit rates vs 48% | FAIL — take-profit/no-stop buys hit rate by selling expectancy |
| 12 | Ross hook entry timing (confirmation break vs immediate dip-buy) | 1,974 hooks, 18 live-watchlist names, 2010–24; paired early stop-outs **39.9% vs 27.9% — confirmation entries WORSE (+12.1pp, McNemar p=2.8e-12)**; entry penalty 3.1%; expectancy vs uptrend drift t=1.57; the seductive "skipped hooks lost −1.9%" is survivor selection, not foresight | FAIL, sign reversed — buy-stop fills at a local high, so our −2%-stock stop sits inside ordinary breakout-retest noise; routine checkbox retired |
| 13 | Macro-calendar blackout (avoid entering before FOMC/CPI/jobs days; earnings rule generalized) | 1,325 matched pairs, 349 ground-truth event dates 2010–24; event-eve early stop-outs **36.4% vs 37.4% control (t=−0.50)** — no harm; mean \|move\| day after entry **1.4% event vs 1.4% quiet**; "sell in May" dead (t=−0.44); April t=−4.15 *against* folklore = clustering artifact caught live (effective n ≈ 15 Aprils) | FAIL — macro days are index-sized (1–3%) events invisible inside mega-cap daily noise; earnings (5–10% single-name) stays the only calendar gate |

## Case study — the friend's options ledger (basis for the live copilot)

25 trades Dec 2024–Mar 2026, reconstructed from broker screenshots + investor chat, twice independently verified: net **+$6,589** (t=0.28), 76% win rate manufactured by exits (avg win $1,935 / avg loss −$5,029); GOOGL $205 earnings bet rode 137d to $0 (−$19,206 = 10 months of wins); entries no alpha (t≈1); his verbal reports to his investor overstated results by ~$4.1k (one fabricated win, two hidden losses); he took 30% of wins, 0% of losses. **What was worth keeping** → the copilot's spec: 5–7-month ~5%-OTM calls on hyper-liquid mega-caps (low-theta leverage wrapper), instant GTC take-profit +12% decaying to +6% (day 5) and market exit (day 10) — **plus the two rules he lacked**: −15% premium stop, 12-trading-day earnings blackout, and 2%-risk sizing instead of all-in.

## Standing conclusions

1. No free-data, daily-latency signal class survived 13 pre-registered tests; the two real effects (PEAD, tax-loss rebound) are economically immaterial at $20k. Sub-hour event trading remains untested (needs paid intraday data — the one open door).
2. Hit rate is manufacturable and is not expectancy; one discipline failure erases months; attention/news chasing measurably loses; index compounding + career is the edge at this scale.
3. Anything new gets a fresh pre-registration against these bars before a dollar moves.

**Live system now:** [[Options copilot journal]] · rules + commands in `80-LifeOS/Options copilot instructions.md` · monitor/weekly on Friday's HEARTBEAT.

# Options copilot instructions

Rules-enforcement copilot for live discretionary call-buying. **Notify-only**: the human executes at the broker; the scripts enforce the mechanics, journal everything, and alert on Telegram. Built 2026-07-26 from the reverse-engineered case-study system plus the two rules it fatally lacked (hard stop, earnings blackout). Evidence record: `04-Finance/Day trading/Trading research archive.md`.

## Runtime

- Script: `80-LifeOS/_scripts/swing/live/copilot.py`, run with `80-LifeOS/_scripts/swing/.venv/bin/python`.
- One-time setup on a new machine: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` inside `_scripts/swing/` (if pip 401s on an internal registry, add `--index-url https://pypi.org/simple`).
- State: `live/state.json` (positions, closed trades, config — edit `account_size`/`start_equity` there). Journal: `04-Finance/Day trading/Options copilot journal.md` (auto-appended). Telegram creds: `~/.openclaw/telegram.json` (same file the news digest uses).

## Commands (Friday: map user messages to these and relay output verbatim)

| User says | Run |
|---|---|
| "options ticket AMZN because &lt;reason&gt;" | `copilot.py ticket AMZN --reason "<reason>"` |
| "bought AMZN 230 2026-12-18 2 14.05" | `copilot.py bought AMZN 230 2026-12-18 2 14.05` |
| "sold AMZN 230 2026-12-18 15.80 profit" | `copilot.py sold AMZN 230 2026-12-18 15.80 --why profit` (why ∈ profit/timeout/stop/earnings/manual) |
| "options status" | `copilot.py status` |
| "options report NVDA" | `copilot.py report NVDA` (TLDR checklist + screen, earnings gate, technicals, options pricing, fundamentals, analyst ratings, news) |

| "personality NVDA" | `copilot.py personality NVDA` (refreshes the stats block in `04-Finance/Day trading/Personalities/NVDA.md`, creating the note if new) |
| "scout AMD UBER DIS" | `copilot.py scout AMD UBER DIS` (runs each through every gate, prints PASS/FAIL with reasons; `--add` appends passers to the watchlist) |
| "options selftest" | `copilot.py selftest` (checks deps, state, vault write, market data, AV key, and sends a Telegram ping — run after deployment and whenever alerts seem quiet) |

**Liveness + post-exit tracking**: every monitor invocation stamps `state.json`; the Sunday digest reports how many times the monitor ran (🚨 if zero while positions were open — run selftest immediately). The digest also back-fills each closed trade with the stock's 5-day move AFTER the exit; audits then show average post-exit drift by exit reason — the evidence needed before ever adjusting stop/timeout parameters.

**Watchlist vs tradeable**: the watchlist (state.json config) drives observation only — pulse, personalities, weekly refresh. Whether a name can be TRADED is decided per-ticket by the gates. Never trade SNAP through this system (employer securities — trading windows / insider policy).

**Personality pulse (automatic)**: `copilot.py pulse` runs daily after the close via HEARTBEAT. On ordinary days it writes and says nothing. On statistically unusual days (move ≥2× typical range, gap ≥3%, volume ≥3×, 50d/200d crossing, new 52-week extreme) it appends a dated `AUTO:` line with the day's facts + top headlines to that stock's observations log and reports via Telegram. Friday then applies judgment: only if the captured news genuinely changes what the stock trades on, append one dated line to that note's narrative section. Weekly stats refresh remains separate.

**Personality notes**: one note per stock — an auto-refreshed behavioral stats block (movement, stop-noise frequency, dip/run response, earnings reactions, analyst tape) plus hand-maintained "What it trades on" and an append-only observations log. The weekly digest refreshes every ticker in the state.json `watchlist`. When the user shares an observation about a stock ("META always fades its open pops"), append it dated to that stock's observations log — never rewrite old entries. These are descriptive expectations, not signals; any pattern that looks tradeable goes through a fresh pre-registration before it's trusted.

**Report TLDR**: 14 scored checks spanning every free information family — liquidity (Screen), calendar (Earnings), macro regime (SPY vs 200d + VIX), price direction (Trend), cross-sectional (Rel strength vs SPY), price stretch (Momentum, Extension — siblings), volatility (Daily range, Beta — siblings), option cost (Vol pricing), attention (Volume), positioning (Short interest, Options put/call OI), informed money (Insiders). Each evaluated against documented consensus ranges (🟢/🟡/🔴 + plain-English reason; verdict = CLEAN / MIXED / CAUTION, plus a "% favorable" triage number). It scores *conditions, not direction* — never present it as a probability of profit. **To add a new signal**: compute it into the metrics dict `m` in `collect_metrics` and add ONE `RUBRIC` entry — the TLDR includes it automatically. Fundamentals/analysts/news stay unscored (context only; measured as non-predictive). The daily pulse also appends each watchlist name's ATM IV to `live/iv_history.csv` — after ~6 months this self-built history enables a true IV-rank check (otherwise paid data).

## The rules the scripts enforce (do not soften these when relaying)

1. **Stock screen**: price > $20, 3-month average volume > 1M shares/day, float > 50M shares — unknown data fails closed (`--override-screen` only for verified data gaps).
2. **Earnings blackout**: no ticket within 12 trading days of the next earnings date, cross-checked against two sources (yfinance + AlphaVantage; disagreement → earlier date wins) — no override when a date is known. (The case-study trader broke this once: −$19,206.)
3. **Sizing**: contracts sized so a *realistically slipped* stop-out (assumed fill −25% of premium, not the −15% alert level) risks ≤2% of the account. Never the whole account.
4. **Exits — no profit cap (changed 2026-07-27 per Phase 11 evidence: profit ladders tested strictly worse than plain holds)**: hard stop alert at −15% of premium (sell at market same hour; monitor re-alerts hourly), timeout exit at market on day 10. Early discretionary sells are allowed and journaled with `--why`.
5. **Cooloff**: after any stop-out, that ticker is refused for 5 days — the anti-revenge-trade rule.
6. **Kill-switch**: 3 consecutive stop-outs, −15% realized drawdown, or −15% **marked-to-market** drawdown (open unrealized losses count, checked by the monitor) → tickets disabled for 14 days.
7. **PDT**: warns when a same-day exit would be the 3rd day-trade in 5 sessions.
8. **Entry snapshots**: every `bought` freezes the full rubric (metrics + colors) into the position record — a prospectively labeled dataset. Every 20 closed trades the weekly digest includes the audit (expectancy, t-stat, exits by reason, vs-SPY benchmark); once enough trades exist, audits can slice expectancy by entry condition.

## Honest limits

Quotes are yfinance, ~15 minutes delayed — alerts are rules-reminders with lag, fine for 0–14-day holds, useless faster. Weekend/after-hours option quotes are stale-wide; tickets during market hours only. The measured expectation of the underlying system is levered market beta (see archive) — the copilot's job is to keep the downside survivable, not to create edge.

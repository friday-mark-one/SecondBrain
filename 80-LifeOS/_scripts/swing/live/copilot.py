"""Options copilot — rules enforcement for live discretionary call-buying.

Notify-only: the human picks entries and presses the broker buttons; this
enforces the mechanical rules (earnings gate, sizing, ladder, stop, PDT,
kill-switch), journals every action to the vault, and alerts via Telegram.

Commands (run with swing/.venv/bin/python):
    copilot.py ticket TICKER --reason "..."            pre-trade gatekeeper
    copilot.py bought TICKER STRIKE EXPIRY QTY PREM    record a fill
    copilot.py sold   TICKER STRIKE EXPIRY PREM --why tp|decay|timeout|stop|earnings|manual
    copilot.py monitor                                 heartbeat: alert only when a rule fires
    copilot.py weekly                                  Sunday digest + rolling audit
    copilot.py status                                  on-demand summary
"""

import argparse
import json
import math
import statistics
import sys
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ET = ZoneInfo("America/New_York")
HERE = Path(__file__).resolve().parent
STATE_PATH = HERE / "state.json"
VAULT = Path(__file__).resolve().parents[4]
JOURNAL = VAULT / "04-Finance" / "Day trading" / "Options copilot journal.md"
CRED_PATH = Path.home() / ".openclaw" / "telegram.json"

DEFAULTS = {
    "account_size": 20000.0,
    "start_equity": 20000.0,
    "risk_pct": 0.02,          # max account risk per trade
    "stop_pct": 0.15,          # stop ALERT at -15% of premium
    "stop_slippage_fill": 0.25,  # sizing assumes the stop actually fills at -25% (gaps, delay)
    "timeout_day": 10,
    "cooloff_days": 5,         # no re-entry in a name after a stop-out
    "earnings_blackout_bdays": 12,
    "otm_target": 0.05,
    "expiry_min_days": 150,
    "expiry_max_days": 215,
    "spread_max": 0.015,       # (ask-bid)/mid ceiling
    "delta_band": [0.35, 0.55],
    "kill_drawdown": 0.15,
    "kill_consecutive_stops": 3,
    "pause_days": 14,
    "tax_reserve_pct": 0.40,
    "risk_free": 0.04,
    "min_price": 20.0,
    "min_avg_volume": 1_000_000,
    "min_float_shares": 50_000_000,
    "iv_rv_warn": 1.4,         # warn when IV is this multiple of realized vol
    "watchlist": ["AAPL", "AMZN", "GOOGL", "META", "NVDA"],
}

PERSONALITY_DIR_NAME = "Personalities"
GEN_START, GEN_END = "<!-- personality:generated:start -->", "<!-- personality:generated:end -->"

# Creation-time narrative seeds (common-knowledge context; hand-maintained afterwards).
NARRATIVE_SEEDS = {
    "AAPL": ["iPhone cycle + services growth; China demand and App Store regulation are the recurring scares",
             "Massive buybacks cushion drawdowns; moves less than the other mega-caps"],
    "AMZN": ["Trades on AWS growth rate + retail margins; capex guidance moves it",
             "Consumer-spending proxy — macro prints (CPI, jobs) hit it harder than peers"],
    "GOOGL": ["Search-ads health vs AI-disruption narrative; antitrust rulings are the overhang",
              "Cheapest mega-cap by multiple most of the time — 'cheap' has been the bull case for years (see case study: that thesis rode to $0 once)"],
    "META": ["Ad revenue + capex discipline story; reacts violently to spend-guidance changes",
             "History of −20%+ single-day earnings moves — respect the blackout"],
    "NVDA": ["Pure AI-capex cycle: hyperscaler orders, supply constraints, China export rules",
             "Highest beta of the group; the whole market's AI mood expresses through it"],
}


# ---------- state ----------

def load_state() -> dict:
    if STATE_PATH.exists():
        state = json.loads(STATE_PATH.read_text())
    else:
        state = {"config": dict(DEFAULTS), "positions": [], "closed": [],
                 "kill_until": None, "alerts": {}, "last_weekly": None}
    for k, v in DEFAULTS.items():          # new config keys get defaults
        state["config"].setdefault(k, v)
    state.setdefault("cooloff", {})
    return state


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, default=str) + "\n")


# ---------- pure rule logic (unit-tested, no I/O) ----------

def bdays_between(a: date, b: date) -> int:
    """Trading-day count from a to b (weekend-aware; holidays ignored)."""
    if b <= a:
        return 0
    n, d = 0, a
    while d < b:
        d += timedelta(days=1)
        if d.weekday() < 5:
            n += 1
    return n


def pick_strike(calls, spot: float, cfg: dict):
    """Choose the most liquid strike in the 2–8% OTM band (tightest spread wins,
    distance from the 5% target breaks ties). Liquidity lives at round strikes."""
    band = calls[(calls["strike"] >= spot * 1.02) & (calls["strike"] <= spot * 1.08)].copy()
    band = band[(band["bid"] > 0) & (band["ask"] > 0)]
    if band.empty:
        return None
    target = spot * (1 + cfg["otm_target"])
    band["spread_pct"] = (band["ask"] - band["bid"]) / ((band["ask"] + band["bid"]) / 2)
    band["dist"] = (band["strike"] - target).abs()
    return band.sort_values(["spread_pct", "dist"]).iloc[0]


def size_position(cfg: dict, mid: float) -> int:
    """Contracts such that a realistic stop-out (with gap/delay slippage past the
    -15% alert level, assumed to fill at stop_slippage_fill) risks <= risk_pct."""
    risk_per_contract = cfg["stop_slippage_fill"] * mid * 100
    return int(cfg["risk_pct"] * cfg["account_size"] // risk_per_contract)


def _d1(spot: float, strike: float, t: float, iv: float, r: float) -> float:
    return (math.log(spot / strike) + (r + iv * iv / 2) * t) / (iv * math.sqrt(t))


def bs_call_delta(spot: float, strike: float, days: float, iv: float, r: float) -> float:
    t = max(days, 1) / 365.0
    if iv <= 0 or spot <= 0 or strike <= 0:
        return float("nan")
    return 0.5 * (1 + math.erf(_d1(spot, strike, t, iv, r) / math.sqrt(2)))


def bs_call_theta_day(spot: float, strike: float, days: float, iv: float, r: float) -> float:
    """Daily theta in $ per share (negative = decay)."""
    t = max(days, 1) / 365.0
    if iv <= 0 or spot <= 0 or strike <= 0:
        return float("nan")
    d1 = _d1(spot, strike, t, iv, r)
    d2 = d1 - iv * math.sqrt(t)
    pdf = math.exp(-d1 * d1 / 2) / math.sqrt(2 * math.pi)
    cdf2 = 0.5 * (1 + math.erf(d2 / math.sqrt(2)))
    theta_yr = -(spot * pdf * iv) / (2 * math.sqrt(t)) - r * strike * math.exp(-r * t) * cdf2
    return theta_yr / 365.0


def realized_vol(closes, n: int = 20) -> float:
    """Annualized realized volatility from the last n daily log returns."""
    import numpy as np
    r = np.log(closes / closes.shift(1)).dropna().iloc[-n:]
    return float(r.std(ddof=1) * math.sqrt(252)) if len(r) >= n // 2 else float("nan")


def screen_failures(cfg: dict, spot: float | None, avg_volume: float | None,
                    float_shares: float | None) -> list[str]:
    """Stock-level gate: price > $20, avg volume > 1M sh/day, float > 50M sh.
    Unknown data fails closed (caller offers --override-screen for data gaps)."""
    fails = []
    if spot is None:
        fails.append("price unknown")
    elif spot <= cfg["min_price"]:
        fails.append(f"price ${spot:.2f} <= ${cfg['min_price']:.0f}")
    if avg_volume is None:
        fails.append("avg volume unknown")
    elif avg_volume < cfg["min_avg_volume"]:
        fails.append(f"avg volume {avg_volume / 1e6:.2f}M < {cfg['min_avg_volume'] / 1e6:.0f}M/day")
    if float_shares is None:
        fails.append("float unknown")
    elif float_shares < cfg["min_float_shares"]:
        fails.append(f"float {float_shares / 1e6:.0f}M sh < {cfg['min_float_shares'] / 1e6:.0f}M")
    return fails


def rsi(closes, n: int = 14) -> float:
    """Wilder RSI on a pandas Series of closes."""
    delta = closes.diff()
    up = delta.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    down = (-delta.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = up.iloc[-1] / down.iloc[-1] if down.iloc[-1] > 0 else float("inf")
    return 100 - 100 / (1 + rs)


# ---------- report rubric ----------
# Each entry: (label, fn(cfg, m) -> (color, plain-English text) | None if data absent).
# Thresholds are documented consensus ranges, not backtested signals. To add a new
# signal to the report TLDR: compute it into `m` in cmd_report and add ONE entry here —
# the summary picks it up automatically.

def _chk_screen(cfg, m):
    fails = m.get("screen_fails")
    if fails is None:
        return None
    return ("green", "liquid large-cap (price/volume/float all pass)") if not fails \
        else ("red", "; ".join(fails))


def _chk_earnings(cfg, m):
    n = m.get("earnings_bdays")
    if n is None:
        return ("yellow", "next earnings date unknown — verify before trading")
    if n <= cfg["earnings_blackout_bdays"]:
        return ("red", f"earnings in {n} trading days — ticket gate will refuse")
    if n <= cfg["earnings_blackout_bdays"] + 8:
        return ("yellow", f"earnings in {n} trading days — window is closing")
    return ("green", f"earnings {n} trading days away")


def _chk_trend(cfg, m):
    spot, s50, s200 = m.get("spot"), m.get("sma50"), m.get("sma200")
    if not all(isinstance(x, (int, float)) and x == x for x in (spot, s50, s200)):
        return None
    if spot > s50 and spot > s200:
        return ("green", "uptrend — above both 50d and 200d averages")
    if spot > s200:
        return ("yellow", "pullback — above 200d but below 50d")
    return ("red", "downtrend — long calls fight the tape below both averages")


def _chk_rsi(cfg, m):
    r = m.get("rsi14")
    if r is None or r != r:
        return None
    if r < 30:
        return ("yellow", f"RSI {r:.0f} — oversold; bounces happen but so do knives")
    if r <= 70:
        return ("green", f"RSI {r:.0f} — neither stretched nor broken (40-70 is neutral zone)")
    if r <= 80:
        return ("yellow", f"RSI {r:.0f} — overbought; you'd be chasing (consensus: >70 hot)")
    return ("red", f"RSI {r:.0f} — extreme; late to the move")


def _chk_extension(cfg, m):
    e = m.get("ext_atr")
    if e is None or e != e:
        return None
    if abs(e) <= 2:
        return ("green", f"{e:+.1f} ATRs from 50d — near its trend, not chasing a spike")
    if abs(e) <= 4:
        return ("yellow", f"{e:+.1f} ATRs from 50d — extended (>±2 is stretched)")
    return ("red", f"{e:+.1f} ATRs from 50d — parabolic/waterfall territory")


def _chk_daily_range(cfg, m):
    a = m.get("atr_pct")
    if a is None or a != a:
        return None
    if a <= 0.02:
        return ("green", f"moves {a:.1%}/day — calm; stop unlikely to trip on noise")
    if a <= 0.04:
        return ("yellow", f"moves {a:.1%}/day — brisk; normal wobble can approach the stop")
    return ("red", f"moves {a:.1%}/day — wild; a routine 2-day dip can hit your −15% stop")


def _chk_rvol(cfg, m):
    v = m.get("rvol")
    if v is None or v != v:
        return None
    if v <= 1.5:
        return ("green", f"volume {v:.1f}× normal — no crowd")
    if v <= 3:
        return ("yellow", f"volume {v:.1f}× normal — attention day (the program measured "
                          f"attention-chasing as a net cost)")
    return ("red", f"volume {v:.1f}× normal — the crowd is here; entries are worst on these days")


def _chk_beta(cfg, m):
    b = m.get("beta")
    if b is None:
        return None
    if b <= 1.5:
        return ("green", f"beta {b:.1f} — market-like mover")
    if b <= 2.0:
        return ("yellow", f"beta {b:.1f} — hot stock; your option leverage multiplies this")
    return ("red", f"beta {b:.1f} — very hot; ~7× option leverage becomes ~{7 * b:.0f}× market exposure")


def _chk_short(cfg, m):
    s = m.get("short_pct")
    if s is None:
        return None
    if s < 0.05:
        return ("green", f"short interest {s:.1%} — no battleground dynamics")
    if s <= 0.10:
        return ("yellow", f"short interest {s:.1%} — contested name, extra volatility")
    return ("red", f"short interest {s:.1%} — battleground; violent both ways")


def _chk_vol_pricing(cfg, m):
    iv, rv = m.get("iv6"), m.get("rv20")
    if iv is None or iv != iv:
        return ("yellow", "IV unavailable (stale/after-hours quote) — check during market hours")
    if not rv or rv != rv:
        return None
    ratio = iv / rv
    if ratio < 1.0:
        return ("green", f"IV {iv:.0%} below realized {rv:.0%} — volatility is cheap to buy")
    if ratio < cfg["iv_rv_warn"]:
        return ("green", f"IV {iv:.0%} vs realized {rv:.0%} ({ratio:.1f}×) — fairly priced")
    if ratio < 1.8:
        return ("yellow", f"IV {iv:.0%} vs realized {rv:.0%} ({ratio:.1f}×) — rich; "
                          f"you'd overpay for volatility")
    return ("red", f"IV {iv:.0%} vs realized {rv:.0%} ({ratio:.1f}×) — very rich; "
                   f"IV-crush can eat a correct directional call")


def _chk_regime(cfg, m):
    ext, vix = m.get("spy_ext"), m.get("vix")
    if ext is None or ext != ext:
        return None
    if ext < 0:
        return ("red", f"SPY {ext:+.1%} vs its 200d — risk-off tape; the case-study "
                       f"trader's cash periods beat his trades in these")
    if vix is not None and vix == vix and vix >= 28:
        return ("yellow", f"SPY above trend but VIX {vix:.0f} — nervous market")
    if vix is not None and vix == vix and vix >= 20:
        return ("yellow", f"risk-on but VIX {vix:.0f} elevated (calm is <20)")
    return ("green", f"risk-on: SPY {ext:+.1%} above its 200d"
                     + (f", VIX {vix:.0f}" if vix and vix == vix else ""))


def _chk_rel_strength(cfg, m):
    rs = m.get("rs_60d")
    if rs is None or rs != rs:
        return None
    if rs > 0.05:
        return ("green", f"outperforming SPY by {rs:+.1%} over 60d — market leader")
    if rs > -0.05:
        return ("green", f"tracking the market ({rs:+.1%} vs SPY, 60d)")
    if rs > -0.15:
        return ("yellow", f"lagging SPY by {rs:+.1%} over 60d")
    return ("red", f"chronic laggard: {rs:+.1%} vs SPY over 60d")


def _chk_insiders(cfg, m):
    buys, sales = m.get("insider_buys"), m.get("insider_sales")
    if buys is None:
        return None
    if buys > 0:
        return ("green", f"{buys} insider purchase(s) in 90d — uncommon in large caps "
                         f"(tested Phase 4: informative, not predictive alone)")
    return ("green", f"only routine insider selling ({sales} sales, 90d) — normal for "
                     f"large caps, carries no information")


def _chk_options_positioning(cfg, m):
    pc = m.get("pc_oi")
    if pc is None or pc != pc:
        return None
    if pc > 1.5:
        return ("yellow", f"put/call OI {pc:.2f} — options crowd is hedged/bearish here")
    if pc < 0.4:
        return ("yellow", f"put/call OI {pc:.2f} — call-crowded (froth risk)")
    return ("green", f"put/call OI {pc:.2f} — balanced positioning")


# Ordered by information family: liquidity, calendar, macro, price-direction,
# cross-sectional, price-stretch (x2), volatility (x2), option-cost, attention,
# positioning (x2), informed money.
RUBRIC = [
    ("Screen", _chk_screen), ("Earnings", _chk_earnings), ("Regime", _chk_regime),
    ("Trend", _chk_trend), ("Rel strength", _chk_rel_strength),
    ("Momentum", _chk_rsi), ("Extension", _chk_extension),
    ("Daily range", _chk_daily_range), ("Beta", _chk_beta),
    ("Vol pricing", _chk_vol_pricing), ("Volume", _chk_rvol),
    ("Short interest", _chk_short), ("Options positioning", _chk_options_positioning),
    ("Insiders", _chk_insiders),
]

EMOJI = {"green": "🟢", "yellow": "🟡", "red": "🔴"}


def evaluate_rubric(cfg: dict, m: dict) -> list[tuple[str, str, str]]:
    out = []
    for label, fn in RUBRIC:
        try:
            r = fn(cfg, m)
        except Exception:
            r = None
        if r is not None:
            out.append((r[0], label, r[1]))
    return out


def tldr(checks: list[tuple[str, str, str]]) -> str:
    n = {c: sum(1 for col, _, _ in checks if col == c) for c in ("green", "yellow", "red")}
    if n["red"]:
        verdict = "CAUTION — resolve the red items before a ticket"
    elif n["yellow"] >= 2:
        verdict = "MIXED — readable, but not clean"
    else:
        verdict = "CLEAN SETUP — operational conditions favorable"
    pct = n["green"] / len(checks) if checks else 0
    lines = ["".join(EMOJI[c] for c, _, _ in checks) +
             f"  {n['green']} green / {n['yellow']} yellow / {n['red']} red "
             f"= {pct:.0%} favorable → {verdict}"]
    for color in ("red", "yellow"):
        for c, label, text in checks:
            if c == color:
                lines.append(f"  {EMOJI[c]} {label}: {text}")
    lines.append("  (Checklist scores conditions, not direction — no probability of "
                 "profit exists in these inputs; that was measured.)")
    return "\n".join(lines)


# ---------- personality (per-stock behavioral stats; descriptive, not signals) ----------

def dip_response(closes, dip: float = -0.03, window: int = 2, fwd: int = 5):
    """(n, mean fwd return, hit rate) after `window`-day drops <= dip. Overlapping."""
    r = closes.pct_change(window)
    fwd_r = closes.shift(-fwd) / closes - 1
    ev = fwd_r[r <= dip].dropna()
    return len(ev), float(ev.mean()) if len(ev) else float("nan"), \
        float((ev > 0).mean()) if len(ev) else float("nan")


def run_continuation(closes, run: float = 0.05, window: int = 5, fwd: int = 5):
    """(n, mean fwd return, hit rate) after `window`-day gains >= run. Overlapping."""
    r = closes.pct_change(window)
    fwd_r = closes.shift(-fwd) / closes - 1
    ev = fwd_r[r >= run].dropna()
    return len(ev), float(ev.mean()) if len(ev) else float("nan"), \
        float((ev > 0).mean()) if len(ev) else float("nan")


def pulse_triggers(hist) -> list[str]:
    """Was today statistically unusual for this stock? Empty list = ordinary day."""
    c, o, v = hist["Close"], hist["Open"], hist["Volume"]
    h, lo = hist["High"], hist["Low"]
    if len(c) < 260:
        return []
    out = []
    atr_pct = float(((h - lo).rolling(14).mean().iloc[-2]) / c.iloc[-2])
    mv = float(c.iloc[-1] / c.iloc[-2] - 1)
    if abs(mv) >= max(2 * atr_pct, 0.02):
        out.append(f"{mv:+.1%} day (≥2× its typical range)")
    gap = float(o.iloc[-1] / c.iloc[-2] - 1)
    if abs(gap) >= 0.03:
        out.append(f"opening gap {gap:+.1%}")
    rvol = float(v.iloc[-1] / v.iloc[-60:].mean())
    if rvol >= 3:
        out.append(f"volume {rvol:.1f}× normal")
    for name, s in (("50d", c.rolling(50).mean()), ("200d", c.rolling(200).mean())):
        was, now_ = bool(c.iloc[-2] > s.iloc[-2]), bool(c.iloc[-1] > s.iloc[-1])
        if was != now_:
            out.append(f"crossed {'above' if now_ else 'below'} its {name} average")
    if c.iloc[-1] > c.iloc[-253:-1].max():
        out.append("new 52-week high")
    elif c.iloc[-1] < c.iloc[-253:-1].min():
        out.append("new 52-week low")
    return out


def append_observation(ticker: str, line: str) -> None:
    note = VAULT / "04-Finance" / "Day trading" / PERSONALITY_DIR_NAME / f"{ticker}.md"
    if not note.exists():
        _write_personality(ticker)
    with note.open("a") as f:
        f.write(f"- {line}\n")


def merge_generated(existing: str | None, block: str, template: str) -> str:
    """Replace the generated section between markers, preserving everything else."""
    if existing and GEN_START in existing and GEN_END in existing:
        head, rest = existing.split(GEN_START, 1)
        _, tail = rest.split(GEN_END, 1)
        return f"{head}{GEN_START}\n{block}\n{GEN_END}{tail}"
    return template.replace("{GENERATED}", f"{GEN_START}\n{block}\n{GEN_END}")


def personality_block(ticker: str, hist, earnings_dates, ratings) -> str:
    """Compute the auto-refreshed stats block from 5y OHLCV + earnings dates."""
    import numpy as np
    c, o, h, lo = hist["Close"], hist["Open"], hist["High"], hist["Low"]
    years = max((c.index[-1] - c.index[0]).days / 365.25, 0.5)
    atr_pct = float(((h - lo).rolling(14).mean().iloc[-1]) / c.iloc[-1])
    logr = np.log(c / c.shift(1))
    rv_series = logr.rolling(20).std() * math.sqrt(252)
    vol_pctile = float((rv_series < rv_series.iloc[-1]).mean())
    gaps = (o / c.shift(1) - 1).dropna()
    stop_equiv = -0.021  # a -15% premium stop at ~7x option leverage ≈ -2.1% underlying
    stop_hits = int((c.pct_change(2) <= stop_equiv).sum())
    sma50 = c.rolling(50).mean()
    above50 = float((c > sma50).dropna().mean())
    drift = (float(c.iloc[-1] / c.iloc[0]) ** (1 / years) - 1)
    dn, dm, dh = dip_response(c)
    rn, rm, rh = run_continuation(c)
    base = (c.shift(-5) / c - 1).dropna()          # unconditional 5-day forward window
    bm, bh = float(base.mean()), float((base > 0).mean())

    lines = [
        f"Refreshed {date.today()} from {years:.1f}y of daily data ({len(c)} days).",
        f"**Movement**: typical day ±{atr_pct:.1%} (14d ATR) | current 20d volatility is at the "
        f"{vol_pctile:.0%} percentile of its own history | overnight gaps ≥1% on "
        f"{float((gaps.abs() > 0.01).mean()):.0%} of mornings (worst single gap {float(gaps.min()):+.1%}) | "
        f"2-day drops ≥{-stop_equiv:.1%} (enough to threaten a fresh −15% stop at ~7× leverage) "
        f"happened ~{stop_hits / years:.0f}×/year.",
        f"**Trend habits**: above its 50-day average {above50:.0%} of days | long-run drift "
        f"{drift:+.1%}/yr over the sample.",
        f"**Baseline first** — EVERY overlapping 5-day window in this sample: {bm:+.1%}, "
        f"positive {bh:.0%} of the time. Read the two lines below as lift vs this, "
        f"not as raw numbers.",
        f"**Dip response** (after 2-day drops ≥3%, n={dn}, overlapping): next 5 days averaged "
        f"{dm:+.1%}, positive {dh:.0%} → lift vs baseline {dm - bm:+.1%}.",
        f"**Run continuation** (after 5-day gains ≥5%, n={rn}, overlapping): next 5 days averaged "
        f"{rm:+.1%}, positive {rh:.0%} → lift vs baseline {rm - bm:+.1%}.",
    ]
    if earnings_dates:
        moves, drifts = [], []
        idx = c.index
        for ed in earnings_dates:
            i = idx.searchsorted(ed)
            if 1 <= i < len(c) - 12:
                moves.append(float(c.iloc[i + 1] / c.iloc[i - 1] - 1))
                drifts.append(float(c.iloc[i + 11] / c.iloc[i + 1] - 1))
        if moves:
            ups = sum(1 for x in moves if x > 0)
            lines.append(
                f"**Earnings behavior** (last {len(moves)} reports): reaction averaged "
                f"±{float(np.mean(np.abs(moves))):.1%} (up {ups}/{len(moves)}, worst "
                f"{min(moves):+.1%}) | average drift over the 10 days after the reaction: "
                f"{float(np.mean(drifts)):+.1%}.")
    if ratings is not None:
        lines.append(f"**Analyst tape (12mo)**: {ratings['up']} upgrades / {ratings['down']} "
                     f"downgrades / {ratings['other']} other actions.")
    lines.append("_Descriptive statistics only — expectations for stops, dips, and earnings "
                 "weeks. No directional edge lives here (measured, Phases 0–11)._")
    return "\n".join(lines)


PERSONALITY_TEMPLATE = """# {TICKER} — personality

> The stats section is auto-refreshed by the copilot (`personality {TICKER}`) — it describes how this stock MOVES, to calibrate stops, dip entries, and earnings-week expectations. The narrative and observations sections are maintained by hand (or Friday): append dated entries, don't rewrite history.

{GENERATED}

## What it trades on (narrative — maintain by hand)
{NARRATIVE}

## Observations log (append-only)
- {TODAY} — note created.
"""


def _write_personality(ticker: str) -> str:
    import yfinance as yf
    tk = yf.Ticker(ticker)
    hist = tk.history(period="5y", auto_adjust=True).dropna(subset=["Close", "High", "Low"])
    hist.index = hist.index.tz_localize(None)
    earnings_dates = []
    try:
        ed = tk.get_earnings_dates(limit=20)
        cutoff = datetime.now()
        earnings_dates = sorted(d.tz_localize(None) for d in ed.index
                                if d.tz_localize(None) < cutoff)
    except Exception:
        pass
    ratings = None
    try:
        ud = tk.upgrades_downgrades
        recent = ud[ud.index.tz_localize(None) > datetime.now() - timedelta(days=365)]
        acts = recent["Action"].str.lower()
        ratings = {"up": int((acts == "up").sum()), "down": int((acts == "down").sum()),
                   "other": int(len(acts) - (acts == "up").sum() - (acts == "down").sum())}
    except Exception:
        pass
    block = personality_block(ticker, hist, earnings_dates, ratings)
    pdir = VAULT / "04-Finance" / "Day trading" / PERSONALITY_DIR_NAME
    pdir.mkdir(parents=True, exist_ok=True)
    note = pdir / f"{ticker}.md"
    seeds = NARRATIVE_SEEDS.get(ticker, ["(add what this name trades on)"])
    template = PERSONALITY_TEMPLATE.replace("{TICKER}", ticker) \
        .replace("{NARRATIVE}", "\n".join(f"- {s}" for s in seeds)) \
        .replace("{TODAY}", date.today().isoformat())
    existing = note.read_text() if note.exists() else None
    note.write_text(merge_generated(existing, block, template))
    return block


def day_trades_last5(closed: list[dict], today: date) -> int:
    cutoff = today - timedelta(days=7)  # 5 business days ~ 7 calendar
    return sum(1 for c in closed
               if c["opened"] == c["closed"] and date.fromisoformat(c["closed"]) >= cutoff)


def position_alerts(cfg: dict, pos: dict, bid: float, today: date,
                    next_earnings: date | None) -> list[tuple[str, str]]:
    """(key, message) alert candidates for one open position; dedup is caller's job."""
    out = []
    label = f"{pos['ticker']} ${pos['strike']}C {pos['expiry']}"
    age = bdays_between(date.fromisoformat(pos["opened"]), today)
    if bid and bid > 0:
        pnl = bid / pos["premium"] - 1
        if pnl <= -cfg["stop_pct"]:
            out.append(("stop", f"🔴 STOP {label}: bid ${bid:.2f} = {pnl:+.0%} vs cost "
                                f"${pos['premium']:.2f}. Sell at market NOW."))
    else:
        out.append(("noquote", f"⚠️ {label}: no live quote — check the position manually."))
    if age >= cfg["timeout_day"]:
        out.append(("timeout", f"🟠 TIMEOUT {label}: day {age}. Exit at market today — "
                               f"the clock, not the price, ends this trade."))
    if next_earnings is not None:
        nd = bdays_between(today, next_earnings)
        if 0 <= nd <= cfg["earnings_blackout_bdays"]:
            out.append(("earnings", f"🟣 EARNINGS {label}: {pos['ticker']} reports "
                                    f"{next_earnings} ({nd} trading days). Exit before then."))
    return out


def unrealized_equity(cfg: dict, closed: list[dict], marks: list[tuple]) -> float:
    """Account equity marked to market: start + realized + open unrealized.
    marks: (bid, entry_premium, qty) per open position; bid<=0 means no quote (skipped)."""
    realized = sum(c["pnl"] for c in closed)
    unreal = sum((bid - prem) * 100 * qty for bid, prem, qty in marks if bid and bid > 0)
    return cfg["start_equity"] + realized + unreal


def kill_switch_check(cfg: dict, state: dict, today: date) -> str | None:
    closed = state["closed"]
    if len(closed) >= cfg["kill_consecutive_stops"]:
        tail = closed[-cfg["kill_consecutive_stops"]:]
        if all(c["why"] == "stop" for c in tail):
            return f"{cfg['kill_consecutive_stops']} consecutive stop-outs"
    equity = cfg["start_equity"] + sum(c["pnl"] for c in closed)  # realized basis
    if equity <= cfg["start_equity"] * (1 - cfg["kill_drawdown"]):
        return f"realized equity ${equity:,.0f} is {cfg['kill_drawdown']:.0%} below start"
    return None


def needs_post_exit(c: dict, today: date) -> bool:
    """Closed >=6 trading days ago and not yet annotated with post-exit drift."""
    return "post5_stock" not in c and \
        bdays_between(date.fromisoformat(c["closed"]), today) >= 6


def post_exit_summary(closed: list[dict]) -> str:
    """Average 5-day stock drift after exits, grouped by exit reason."""
    by: dict[str, list[float]] = {}
    for c in closed:
        if "post5_stock" in c:
            by.setdefault(c["why"], []).append(c["post5_stock"])
    if not by:
        return ""
    return " | post-exit 5d stock drift: " + ", ".join(
        f"{k} {statistics.mean(v):+.1%} (n={len(v)})" for k, v in sorted(by.items()))


def audit(closed: list[dict]) -> str:
    pl = [c["pnl"] for c in closed]
    n = len(pl)
    if n < 2:
        return f"{n} closed trades — audit starts at 2."
    mean = statistics.mean(pl)
    t = mean / (statistics.stdev(pl) / math.sqrt(n)) if statistics.stdev(pl) > 0 else float("inf")
    wins = [p for p in pl if p > 0]
    by_why = {}
    for c in closed:
        by_why.setdefault(c["why"], []).append(c["pnl"])
    why_s = ", ".join(f"{k}:{len(v)} (${sum(v):+,.0f})" for k, v in sorted(by_why.items()))
    return (f"n={n} | net ${sum(pl):+,.0f} | expectancy ${mean:+,.0f}/trade (t={t:+.2f}) | "
            f"hit {len(wins)}/{n} | avg win ${statistics.mean(wins):+,.0f} | "
            f"avg loss ${statistics.mean([p for p in pl if p <= 0]) if len(wins) < n else 0:+,.0f} | "
            f"exits: {why_s} | tax reserve ${max(sum(pl), 0) * 0.40:,.0f}"
            + post_exit_summary(closed))


def market_open_now(now: datetime) -> bool:
    et = now.astimezone(ET)
    return et.weekday() < 5 and (9, 30) <= (et.hour, et.minute) and et.hour < 16


# ---------- I/O helpers ----------

def send_telegram(text: str) -> None:
    creds = json.loads(CRED_PATH.read_text())
    for i in range(0, len(text), 4000):
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{creds['bot_token']}/sendMessage",
            data=json.dumps({"chat_id": creds["chat_id"], "text": text[i:i + 4000]}).encode(),
            headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            r.read()


def notify(text: str) -> None:
    print(text)
    try:
        send_telegram(text)
    except Exception as e:  # laptop has no creds; mini does
        print(f"(telegram unavailable: {e})", file=sys.stderr)


def journal(line: str) -> None:
    stamp = datetime.now(ET).strftime("%Y-%m-%d %H:%M")
    JOURNAL.parent.mkdir(parents=True, exist_ok=True)
    header = "" if JOURNAL.exists() else "# Options copilot journal\n\n"
    with JOURNAL.open("a") as f:
        f.write(f"{header}- {stamp} — {line}\n")


def _as_date(x) -> date:
    return x.date() if isinstance(x, datetime) else x  # covers pandas Timestamp too


def next_earnings_date(ticker: str) -> date | None:
    """Earliest FUTURE earnings date from yfinance. Checks both the calendar field
    (which can hold only the stale past date, e.g. GOOGL post-report) and the
    scheduled-dates table."""
    import yfinance as yf
    tk = yf.Ticker(ticker)
    dates = []
    try:
        dates += list((tk.calendar or {}).get("Earnings Date") or [])
    except Exception:
        pass
    try:
        dates += list(tk.get_earnings_dates(limit=8).index)
    except Exception:
        pass
    future = [d for d in map(_as_date, dates) if d >= date.today()]
    return min(future) if future else None


AV_KEY_PATH = Path.home() / ".alphavantage_key"
AV_CACHE = HERE / "earnings_av_cache.json"


def next_earnings_av(ticker: str) -> date | None:
    """Second earnings source (AlphaVantage calendar), cached 3 days to respect
    the 25-req/day free tier. Returns None when no key or no data."""
    cache = {}
    if AV_CACHE.exists():
        try:
            cache = json.loads(AV_CACHE.read_text())
        except Exception:
            cache = {}
    hit = cache.get(ticker)
    if hit and (date.today() - date.fromisoformat(hit["asof"])).days < 3:
        return date.fromisoformat(hit["date"]) if hit["date"] else None
    if not AV_KEY_PATH.exists():
        return None
    try:
        key = AV_KEY_PATH.read_text().strip()
        url = (f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR"
               f"&symbol={ticker}&horizon=3month&apikey={key}")
        with urllib.request.urlopen(url, timeout=30) as r:
            lines = r.read().decode().strip().splitlines()
        found = None
        for row in lines[1:]:  # csv: symbol,name,reportDate,...
            parts = row.split(",")
            if len(parts) >= 3 and parts[0].upper() == ticker.upper() and parts[2]:
                d = date.fromisoformat(parts[2])
                if d >= date.today() and (found is None or d < found):
                    found = d
        cache[ticker] = {"date": found.isoformat() if found else None,
                         "asof": date.today().isoformat()}
        AV_CACHE.write_text(json.dumps(cache, indent=1))
        return found
    except Exception:
        return None


def next_earnings_dual(ticker: str) -> tuple[date | None, str]:
    """Cross-checked next earnings date. Returns (date, note). On disagreement
    beyond 1 day, uses the EARLIER date (conservative) and says so."""
    yf_d, av_d = next_earnings_date(ticker), next_earnings_av(ticker)
    if yf_d and av_d:
        if abs((yf_d - av_d).days) <= 1:
            return min(yf_d, av_d), ""
        return min(yf_d, av_d), (f" ⚠️ sources disagree (yfinance {yf_d} vs "
                                 f"AlphaVantage {av_d}) — using the earlier date; verify.")
    if yf_d or av_d:
        return yf_d or av_d, " (single source — second source had no data)"
    return None, ""


# ---------- commands ----------

def cmd_ticket(args) -> None:
    import yfinance as yf
    state = load_state()
    cfg = state["config"]
    today = date.today()

    if state["kill_until"] and date.fromisoformat(state["kill_until"]) >= today:
        notify(f"⛔ Kill-switch active until {state['kill_until']}. No new tickets.")
        return
    cool = state.get("cooloff", {}).get(args.ticker)
    if cool and date.fromisoformat(cool) >= today:
        print(f"REFUSED: {args.ticker} is in post-stop cooloff until {cool} — the "
              f"anti-revenge-trade rule. Pick a different name or wait.")
        return
    if not args.reason.strip():
        print("REFUSED: --reason is required (one line: why this trade, now).")
        return

    tk0 = yf.Ticker(args.ticker)
    spot0, avg_vol, flt = None, None, None
    try:
        spot0 = float(tk0.fast_info["last_price"])
        avg_vol = float(tk0.fast_info["three_month_average_volume"])
    except Exception:
        pass
    try:
        flt = tk0.info.get("floatShares")
    except Exception:
        pass
    fails = screen_failures(cfg, spot0, avg_vol, flt)
    if fails and not args.override_screen:
        print(f"REFUSED (screen): {'; '.join(fails)}. "
              f"If a value is merely unavailable, verify it yourself and re-run "
              f"with --override-screen.")
        return

    ne, e_note = next_earnings_dual(args.ticker)
    if ne is None and not args.override_earnings:
        print(f"REFUSED: cannot confirm {args.ticker}'s next earnings date from either "
              f"source. Verify it yourself, then re-run with --override-earnings.")
        return
    if ne and bdays_between(today, ne) <= cfg["earnings_blackout_bdays"]:
        print(f"REFUSED: {args.ticker} reports {ne} — inside the "
              f"{cfg['earnings_blackout_bdays']}-trading-day blackout.{e_note} This rule "
              f"cost the case-study trader $19,206. No override exists.")
        return

    tk = yf.Ticker(args.ticker)
    spot = float(tk.fast_info["last_price"])
    expiries = [(e, (date.fromisoformat(e) - today).days) for e in tk.options]
    window = [e for e, d in expiries if cfg["expiry_min_days"] <= d <= cfg["expiry_max_days"]]
    if not window:
        print(f"REFUSED: no expiry {cfg['expiry_min_days']}-{cfg['expiry_max_days']} days out.")
        return
    expiry = min(window, key=lambda e: abs((date.fromisoformat(e) - today).days - 180))
    row = pick_strike(tk.option_chain(expiry).calls, spot, cfg)
    if row is None:
        print(f"REFUSED: no live two-sided quotes in the 2-8% OTM band on "
              f"{args.ticker} {expiry}.")
        return
    strike, bid, ask = float(row["strike"]), float(row["bid"]), float(row["ask"])
    iv = float(row.get("impliedVolatility", float("nan")))
    mid = (bid + ask) / 2
    spread = (ask - bid) / mid
    if spread > cfg["spread_max"]:
        print(f"REFUSED: spread {spread:.1%} > {cfg['spread_max']:.1%} ceiling — this "
              f"name's options are too expensive to trade. Pick a more liquid ticker.")
        return
    dte = (date.fromisoformat(expiry) - today).days
    delta = bs_call_delta(spot, strike, dte, iv, cfg["risk_free"])
    theta = bs_call_theta_day(spot, strike, dte, iv, cfg["risk_free"])
    try:
        rv = realized_vol(tk.history(period="3mo", auto_adjust=True)["Close"].dropna())
    except Exception:
        rv = float("nan")
    qty = size_position(cfg, mid)
    if qty < 1:
        print(f"REFUSED: at ${mid:.2f} premium, even 1 contract busts the "
              f"{cfg['risk_pct']:.0%}-risk rule on a ${cfg['account_size']:,.0f} account.")
        return
    dt5 = day_trades_last5(state["closed"], today)
    pdt_note = (f"\n⚠️ PDT: {dt5} day-trades in the last 5 sessions — a same-day exit "
                f"on this position would be #{dt5 + 1}." if dt5 >= 2 else "")
    band = "" if cfg["delta_band"][0] <= delta <= cfg["delta_band"][1] else \
        f"\n⚠️ delta {delta:.2f} outside {cfg['delta_band']} band — strike drifted from spec."
    hold_cost = -theta * cfg["timeout_day"] / mid if mid and not math.isnan(theta) else float("nan")
    if iv < 0.05:  # stale/after-hours chain quirk: yfinance reports ~0 IV
        iv, theta, hold_cost = float("nan"), float("nan"), float("nan")
    ivrv = iv / rv if rv and not math.isnan(rv) and rv > 0 else float("nan")
    vol_flag = (f" ⚠️ IV is {ivrv:.1f}× realized — you're paying up for volatility; "
                f"a right-direction trade can still lose as IV deflates."
                if not math.isnan(ivrv) and ivrv >= cfg["iv_rv_warn"] else "")
    print(f"""ORDER TICKET — {args.ticker} (spot ${spot:.2f})
BUY {qty} × {args.ticker} ${strike:g} CALL {expiry}  @ limit ${mid:.2f} (bid {bid:.2f} / ask {ask:.2f}, spread {spread:.1%})
Greeks: delta ~{delta:.2f} → stock-equivalent exposure ${delta * spot * 100 * qty:,.0f} | theta ${theta * 100 * qty:,.0f}/day (a full {cfg['timeout_day']}-day hold costs ~{hold_cost:.1%} of premium) | IV {iv:.0%} vs realized {rv:.0%} ({ivrv:.1f}×){vol_flag}
Cost if filled: ${qty * mid * 100:,.0f}   Max risk: ${qty * mid * 100 * cfg['stop_slippage_fill']:,.0f} ({cfg['risk_pct']:.0%} of account — sized assuming the −{cfg['stop_pct']:.0%} stop alert actually fills at −{cfg['stop_slippage_fill']:.0%} after gaps/delay)
EXIT PLAN (no profit cap — long calls live on the right tail): stop alert at ${mid * (1 - cfg['stop_pct']):.2f} (−{cfg['stop_pct']:.0%}) → sell at market same hour; otherwise exit at market on day {cfg['timeout_day']}. Sell earlier only on your own judgment, and the journal records why.
ON FILL, reply:  bought {args.ticker} {strike:g} {expiry} {qty} <your-fill-price>
Reason on record: {args.reason}{band}{pdt_note}""")


def cmd_bought(args) -> None:
    state = load_state()
    cfg = state["config"]
    pos = {"ticker": args.ticker.upper(), "strike": args.strike, "expiry": args.expiry,
           "qty": args.qty, "premium": args.premium,
           "opened": date.today().isoformat(), "reason": args.reason or "",
           "entry_snapshot": snapshot_entry(args.ticker.upper(), cfg)}
    state["positions"].append(pos)
    save_state(state)
    snap_note = "" if pos["entry_snapshot"] else " (entry-condition snapshot unavailable)"
    journal(f"BOUGHT {args.qty}× {pos['ticker']} ${args.strike:g}C {args.expiry} @ "
            f"${args.premium:.2f} (${args.qty * args.premium * 100:,.0f}) — {pos['reason']}")
    notify(f"✅ Recorded {pos['ticker']} ${args.strike:g}C with entry conditions frozen"
           f"{snap_note}. Stop alert armed at ${args.premium * (1 - cfg['stop_pct']):.2f} "
           f"(−{cfg['stop_pct']:.0%}); timeout exit day {cfg['timeout_day']}. No profit cap — "
           f"early sells are your call and get journaled.")


def cmd_sold(args) -> None:
    state = load_state()
    match = [p for p in state["positions"]
             if p["ticker"] == args.ticker.upper() and p["strike"] == args.strike
             and p["expiry"] == args.expiry]
    if not match:
        print(f"No open position {args.ticker} ${args.strike:g} {args.expiry}. "
              f"Open: {[(p['ticker'], p['strike'], p['expiry']) for p in state['positions']]}")
        return
    pos = match[0]
    state["positions"].remove(pos)
    pnl = (args.premium - pos["premium"]) * 100 * pos["qty"]
    closed = {**pos, "closed": date.today().isoformat(), "exit_premium": args.premium,
              "pnl": pnl, "why": args.why}
    state["closed"].append(closed)
    if args.why == "stop":
        until = date.today() + timedelta(days=state["config"]["cooloff_days"])
        state.setdefault("cooloff", {})[pos["ticker"]] = until.isoformat()
    reason = kill_switch_check(state["config"], state, date.today())
    msg = (f"💰 Closed {pos['ticker']} ${pos['strike']:g}C: ${pnl:+,.0f} ({args.why}). "
           f"Running net ${sum(c['pnl'] for c in state['closed']):+,.0f} over "
           f"{len(state['closed'])} trades.")
    if reason:
        until = date.today() + timedelta(days=state["config"]["pause_days"])
        state["kill_until"] = until.isoformat()
        msg += (f"\n⛔ KILL-SWITCH: {reason}. Flat until {until} — tickets disabled. "
                f"Use the pause for the review, not for revenge trades.")
    save_state(state)
    journal(f"SOLD {pos['qty']}× {pos['ticker']} ${pos['strike']:g}C {pos['expiry']} @ "
            f"${args.premium:.2f} → ${pnl:+,.0f} [{args.why}]")
    notify(msg)
    if len(state["closed"]) % 20 == 0:
        block = audit(state["closed"])
        journal(f"AUDIT at {len(state['closed'])} trades: {block}")
        notify(f"📊 20-trade audit:\n{block}")


def cmd_monitor(args) -> None:
    import yfinance as yf
    now = datetime.now(ET)
    state = load_state()
    state["monitor_runs"] = state.get("monitor_runs", 0) + 1   # liveness proof
    state["last_monitor"] = now.isoformat(timespec="minutes")
    save_state(state)
    if not market_open_now(now) and not args.force:
        return
    if not state["positions"]:
        return
    cfg, today = state["config"], date.today()
    lines, marks = [], []
    for pos in state["positions"]:
        key_base = f"{pos['ticker']}|{pos['strike']}|{pos['expiry']}"
        try:
            chain = yf.Ticker(pos["ticker"]).option_chain(pos["expiry"]).calls
            row = chain[chain["strike"] == pos["strike"]]
            bid = float(row["bid"].iloc[0]) if len(row) else 0.0
        except Exception:
            bid = 0.0
        marks.append((bid, pos["premium"], pos["qty"]))
        ne, _ = next_earnings_dual(pos["ticker"])
        for key, msg in position_alerts(cfg, pos, bid, today, ne):
            akey = f"{key_base}|{key}|{today.isoformat()}"
            hourly = key == "stop" and f"{akey}|{now.hour}" not in state["alerts"]
            daily = key != "stop" and akey not in state["alerts"]
            if hourly or daily:
                state["alerts"][akey if key != "stop" else f"{akey}|{now.hour}"] = True
                lines.append(msg)
    kill_active = state["kill_until"] and date.fromisoformat(state["kill_until"]) >= today
    if marks and not kill_active:
        eq = unrealized_equity(cfg, state["closed"], marks)
        if eq <= cfg["start_equity"] * (1 - cfg["kill_drawdown"]):
            kkey = f"killswitch|{today.isoformat()}"
            until = today + timedelta(days=cfg["pause_days"])
            state["kill_until"] = until.isoformat()
            if kkey not in state["alerts"]:
                state["alerts"][kkey] = True
                lines.append(f"⛔ KILL-SWITCH (marked-to-market): equity ≈ ${eq:,.0f} is "
                             f"{cfg['kill_drawdown']:.0%} below start — includes open "
                             f"unrealized losses. Tickets disabled until {until}. "
                             f"Deal with the open position; don't add.")
    state["alerts"] = {k: v for k, v in state["alerts"].items()
                       if today.isoformat() in k}  # keep the map small
    save_state(state)
    if lines:
        notify("\n".join(lines))


def cmd_weekly(args) -> None:
    import yfinance as yf
    state = load_state()
    today = date.today()
    if not args.force:
        if today.weekday() != 6 or state["last_weekly"] == today.isoformat():
            return
    state["last_weekly"] = today.isoformat()
    cfg = state["config"]
    parts = [f"📈 Options copilot — week of {today}"]
    runs = state.get("monitor_runs", 0)
    parts.append(f"Monitor liveness: {runs} runs since last digest "
                 f"(last: {state.get('last_monitor', 'never')}).")
    if state["positions"] and runs == 0:
        parts.append("🚨 The monitor has NOT been running while positions are open — "
                     "run selftest and check the HEARTBEAT wiring NOW.")
    state["monitor_runs"] = 0
    new_drift = []
    for cl in state["closed"]:
        if not needs_post_exit(cl, today):
            continue
        try:
            h = yf.Ticker(cl["ticker"]).history(start=cl["closed"],
                                                auto_adjust=True)["Close"].dropna()
            if len(h) >= 6:
                cl["post5_stock"] = float(h.iloc[5] / h.iloc[0] - 1)
                new_drift.append(f"{cl['ticker']} ({cl['why']}, {cl['closed']}): stock "
                                 f"{cl['post5_stock']:+.1%} in the 5 days after exit")
        except Exception:
            continue
    save_state(state)
    if new_drift:
        parts.append("Post-exit drift (what happened after you sold):\n  "
                     + "\n  ".join(new_drift))
    for p in state["positions"]:
        age = bdays_between(date.fromisoformat(p["opened"]), today)
        parts.append(f"• OPEN {p['qty']}× {p['ticker']} ${p['strike']:g}C {p['expiry']} "
                     f"@ ${p['premium']:.2f}, day {age}")
    closed = state["closed"]
    if closed:
        parts.append(audit(closed))
        first = min(date.fromisoformat(c["opened"]) for c in closed)
        try:
            spy = yf.download("SPY", start=first.isoformat(), progress=False)["Close"].squeeze()
            spy_ret = float(spy.iloc[-1] / spy.iloc[0] - 1)
            parts.append(f"Benchmark: same-period SPY {spy_ret:+.1%} on "
                         f"${cfg['account_size']:,.0f} = ${cfg['account_size'] * spy_ret:+,.0f} "
                         f"vs your realized ${sum(c['pnl'] for c in closed):+,.0f}.")
        except Exception:
            parts.append("Benchmark: SPY fetch failed this week.")
    else:
        parts.append("No closed trades yet.")
    if state["kill_until"] and date.fromisoformat(state["kill_until"]) >= today:
        parts.append(f"⛔ Kill-switch active until {state['kill_until']}.")
    refreshed = 0
    for t in cfg.get("watchlist", []):
        try:
            _write_personality(t)
            refreshed += 1
        except Exception:
            pass
    if refreshed:
        parts.append(f"Personality notes refreshed: {refreshed}/{len(cfg['watchlist'])}.")
    msg = "\n".join(parts)
    journal(f"WEEKLY: {msg.replace(chr(10), ' | ')}")
    notify(msg)


def cmd_status(args) -> None:
    args.force = True
    cmd_weekly(args)


def cmd_personality(args) -> None:
    block = _write_personality(args.ticker)
    print(f"Updated {PERSONALITY_DIR_NAME}/{args.ticker}.md:\n\n{block}")


def cmd_scout(args) -> None:
    """Run candidate tickers through every gate; print PASS/FAIL with reasons.
    A PASS means: screen ok, 5-7mo expiry exists, liquid strike <= spread ceiling,
    and the premium sizes under the risk rule at the configured account."""
    import yfinance as yf
    state = load_state()
    cfg = state["config"]
    prem_cap = cfg["risk_pct"] * cfg["account_size"] / cfg["stop_slippage_fill"] / 100
    passers = []
    for t in [x.upper() for x in args.tickers]:
        try:
            tk = yf.Ticker(t)
            fi = tk.fast_info
            spot = float(fi["last_price"])
            try:
                flt = tk.info.get("floatShares")
            except Exception:
                flt = None
            fails = screen_failures(cfg, spot, float(fi["three_month_average_volume"]), flt)
            if fails:
                print(f"{t:6s} ${spot:>8.2f}  FAIL screen: {'; '.join(fails)}")
                continue
            expiries = [(e, (date.fromisoformat(e) - date.today()).days) for e in tk.options]
            win = [e for e, d in expiries
                   if cfg["expiry_min_days"] <= d <= cfg["expiry_max_days"]]
            if not win:
                print(f"{t:6s} ${spot:>8.2f}  FAIL: no 5-7 month expiry listed")
                continue
            expiry = min(win, key=lambda e: abs((date.fromisoformat(e) - date.today()).days - 180))
            row = pick_strike(tk.option_chain(expiry).calls, spot, cfg)
            if row is None:
                print(f"{t:6s} ${spot:>8.2f}  FAIL: no two-sided quotes in 2-8% OTM band")
                continue
            bid, ask = float(row["bid"]), float(row["ask"])
            mid = (bid + ask) / 2
            spread = (ask - bid) / mid
            if spread > cfg["spread_max"]:
                print(f"{t:6s} ${spot:>8.2f}  FAIL: spread {spread:.1%} > {cfg['spread_max']:.1%}")
                continue
            qty = size_position(cfg, mid)
            if qty < 1:
                print(f"{t:6s} ${spot:>8.2f}  FAIL: premium ${mid:.2f} > ${prem_cap:.0f} sizing cap")
                continue
            print(f"{t:6s} ${spot:>8.2f}  PASS  ${row['strike']:g}C {expiry} @ ${mid:.2f} "
                  f"(spread {spread:.1%}, {qty} contract{'s' if qty > 1 else ''})")
            passers.append(t)
        except Exception as e:
            print(f"{t:6s} {'?':>9s}  FAIL: {type(e).__name__}")
    if passers:
        print(f"\nPassers: {' '.join(passers)}")
        if args.add:
            wl = state["config"]["watchlist"]
            new = [t for t in passers if t not in wl]
            state["config"]["watchlist"] = wl + new
            save_state(state)
            print(f"Added {len(new)} to watchlist (now {len(wl) + len(new)} names).")


def cmd_selftest(args) -> None:
    """End-to-end plumbing check. Run after deployment and whenever alerts feel quiet."""
    results = []

    def check(name, fn, required=True):
        try:
            results.append(f"✅ {name}: {fn() or 'ok'}")
        except Exception as e:
            mark = "❌" if required else "⚠️"
            results.append(f"{mark} {name}: {type(e).__name__}: {e}")

    def deps():
        import pandas
        import yfinance
        return f"yfinance {yfinance.__version__}, pandas {pandas.__version__}"

    def state_check():
        s = load_state()
        for p in s["positions"]:
            assert all(k in p for k in ("ticker", "strike", "expiry", "qty", "premium",
                                        "opened")), f"malformed position: {p}"
        return (f"{len(s['positions'])} open / {len(s['closed'])} closed, account "
                f"${s['config']['account_size']:,.0f}, monitor last ran "
                f"{s.get('last_monitor', 'never')}")

    def vault_check():
        assert JOURNAL.parent.is_dir(), f"missing dir {JOURNAL.parent}"
        probe = JOURNAL.parent / ".copilot_write_probe"
        probe.write_text("ok")
        probe.unlink()
        return f"journal dir writable ({JOURNAL.parent.name}/)"

    def data_check():
        import yfinance as yf
        return f"SPY ${float(yf.Ticker('SPY').fast_info['last_price']):.2f} (live fetch ok)"

    def av_check():
        assert AV_KEY_PATH.exists(), f"{AV_KEY_PATH} missing — earnings gate single-source"
        return "AlphaVantage key present (dual-source earnings active)"

    def telegram_check():
        send_telegram(f"🔧 copilot selftest ping — {datetime.now(ET):%Y-%m-%d %H:%M ET}")
        return "test message sent — check your phone"

    check("python deps", deps)
    check("state file", state_check)
    check("vault write", vault_check)
    check("market data", data_check)
    check("earnings 2nd source", av_check, required=False)
    check("telegram", telegram_check)
    out = "\n".join(results)
    print(f"🔧 Copilot selftest\n{out}")
    if any(r.startswith("❌") for r in results):
        sys.exit(1)


def cmd_pulse(args) -> None:
    """Daily after close: append AUTO observations to personality notes ONLY when
    something statistically unusual happened. Ordinary days write nothing."""
    import yfinance as yf
    now = datetime.now(ET)
    state = load_state()
    cfg = state["config"]
    today = date.today()
    if not args.force:
        if now.weekday() >= 5 or (now.hour, now.minute) < (16, 35):
            return
        if state.get("last_pulse") == today.isoformat():
            return
    state["last_pulse"] = today.isoformat()
    save_state(state)
    reports = []
    for t in cfg.get("watchlist", []):
        try:
            tk = yf.Ticker(t)
            hist = tk.history(period="2y", auto_adjust=True).dropna(
                subset=["Close", "High", "Low"])
            hist.index = hist.index.tz_localize(None)
            trig = pulse_triggers(hist)
            if not trig:
                continue
            heads = []
            try:
                for n in (tk.news or [])[:3]:
                    content = n.get("content", n)
                    title = content.get("title")
                    if title:
                        heads.append(title)
            except Exception:
                pass
            line = (f"{today} — AUTO: " + "; ".join(trig)
                    + (f". Headlines: {' | '.join(heads)}" if heads else ""))
            append_observation(t, line)
            reports.append(f"{t}: {'; '.join(trig)}")
        except Exception:
            continue
    # Record daily ATM IV per watchlist name — after ~6 months this yields a real
    # IV-rank (the gap paid data would otherwise close).
    iv_log = HERE / "iv_history.csv"
    for t in cfg.get("watchlist", []):
        try:
            tk = yf.Ticker(t)
            spot = float(tk.fast_info["last_price"])
            expiries = [(e, (date.fromisoformat(e) - date.today()).days) for e in tk.options]
            win = [e for e, d in expiries
                   if cfg["expiry_min_days"] <= d <= cfg["expiry_max_days"]]
            if not win:
                continue
            e6 = min(win, key=lambda e: abs((date.fromisoformat(e) - date.today()).days - 180))
            calls = tk.option_chain(e6).calls
            atm = calls.iloc[(calls["strike"] - spot).abs().argsort()[:1]]
            iv = float(atm["impliedVolatility"].iloc[0])
            if iv < 0.05:
                continue
            if not iv_log.exists():
                iv_log.write_text("date,ticker,iv,spot\n")
            with iv_log.open("a") as f:
                f.write(f"{today},{t},{iv:.4f},{spot:.2f}\n")
        except Exception:
            continue
    if reports:
        notify("🧬 Personality pulse — unusual days recorded:\n"
               + "\n".join(reports)
               + "\n(Appended to the observations logs. If the news changes what a "
                 "name trades on, add a narrative line too.)")


def collect_metrics(ticker: str, cfg: dict):
    """Fetch everything once; return (rubric metrics dict, display context).
    Shared by `report` (display) and `bought` (entry-condition snapshot)."""
    import yfinance as yf
    tk = yf.Ticker(ticker)
    info = {}
    try:
        info = tk.info or {}
    except Exception:
        pass
    fi = tk.fast_info
    spot = float(fi["last_price"])
    hist = tk.history(period="1y", auto_adjust=True).dropna(subset=["Close", "High", "Low"])
    c, h, lo = hist["Close"], hist["High"], hist["Low"]
    m = {"spot": spot, "screen_fails": None, "earnings_bdays": None,
         "beta": info.get("beta"), "short_pct": info.get("shortPercentOfFloat")}
    try:
        m["screen_fails"] = screen_failures(cfg, spot, float(fi["three_month_average_volume"]),
                                            info.get("floatShares"))
    except Exception:
        pass
    ne, earnings_note = next_earnings_dual(ticker)
    if ne:
        m["earnings_bdays"] = bdays_between(date.today(), ne)
    try:
        m["rvol"] = float(fi["last_volume"]) / float(fi["three_month_average_volume"])
    except Exception:
        pass
    try:
        spy = yf.Ticker("SPY").history(period="1y", auto_adjust=True)["Close"].dropna()
        m["spy_ext"] = float(spy.iloc[-1] / spy.rolling(200).mean().iloc[-1] - 1)
        if len(c) > 61 and len(spy) > 61:
            m["rs_60d"] = float((c.iloc[-1] / c.iloc[-61] - 1)
                                - (spy.iloc[-1] / spy.iloc[-61] - 1))
    except Exception:
        pass
    try:
        m["vix"] = float(yf.Ticker("^VIX").fast_info["last_price"])
    except Exception:
        pass
    try:
        import pandas as pd
        it = tk.insider_transactions
        if it is not None and len(it):
            recent = it[pd.to_datetime(it["Start Date"]) >
                        datetime.now() - timedelta(days=90)]
            txt = recent["Transaction"].astype(str).str.lower()
            m["insider_buys"] = int(txt.str.contains("purchase|buy").sum())
            m["insider_sales"] = int(txt.str.contains("sale|sell").sum())
    except Exception:
        pass
    ctx = {"tk": tk, "info": info, "spot": spot, "c": c, "ne": ne,
           "earnings_note": earnings_note, "exp6": None,
           "sma50": float("nan"), "sma200": float("nan"), "hi52": float("nan")}
    if len(c) > 200:
        sma50 = c.rolling(50).mean().iloc[-1]
        sma200 = c.rolling(200).mean().iloc[-1]
        atr = (h - lo).rolling(14).mean().iloc[-1]
        ctx.update(sma50=float(sma50), sma200=float(sma200), hi52=float(c.max()))
        m.update(sma50=float(sma50), sma200=float(sma200), rsi14=float(rsi(c)),
                 atr_pct=float(atr / spot),
                 ext_atr=float((spot - sma50) / atr) if atr > 0 else float("nan"),
                 rv20=float(realized_vol(c)))
    try:
        expiries = [(e, (date.fromisoformat(e) - date.today()).days) for e in tk.options]
        win = [e for e, d in expiries if cfg["expiry_min_days"] <= d <= cfg["expiry_max_days"]]
        if win:
            exp6 = min(win, key=lambda e: abs((date.fromisoformat(e) - date.today()).days - 180))
            oc = tk.option_chain(exp6)
            calls = oc.calls
            atm = calls.iloc[(calls["strike"] - spot).abs().argsort()[:1]]
            iv6 = float(atm["impliedVolatility"].iloc[0])
            m["iv6"] = iv6 if iv6 >= 0.05 else float("nan")  # ~0 = stale quote
            call_oi = float(calls["openInterest"].fillna(0).sum())
            if call_oi > 0:
                m["pc_oi"] = float(oc.puts["openInterest"].fillna(0).sum()) / call_oi
            ctx["exp6"] = exp6
    except Exception:
        pass
    return m, ctx


def snapshot_entry(ticker: str, cfg: dict) -> dict | None:
    """Freeze entry conditions into a JSON-safe blob for the position record."""
    try:
        m, _ = collect_metrics(ticker, cfg)
        checks = evaluate_rubric(cfg, m)
        clean = {k: (None if isinstance(v, float) and v != v else v) for k, v in m.items()}
        return {"metrics": clean,
                "checks": [f"{c}|{label}|{text}" for c, label, text in checks],
                "asof": datetime.now(ET).isoformat(timespec="minutes")}
    except Exception:
        return None


def cmd_report(args) -> None:
    state = load_state()
    cfg = state["config"]
    m, ctx = collect_metrics(args.ticker, cfg)
    tk, info, spot, c = ctx["tk"], ctx["info"], ctx["spot"], ctx["c"]
    ne, exp6 = ctx["ne"], ctx["exp6"]
    sma50, sma200, hi52 = ctx["sma50"], ctx["sma200"], ctx["hi52"]
    out = [f"📋 {args.ticker.upper()} report — spot ${spot:.2f}"]
    f = lambda k, fmt="{:.1f}": fmt.format(info[k]) if info.get(k) is not None else "n/a"

    checks = evaluate_rubric(cfg, m)
    out.append(tldr(checks))
    out.append("")

    if ne:
        out.append(f"Catalyst: earnings {ne} ({m['earnings_bdays']} trading days)"
                   f"{ctx['earnings_note']}")
    if len(c) > 200:
        out.append(f"Technicals: {'above' if spot > sma50 else 'below'} 50d "
                   f"(${sma50:.2f}), {'above' if spot > sma200 else 'below'} 200d "
                   f"(${sma200:.2f}) | RSI14 {m['rsi14']:.0f} | "
                   f"5d {c.iloc[-1]/c.iloc[-6]-1:+.1%}, 20d {c.iloc[-1]/c.iloc[-21]-1:+.1%}, "
                   f"60d {c.iloc[-1]/c.iloc[-61]-1:+.1%} | "
                   f"{spot/hi52-1:+.1%} vs 52w high | ATR {m['atr_pct']:.1%}/day | "
                   f"extension {m['ext_atr']:+.1f} ATRs from 50d")
    if exp6 and m.get("iv6") == m.get("iv6") and m.get("iv6") is not None:
        out.append(f"Options ({exp6} ATM): IV {m['iv6']:.0%} vs 20d realized {m['rv20']:.0%}")

    mc = info.get("marketCap")
    if mc:
        info = {**info, "marketCap": f"${mc/1e12:.2f}T" if mc >= 1e12 else f"${mc/1e9:.0f}B"}
    out.append(f"Fundamentals: mktcap {f('marketCap', '{}')} | trailing P/E "
               f"{f('trailingPE')} | fwd P/E {f('forwardPE')} | rev growth "
               f"{f('revenueGrowth', '{:.1%}')} | margin {f('profitMargins', '{:.1%}')}")
    if info.get("targetMeanPrice"):
        out.append(f"Analysts: {info.get('recommendationKey', '?')} "
                   f"(mean {f('recommendationMean')}, n={f('numberOfAnalystOpinions', '{:.0f}')}) | "
                   f"target ${info['targetMeanPrice']:.0f} "
                   f"({info['targetMeanPrice']/spot-1:+.1%} vs spot; "
                   f"low ${f('targetLowPrice', '{:.0f}')} / high ${f('targetHighPrice', '{:.0f}')})")
    try:
        ud = tk.upgrades_downgrades
        if ud is not None and len(ud):
            recent = [f"{i.date()} {r.get('Firm', '?')}: {r.get('Action', '')} → "
                      f"{r.get('ToGrade', '?')}" for i, r in ud.head(3).iterrows()]
            out.append("Recent rating moves: " + " | ".join(recent))
    except Exception:
        pass
    try:
        heads = []
        for n in (tk.news or [])[:5]:
            content = n.get("content", n)
            title = content.get("title")
            when = str(content.get("pubDate", ""))[:10]
            if title:
                heads.append(f"  • [{when}] {title}")
        if heads:
            out.append("News:\n" + "\n".join(heads))
    except Exception:
        pass
    out.append("(Data: yfinance, ~15-min delayed. This is context, not a signal — "
               "the program measured these inputs as already priced in at daily latency.)")
    print("\n".join(out))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("ticket")
    t.add_argument("ticker", type=str.upper)
    t.add_argument("--reason", required=True)
    t.add_argument("--override-earnings", action="store_true")
    t.add_argument("--override-screen", action="store_true")
    r = sub.add_parser("report")
    r.add_argument("ticker", type=str.upper)
    p = sub.add_parser("personality")
    p.add_argument("ticker", type=str.upper)
    pu = sub.add_parser("pulse")
    pu.add_argument("--force", action="store_true")
    sc = sub.add_parser("scout")
    sc.add_argument("tickers", nargs="+")
    sc.add_argument("--add", action="store_true")
    sub.add_parser("selftest")
    b = sub.add_parser("bought")
    for name, typ in (("ticker", str), ("strike", float), ("expiry", str),
                      ("qty", int), ("premium", float)):
        b.add_argument(name, type=typ)
    b.add_argument("--reason", default="")
    s = sub.add_parser("sold")
    for name, typ in (("ticker", str), ("strike", float), ("expiry", str), ("premium", float)):
        s.add_argument(name, type=typ)
    s.add_argument("--why", required=True,
                   choices=["profit", "timeout", "stop", "earnings", "manual"])
    for name in ("monitor", "weekly", "status"):
        p = sub.add_parser(name)
        p.add_argument("--force", action="store_true")
    args = ap.parse_args()
    {"ticket": cmd_ticket, "bought": cmd_bought, "sold": cmd_sold,
     "monitor": cmd_monitor, "weekly": cmd_weekly, "status": cmd_status,
     "report": cmd_report, "personality": cmd_personality,
     "pulse": cmd_pulse, "scout": cmd_scout, "selftest": cmd_selftest}[args.cmd](args)


if __name__ == "__main__":
    main()

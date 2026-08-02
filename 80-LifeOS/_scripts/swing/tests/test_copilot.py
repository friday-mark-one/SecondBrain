import sys
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "live"))

from copilot import (DEFAULTS, audit, bdays_between, bs_call_delta,
                     day_trades_last5, kill_switch_check, market_open_now,
                     position_alerts, size_position)

CFG = dict(DEFAULTS)
ET = ZoneInfo("America/New_York")


def pos(opened="2026-07-20", premium=14.0):
    return {"ticker": "AMZN", "strike": 230.0, "expiry": "2026-12-18",
            "qty": 2, "premium": premium, "opened": opened}


def test_bdays_skips_weekends():
    assert bdays_between(date(2026, 7, 24), date(2026, 7, 27)) == 1  # Fri->Mon
    assert bdays_between(date(2026, 7, 20), date(2026, 7, 24)) == 4
    assert bdays_between(date(2026, 7, 24), date(2026, 7, 24)) == 0


def test_sizing_respects_risk_budget():
    # $20k, 2% risk, sized to a slipped stop fill at -25% of premium
    assert size_position(CFG, 14.0) == 1   # $400 / ($3.50*100)
    assert size_position(CFG, 2.5) == 6    # $400 / ($0.625*100)
    assert size_position(CFG, 30.0) == 0   # too expensive -> refuse upstream


def test_delta_sane():
    d = bs_call_delta(spot=200, strike=210, days=180, iv=0.30, r=0.04)
    assert 0.35 < d < 0.55


def test_stop_alert_fires_at_minus_15pct():
    alerts = position_alerts(CFG, pos(premium=14.0), bid=11.80, today=date(2026, 7, 21),
                             next_earnings=None)
    assert any(k == "stop" for k, _ in alerts)
    alerts = position_alerts(CFG, pos(premium=14.0), bid=12.20, today=date(2026, 7, 21),
                             next_earnings=None)
    assert not any(k == "stop" for k, _ in alerts)


def test_timeout_only_no_profit_ladder():
    p = pos(opened="2026-07-06")  # Mon; 2026-07-13 is day 5
    a = position_alerts(CFG, p, bid=14.0, today=date(2026, 7, 13), next_earnings=None)
    assert a == []  # day 5: no decay/profit-cap alerts exist anymore
    a = position_alerts(CFG, p, bid=14.0, today=date(2026, 7, 20), next_earnings=None)  # day 10
    assert any(k == "timeout" for k, _ in a)


def test_earnings_alert_inside_blackout():
    a = position_alerts(CFG, pos(), bid=14.0, today=date(2026, 7, 21),
                        next_earnings=date(2026, 7, 30))
    assert any(k == "earnings" for k, _ in a)
    a = position_alerts(CFG, pos(), bid=14.0, today=date(2026, 7, 21),
                        next_earnings=date(2026, 10, 29))
    assert not any(k == "earnings" for k, _ in a)


def test_no_quote_warns_not_stops():
    a = position_alerts(CFG, pos(), bid=0.0, today=date(2026, 7, 21), next_earnings=None)
    keys = [k for k, _ in a]
    assert "noquote" in keys and "stop" not in keys


def test_day_trade_counter():
    closed = [
        {"opened": "2026-07-24", "closed": "2026-07-24", "pnl": 100, "why": "tp"},
        {"opened": "2026-07-20", "closed": "2026-07-24", "pnl": 100, "why": "tp"},
        {"opened": "2026-07-01", "closed": "2026-07-01", "pnl": 100, "why": "tp"},
    ]
    assert day_trades_last5(closed, date(2026, 7, 27)) == 1


def test_kill_switch_on_consecutive_stops_and_drawdown():
    state = {"positions": [], "closed": [{"why": "stop", "pnl": -300}] * 3}
    assert kill_switch_check(CFG, state, date.today()) is not None
    state = {"positions": [], "closed": [{"why": "tp", "pnl": -3100}] * 1}
    assert kill_switch_check(CFG, state, date.today()) is not None  # -15.5% of 20k
    state = {"positions": [], "closed": [{"why": "stop", "pnl": -100},
                                         {"why": "tp", "pnl": 50},
                                         {"why": "stop", "pnl": -100}]}
    assert kill_switch_check(CFG, state, date.today()) is None


def test_audit_reports_expectancy():
    closed = [{"pnl": 200.0, "why": "tp", "opened": "2026-07-01", "closed": "2026-07-02"},
              {"pnl": -100.0, "why": "stop", "opened": "2026-07-03", "closed": "2026-07-06"}]
    s = audit(closed)
    assert "n=2" in s and "$+100" in s and "tp:1" in s and "stop:1" in s


def test_market_hours_gate():
    assert market_open_now(datetime(2026, 7, 27, 10, 0, tzinfo=ET))       # Mon 10am
    assert not market_open_now(datetime(2026, 7, 26, 10, 0, tzinfo=ET))   # Sunday
    assert not market_open_now(datetime(2026, 7, 27, 9, 15, tzinfo=ET))
    assert not market_open_now(datetime(2026, 7, 27, 16, 5, tzinfo=ET))


def test_screen_gate():
    from copilot import screen_failures
    assert screen_failures(CFG, 250.0, 5_000_000, 9e9) == []
    fails = screen_failures(CFG, 15.0, 500_000, 30e6)
    assert len(fails) == 3 and "price" in fails[0]
    assert screen_failures(CFG, 250.0, 5_000_000, None) == ["float unknown"]


def test_rsi_bounds():
    import pandas as pd
    from copilot import rsi
    up = pd.Series(range(1, 40), dtype="float64")
    assert rsi(up) > 90
    down = pd.Series(range(40, 1, -1), dtype="float64")
    assert rsi(down) < 10


def test_theta_negative_and_small_for_long_dated():
    from copilot import bs_call_theta_day
    th6mo = bs_call_theta_day(spot=200, strike=210, days=180, iv=0.30, r=0.04)
    th1wk = bs_call_theta_day(spot=200, strike=210, days=7, iv=0.30, r=0.04)
    assert th6mo < 0 and th1wk < 0
    assert abs(th1wk) > 2 * abs(th6mo)  # weeklies decay much faster in $...
    # ...and enormously faster per premium dollar (the claim shown on tickets):
    # the 7-day 5%-OTM call is worth ~$0.60 vs ~$12 for 6-month
    assert abs(th1wk) / 0.60 > 20 * abs(th6mo) / 12.0


def test_realized_vol_sane():
    import numpy as np
    import pandas as pd
    from copilot import realized_vol
    rng = np.random.default_rng(7)
    closes = pd.Series(100 * np.exp(np.cumsum(rng.normal(0, 0.02, 60))))
    rv = realized_vol(closes)
    assert 0.15 < rv < 0.55  # ~2%/day ≈ 32% annualized


def test_rubric_and_tldr():
    from copilot import evaluate_rubric, tldr
    clean = {"spot": 250.0, "screen_fails": [], "earnings_bdays": 40,
             "sma50": 240.0, "sma200": 210.0, "rsi14": 55.0, "ext_atr": 1.0,
             "atr_pct": 0.015, "rvol": 1.0, "beta": 1.2, "short_pct": 0.02,
             "iv6": 0.28, "rv20": 0.26, "spy_ext": 0.05, "vix": 15.0,
             "rs_60d": 0.02, "insider_buys": 1, "insider_sales": 4, "pc_oi": 0.9}
    checks = evaluate_rubric(CFG, clean)
    assert len(checks) == 14 and all(c == "green" for c, _, _ in checks)
    assert "CLEAN SETUP" in tldr(checks)

    ugly = dict(clean, earnings_bdays=5, atr_pct=0.06, iv6=0.90, rv20=0.40)
    checks = evaluate_rubric(CFG, ugly)
    reds = [label for c, label, _ in checks if c == "red"]
    assert set(reds) == {"Earnings", "Daily range", "Vol pricing"}
    assert "CAUTION" in tldr(checks)

    missing = {"spot": 250.0, "screen_fails": []}  # most metrics absent
    checks = evaluate_rubric(CFG, missing)
    labels = [label for _, label, _ in checks]
    assert "Trend" not in labels and "Screen" in labels  # absent data drops out
    assert any(label == "Earnings" and c == "yellow" for c, label, _ in checks)


def test_dip_and_run_stats():
    import numpy as np
    import pandas as pd
    from copilot import dip_response, run_continuation
    # sawtooth: sharp 2-day dips that fully recover in the next 5 days
    base = []
    px = 100.0
    for cycle in range(30):
        base += [px, px * 0.98, px * 0.955, px * 0.97, px * 0.985, px, px * 1.005]
        px *= 1.005
    c = pd.Series(base, dtype="float64")
    n, mean, hit = dip_response(c, dip=-0.03, window=2, fwd=5)
    assert n > 10 and mean > 0 and hit > 0.6  # dips recovered by construction
    rn, rmean, rhit = run_continuation(c, run=0.05, window=5, fwd=5)
    assert rn > 10 and rmean <= 0  # runs do not continue upward by construction


def test_merge_generated_preserves_manual_sections():
    from copilot import GEN_END, GEN_START, merge_generated
    template = "# T\n\n{GENERATED}\n\n## Narrative\n- seed\n\n## Log\n- created\n"
    v1 = merge_generated(None, "stats v1", template)
    assert "stats v1" in v1 and "## Narrative" in v1
    v1_edited = v1.replace("- created", "- created\n- 2026-07-28 — my observation")
    v2 = merge_generated(v1_edited, "stats v2", template)
    assert "stats v2" in v2 and "stats v1" not in v2
    assert "my observation" in v2  # manual log survives refresh
    assert v2.count(GEN_START) == 1 and v2.count(GEN_END) == 1


def test_unrealized_equity_and_breach():
    from copilot import unrealized_equity
    closed = [{"pnl": -1000.0}]
    marks = [(7.0, 14.0, 3)]  # open position down $2,100
    eq = unrealized_equity(CFG, closed, marks)
    assert eq == 20000 - 1000 - 2100
    assert unrealized_equity(CFG, closed, [(0.0, 14.0, 3)]) == 19000  # no quote -> skipped


def test_earnings_dual_prefers_earlier_on_disagreement():
    import copilot
    orig_yf, orig_av = copilot.next_earnings_date, copilot.next_earnings_av
    try:
        copilot.next_earnings_date = lambda t: date(2026, 8, 20)
        copilot.next_earnings_av = lambda t: date(2026, 8, 5)
        d, note = copilot.next_earnings_dual("X")
        assert d == date(2026, 8, 5) and "disagree" in note
        copilot.next_earnings_av = lambda t: None
        d, note = copilot.next_earnings_dual("X")
        assert d == date(2026, 8, 20) and "single source" in note
    finally:
        copilot.next_earnings_date, copilot.next_earnings_av = orig_yf, orig_av


def test_pulse_triggers_fire_only_on_unusual_days():
    import pandas as pd
    from copilot import pulse_triggers

    def frame(rows):
        idx = pd.bdate_range("2024-01-01", periods=len(rows))
        df = pd.DataFrame(rows, columns=["Open", "High", "Low", "Close"], index=idx)
        df["Volume"] = 1_000_000
        return df

    quiet = [(100.0, 100.6, 99.4, 100.0)] * 300
    assert pulse_triggers(frame(quiet)) == []

    crash = quiet[:-1] + [(100.0, 100.5, 93.0, 93.5)]  # -6.5% day, ~5x ATR
    trig = pulse_triggers(frame(crash))
    assert any("day" in t for t in trig) and any("52-week low" in t for t in trig)

    gap = quiet[:-1] + [(104.0, 104.5, 103.5, 104.2)]
    trig = pulse_triggers(frame(gap))
    assert any("gap" in t for t in trig)

    df = frame(quiet)
    df.iloc[-1, df.columns.get_loc("Volume")] = 4_000_000
    assert any("volume" in t for t in pulse_triggers(df))


def test_pick_strike_prefers_liquid_round_strikes():
    import pandas as pd
    from copilot import pick_strike
    calls = pd.DataFrame({
        "strike": [200.0, 205.0, 207.5, 210.0, 220.0, 250.0],
        "bid":    [23.55, 21.30, 20.10, 19.40, 15.50, 8.00],
        "ask":    [23.85, 21.65, 20.60, 19.55, 15.75, 8.60],
    })
    row = pick_strike(calls, spot=197.43, cfg=CFG)
    assert row["strike"] == 210.0  # tightest spread in the 2-8% OTM band
    dead = calls.assign(bid=0.0)
    assert pick_strike(dead, spot=197.43, cfg=CFG) is None


def test_as_date_normalizes_timestamp_date_and_datetime():
    import pandas as pd
    from copilot import _as_date
    assert _as_date(pd.Timestamp("2026-10-28 16:00", tz="America/New_York")) == date(2026, 10, 28)
    assert _as_date(datetime(2026, 10, 28, 16, 0)) == date(2026, 10, 28)
    assert _as_date(date(2026, 10, 28)) == date(2026, 10, 28)


def test_new_family_checks():
    from copilot import (_chk_insiders, _chk_options_positioning, _chk_regime,
                         _chk_rel_strength)
    assert _chk_regime(CFG, {"spy_ext": -0.03, "vix": 25.0})[0] == "red"
    assert _chk_regime(CFG, {"spy_ext": 0.04, "vix": 32.0})[0] == "yellow"
    assert _chk_regime(CFG, {"spy_ext": 0.04, "vix": 14.0})[0] == "green"
    assert _chk_rel_strength(CFG, {"rs_60d": -0.20})[0] == "red"
    assert _chk_rel_strength(CFG, {"rs_60d": 0.08})[0] == "green"
    assert _chk_insiders(CFG, {"insider_buys": 2, "insider_sales": 5})[0] == "green"
    assert _chk_insiders(CFG, {}) is None
    assert _chk_options_positioning(CFG, {"pc_oi": 1.8})[0] == "yellow"
    assert _chk_options_positioning(CFG, {"pc_oi": 0.9})[0] == "green"


def test_post_exit_helpers():
    from copilot import needs_post_exit, post_exit_summary
    c = {"closed": "2026-07-17", "why": "stop"}
    assert needs_post_exit(c, date(2026, 7, 28))          # 7 trading days ago
    assert not needs_post_exit(c, date(2026, 7, 21))      # too recent
    assert not needs_post_exit({**c, "post5_stock": 0.03}, date(2026, 7, 28))
    closed = [{"why": "stop", "post5_stock": 0.04},
              {"why": "stop", "post5_stock": 0.02},
              {"why": "timeout", "post5_stock": -0.01},
              {"why": "profit"}]
    s = post_exit_summary(closed)
    assert "stop +3.0% (n=2)" in s and "timeout -1.0% (n=1)" in s
    assert post_exit_summary([{"why": "tp"}]) == ""


def test_macro_calendar_load_and_missing(tmp_path):
    from copilot import load_macro_calendar
    p = tmp_path / "macro_calendar.csv"
    p.write_text("date,type\n2026-09-16,FOMC\n2026-08-12,CPI\n\nbadline,X\n")
    events = load_macro_calendar(p)
    assert events == [(date(2026, 8, 12), "CPI"), (date(2026, 9, 16), "FOMC")]
    assert load_macro_calendar(tmp_path / "absent.csv") == []


def test_macro_upcoming_window_and_wording():
    from copilot import macro_upcoming
    today = date(2026, 7, 27)  # a Monday
    events = [(date(2026, 7, 27), "CPI"),   # today
              (date(2026, 7, 28), "FOMC"),  # 1 trading day
              (date(2026, 8, 5), "NFP"),    # 7 trading days
              (date(2026, 7, 24), "CPI")]   # past — excluded
    lines = macro_upcoming(events, today, 2)
    assert len(lines) == 2
    assert "CPI print today" in lines[0]
    assert "Fed decision (FOMC) in 1 trading day (" in lines[1]
    assert macro_upcoming(events, today, 10)[-1].startswith("jobs report in 7 trading days")


def test_month_note_only_flagged_months():
    from copilot import month_note
    assert "April" in month_note(date(2026, 4, 2))
    assert "September" in month_note(date(2026, 9, 15))
    assert month_note(date(2026, 6, 1)) is None


def test_calendar_last_date_is_earliest_per_type_end():
    from copilot import calendar_last_date
    # FOMC extends a year past CPI: coverage ends when the SHORTEST type ends
    assert calendar_last_date([(date(2026, 8, 12), "CPI"),
                               (date(2026, 12, 10), "CPI"),
                               (date(2027, 12, 8), "FOMC")]) == date(2026, 12, 10)
    assert calendar_last_date([]) is None

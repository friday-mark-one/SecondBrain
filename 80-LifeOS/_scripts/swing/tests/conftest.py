import pandas as pd


def make_ohlcv(rows, start="2020-01-01"):
    """rows: list of (open, high, low, close). Returns a daily-indexed OHLCV frame."""
    idx = pd.bdate_range(start=start, periods=len(rows))
    df = pd.DataFrame(rows, columns=["open", "high", "low", "close"], index=idx)
    df["volume"] = 1_000_000
    return df


def const_series(value, n, start="2020-01-01"):
    idx = pd.bdate_range(start=start, periods=n)
    return pd.Series([value] * n, index=idx, dtype="float64")

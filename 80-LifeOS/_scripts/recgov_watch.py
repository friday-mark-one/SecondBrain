#!/usr/bin/env python3
"""
Poll recreation.gov timed-entry availability and alert when a slot opens.

Usage:
 python3 recgov_watch.py # defaults: facility 10086910, tour 10086912, 2026-09-04 10:00, every 10s, runs until stopped
 python3 recgov_watch.py --dump # print the raw API response once and exit (use this first to confirm field names)
 python3 recgov_watch.py --interval 30 --hours 24 --ntfy <topic>
 python3 recgov_watch.py --test-notify --ntfy <topic> # send a test notification and exit
 python3 recgov_watch.py --once # check once and exit

No third-party dependencies. macOS notifications via osascript (opens the booking page when a slot
opens); Android/Termux via termux-notification; phone push via ntfy.sh when --ntfy <topic> is given.
"""
import argparse
import json
import os
import platform
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime

FACILITY_ID = "10086910"
TOUR_ID = "10086912"
DATE = "2026-09-04"
TARGET_HOUR = 10  # 10 AM
BOOK_URL = f"https://www.recreation.gov/timed-entry/{FACILITY_ID}/ticket/{TOUR_ID}"
API_URL = f"https://www.recreation.gov/api/timedentry/availability/facility/{FACILITY_ID}?date={DATE}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": BOOK_URL,
}


def fetch():
    req = urllib.request.Request(API_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def slot_hour(slot):
    """tour_time is 'HHMM' (e.g. '1000'); fall back to tour_start_timestamp."""
    t = str(slot.get("tour_time") or "").strip()
    if t.isdigit() and len(t) == 4:
        return int(t[:2])
    ts = slot.get("tour_start_timestamp")
    if ts:
        try:
            return datetime.fromisoformat(ts.replace("Z", "+00:00")).hour
        except ValueError:
            pass
    return None


def available(slot):
    """Open seats = inventory_count - reservation_count, per bucket (ANY, ANY_SECONDARY, ...).
    Only counts buckets whose booking window is already open."""
    inv = slot.get("inventory_count") or {}
    res = slot.get("reservation_count") or {}
    windows = slot.get("booking_windows") or {}
    now = datetime.now().astimezone()
    out = {}
    for key, cap in inv.items():
        if not isinstance(cap, (int, float)):
            continue
        win = "SECONDARY" if key.endswith("_SECONDARY") else "PRIMARY"
        opens = (windows.get(win) or {}).get("open_timestamp")
        if opens:
            try:
                if datetime.fromisoformat(opens.replace("Z", "+00:00")) > now:
                    continue  # window not open yet
            except ValueError:
                pass
        free = cap - (res.get(key) or 0)
        if free > 0:
            out[key] = free
    return out


def secondary_opens(slot):
    return ((slot.get("booking_windows") or {}).get("SECONDARY") or {}).get("open_timestamp")


def all_slots(data):
    """Return the flat list of slot objects regardless of API shape."""
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return []
    av = data.get("availability")
    if isinstance(av, list):
        return av
    if isinstance(av, dict):
        out = []
        for v in av.values():
            if isinstance(v, list):
                out.extend(v)
            elif isinstance(v, dict):
                for v2 in v.values():
                    if isinstance(v2, list):
                        out.extend(v2)
        return out
    return []


def find_target(data):
    for s in all_slots(data):
        if not isinstance(s, dict):
            continue
        if str(s.get("tour_id")) == TOUR_ID and str(s.get("tour_date"))[:10] == DATE and slot_hour(s) == TARGET_HOUR:
            return s
    return None


NTFY_TOPIC = None  # set via --ntfy


def push(title, msg):
    """Send a phone push via ntfy.sh (install the ntfy app and subscribe to the same topic)."""
    if not NTFY_TOPIC:
        return
    try:
        req = urllib.request.Request(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=msg.encode(),
            headers={"Title": title, "Priority": "urgent", "Tags": "rotating_light", "Click": BOOK_URL},
        )
        urllib.request.urlopen(req, timeout=10).read()
    except Exception as e:
        print(f" (ntfy push failed: {e})")


def notify(title, msg):
    print(f"\a{title}: {msg}")
    push(title, msg)
    if platform.system() == "Darwin":
        subprocess.run(["osascript", "-e", f'display notification "{msg}" with title "{title}" sound name "Glass"'], check=False)
        subprocess.run(["open", BOOK_URL], check=False)
    elif "com.termux" in os.environ.get("PREFIX", ""):  # Android/Termux
        subprocess.run(["termux-notification", "--title", title, "--content", msg, "--sound", "--vibrate", "500,500,500"], check=False)
        subprocess.run(["termux-open-url", BOOK_URL], check=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=int, default=10, help="seconds between checks (default 10)")
    ap.add_argument("--hours", type=float, default=0, help="how long to run in hours (default: run until stopped)")
    ap.add_argument("--dump", action="store_true", help="print raw API response and exit")
    ap.add_argument("--once", action="store_true", help="check once and exit (no alert-and-stop loop)")
    ap.add_argument("--ntfy", metavar="TOPIC", help="also push to your phone via ntfy.sh/<TOPIC>")
    ap.add_argument("--test-notify", action="store_true", help="send a test notification and exit")
    args = ap.parse_args()

    global NTFY_TOPIC
    NTFY_TOPIC = args.ntfy

    if args.test_notify:
        notify("recgov_watch test", "Notifications are working.")
        return

    if args.dump:
        print(json.dumps(fetch(), indent=2))
        return

    deadline = time.time() + args.hours * 3600 if args.hours and args.hours > 0 else None
    if deadline is not None:
        print(f"Watching {BOOK_URL} for {DATE} {TARGET_HOUR}:00 every {args.interval}s until {datetime.fromtimestamp(deadline):%Y-%m-%d %H:%M}. Ctrl-C to stop.")
    else:
        print(f"Watching {BOOK_URL} for {DATE} {TARGET_HOUR}:00 every {args.interval}s indefinitely. Runs until you stop it. Ctrl-C to stop.")
    announced_secondary = False
    was_open = False  # True while seats are continuously available, so we alert only on fresh openings

    while True:
        if deadline is not None and time.time() >= deadline:
            print(f"[{datetime.now():%H:%M:%S}] watch window elapsed ({args.hours:g}h); exiting.")
            break
        ts = datetime.now().strftime("%H:%M:%S")
        try:
            slot = find_target(fetch())
            if slot is None:
                print(f"[{ts}] {TARGET_HOUR}:00 slot not found in response")
            else:
                if not announced_secondary and secondary_opens(slot):
                    opens = datetime.fromisoformat(secondary_opens(slot)).astimezone()
                    print(f" Note: secondary release of {slot['inventory_count'].get('ANY_SECONDARY', 0)} tickets opens {opens:%a %b %d %I:%M %p %Z} (your local time).")
                    announced_secondary = True
                free = available(slot)
                total = sum(free.values())
                print(f"[{ts}] open seats: {total}" + (f" {free}" if free else ""))
                if total > 0 and not was_open:
                    was_open = True
                    notify("Recreation.gov slot open!", f"{total} spot(s) for {DATE} {TARGET_HOUR}:00 AM. Book now.")
                    if not args.once:
                        for _ in range(4):  # nag a few more times, then keep watching
                            time.sleep(15)
                            notify("Recreation.gov slot open!", f"{DATE} {TARGET_HOUR}:00 AM — go book it.")
                elif total == 0:
                    was_open = False  # sold out again; next opening will alert fresh
        except urllib.error.HTTPError as e:
            print(f"[{ts}] HTTP {e.code} — {'rate limited, backing off' if e.code == 429 else e.reason}")
            if e.code == 429:
                time.sleep(args.interval * 4)
        except Exception as e:  # network blips, JSON errors, etc.
            print(f"[{ts}] error: {e}")

        if args.once:
            break
        time.sleep(args.interval)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)

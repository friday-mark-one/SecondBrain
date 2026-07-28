# Copilot deployment — mac mini setup

Files in this zip mirror SecondBrain vault paths. If obsidian-git later syncs the
same files, contents are identical — no conflict.

## Steps (one time, ~5 minutes)

1. Unzip into the vault root so paths merge:
       cd ~/SecondBrain && unzip -o ~/Downloads/copilot-mini.zip
2. Build the Python environment:
       cd ~/SecondBrain/80-LifeOS/_scripts/swing
       python3 -m venv .venv
       .venv/bin/pip install -r requirements.txt
   (If pip hits a 401 on an internal registry: add  --index-url https://pypi.org/simple)
3. Copy the AlphaVantage key from the laptop (NOT included in this zip — it's a credential):
       scp <laptop>:~/.alphavantage_key ~/.alphavantage_key && chmod 600 ~/.alphavantage_key
   Optional — without it the earnings gate runs single-source (still fails closed).
4. Verify everything:
       .venv/bin/python live/copilot.py selftest
   All six checks must be ✅ — including "telegram: test message sent" (creds already
   exist on the mini at ~/.openclaw/telegram.json, same as the news digest).
5. Run the test suite once:
       .venv/bin/python -m pytest tests/ -q        # expect: 25 passed
6. Nothing else to schedule — HEARTBEAT.md (included) already carries the three
   entries (Monitor, Pulse, Weekly) plus the command mappings; Friday picks them up
   on its next cycle.

## What's included
- swing/live/copilot.py + state.json (account $50k, 2% spread ceiling, 18-name watchlist)
- swing/requirements.txt, tests/ (25 tests)
- 80-LifeOS/Options copilot instructions.md (Friday's command map + the 8 rules)
- 80-LifeOS/agent-protocol/HEARTBEAT.md (wiring — REPLACES the existing file; it is a
  superset of the current one)
- 04-Finance/Day trading/: MOC, Trading research archive, Reading the copilot report,
  Evidence-backed techniques, Personalities/ (18 stock notes)

## Not included, by design
- .venv (rebuilt in step 2), ~/.alphavantage_key (step 3), ~/.openclaw/telegram.json
  (already on the mini), iv_history.csv + journal (created automatically at runtime)

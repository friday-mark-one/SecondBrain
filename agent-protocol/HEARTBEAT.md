```markdown
# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.
```

# Background Operations

- [x] **Shopping List Maintenance:** During every heartbeat cycle, silently execute the python script located at `~/SecondBrain/memory/_scripts/vault_sweeper.py`. 
    - If the execution is successful, log a `HEARTBEAT_OK` internally and do not message me.
    - If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Pantry Alert:** The background shopping sweeper script encountered an error" and include the raw error output.
- [x] **Expiry Notifier:** During each heartbeat cycle, run `node ~/SecondBrain/memory/_scripts/notify-expiring.js`. The script **self-gates** — it does nothing before 19:00 local, runs at most once per calendar day, and records its own last-run date. So just run it every cycle; do **NOT** track the time yourself, decide whether it "already ran today", or write any state/log/bookkeeping files for it.
	- If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Expiry Alert:** The expiry notifier script encountered an error" and include the raw error output.
- [x] **Inbox Sweep:** During each heartbeat, if `~/SecondBrain/memory/Inbox.md` has any non-comment, non-empty lines, run the capture sweep per `~/SecondBrain/memory/Capture instructions.md` (`node ~/SecondBrain/memory/_scripts/capture.js inbox-take`, then route + file each line). Stay silent if Inbox is empty.
    - If `capture.js` errors, send Telegram: "🚨 **Capture Alert:** the Inbox sweep hit an error" with the raw output.
- [x] **Returns Notifier:** During each heartbeat cycle, run `node ~/SecondBrain/memory/_scripts/notify-returns.js`. The script **self-gates** — it does nothing before 19:00 local, runs at most once per calendar day, and records its own last-run date. So just run it every cycle; do **NOT** track the time yourself, decide whether it "already ran today", or write any state/log/bookkeeping files for it.
	- If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Returns Alert:** The returns notifier script encountered an error" and include the raw error output.

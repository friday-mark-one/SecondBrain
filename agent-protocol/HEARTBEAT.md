```markdown
# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.
```

# Background Operations

- [x] **Shopping List Maintenance:** During every heartbeat cycle, silently execute the python script located at `~/SecondBrain/memory/_scripts/vault_sweeper.py`. 
    - If the execution is successful, log a `HEARTBEAT_OK` internally and do not message me.
    - If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Pantry Alert:** The background shopping sweeper script encountered an error" and include the raw error output.
- [x] **Expiry Notifier:** Once per day, in the evening after 19:00 local time, run the Node script at `~/SecondBrain/memory/_scripts/notify-expiring.js` with `node`. Run it **at most once per calendar day** — if you have already run it today, skip this task for the rest of the day's cycles.
	- If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Expiry Alert:** The expiry notifier script encountered an error" and include the raw error output.
```markdown
# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.
```

# Background Operations

- [ ] **Shopping List Maintenance:** During every heartbeat cycle, silently execute the python script located at `/Users/openclaw/.openclaw/workspace/scripts/vault_sweeper.py`. 
    - If the execution is successful, log a `HEARTBEAT_OK` internally and do not message me.
    - If the script fails or throws an exception, immediately send a message to me on Telegram saying: "🚨 **Pantry Alert:** The background shopping sweeper script encountered an error" and include the raw error output.
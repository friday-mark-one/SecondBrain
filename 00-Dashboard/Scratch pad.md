DO NOT TOUCH THIS FILE unless explicitly asked to write to my scratch pad.

1. Installed Ollama with small LLM
2. LiteLLM configured with Gemini 3 Flash, Ollama, OpenRouter, etc.
	1. Check ~/litellm
	2. LiteLLM runs as a launchdaemon
3. Antigravity
4. VSCode + Kilo
5. OpenClaw in a separate mac account
6. Obsidian
	1. With git sync to other devices
	2. Obsidian sync paid so it syncs to mobile
7. Workspace agent .md files copy over from Obsidian through an fswatch script triggered by a launchagent


### TODO
- [x] Auto push github repo every 10 minutes
- [x] Setup gmail for agent
- [ ] Add Mira to Friday bot
- [ ] Obsidian
	- [ ] Settings
		- [ ] File links
		- [ ] Default location for new attachments
		- [x] Sync unsupported file types
	- [ ] Plugins
		- [x] Data files editor
		- [x] HTML Reader
		- [x] excalidraw
		- [x] kanban
		- [ ] slash commands
	- [ ] Redesign with inspiration from
		- [ ] https://github.com/TheMickeyMouse/Obsidian-Vault-Template
- [ ] OpenClaw
	- [ ] openclaw configure --web
- [ ] LiteLLM
	- [ ] Setup caching with redis
		- [ ] https://gemini.google.com/app/e257d9d1a2368724
	- [x] centralized observability with a local solution like postgres
	- [ ] Fallback from deep seek to Gemini for 429 or 500
- [ ] Telegram unofficial apps
- [ ] Move skills and most agent .md files and scripts to Obsidian
- [x] Meal plan
	- [x] Add recipes
	- [x] Add items
		- [x] Define tags
	- [x] Build cookbook
	- [x] Refer SOP in openclaw
	- [x] allow one item multiple store
	- [ ] more recipes
	- [x] start date from next day
	- [ ] buy list one off item don't need quantity by default
- [ ] Move notion notes
	- [ ] Restaurant journal
- [ ] Trading agent 
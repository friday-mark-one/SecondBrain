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
7. Workspace agent .md files copy over to Obsidian through an fswatch script triggered by a launchagent


### TODO
- [x] Auto push github repo every 10 minutes
- [x] Setup gmail for agent
- [ ] Add Mira to Friday bot
- [ ] Obsidian
	- [ ] Settings
		- [ ] File links
		- [ ] Default location for new attachments
		- [ ] Sync unsupported file types
	- [ ] Plugins
		- [ ] Data files editor
		- [ ] HTML Reader
- [ ] OpenClaw
	- [ ] openclaw configure --web
- [ ] LiteLLM
	- [ ] Setup caching with redis
	- [ ] centralized observability with a local solution like postgres
	- [ ] Fallback from deep seek to Gemini for 429 or 500
 ## .claude/MEMORY.md
 
 1. walk through before going into new area
 2. don't post PR comments unprompted
 3. show diff before opening a new PR
 4. follow conventional commits

 ## Plugins
 1. superpowers
 2. codex
 3. pr-workflow
 4. Ralph wiggum - https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum

 ## Skills
 1. Handoff - https://github.com/mattpocock/skills/blob/main/skills/productivity/handoff/SKILL.md
 2. Sidekick - https://github.com/jleechanorg/claude-commands/blob/main/.claude/skills/sidekick/SKILL.md

 ## Status command line
 
 #!/bin/sh
 # Claude Code status line — mirrors p10k classic layout:
 # dir  git-branch  [venv]  |  model  ctx%
 
 input=$(cat)
 
 cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
 # Shorten home directory to ~
 home="$HOME"
 short_cwd="${cwd/#$home/~}"
 
 model=$(echo "$input" | jq -r '.model.display_name // .model.id')
 
 # Git branch (skip optional locks to avoid blocking)
 git_branch=""
 if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
   git_branch=$(git -C "$cwd" -c core.hooksPath=/dev/null symbolic-ref --short HEAD 2>/dev/null \
     || git -C "$cwd" rev-parse --short HEAD 2>/dev/null)
 fi
 
 # Python virtualenv / conda env (only set when claude was launched inside an activated env)
 venv=""
 if [ -n "$VIRTUAL_ENV" ]; then
   venv="($(basename "$VIRTUAL_ENV"))"
 elif [ -n "$CONDA_DEFAULT_ENV" ]; then
   venv="($CONDA_DEFAULT_ENV)"
 fi
 
 # Context window usage
 ctx=""
 used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
 if [ -n "$used" ]; then
   ctx=$(printf " ctx:%.0f%%" "$used")
 fi
 
 # ANSI 256-color helpers
 C_CWD="\033[38;5;37m"    # Teal / Cyan 400
 C_GIT="\033[38;5;178m"   # Amber / Gold
 C_VENV="\033[38;5;107m"  # Muted Light Green
 C_SEP="\033[38;5;103m"   # Blue-Grey / soft purple
 C_MODEL="\033[38;5;140m" # Soft Lavender / Deep Purple 300
 C_CTX="\033[38;5;173m"   # Warm Orange
 C_RESET="\033[0m"
 
 # Build left part: dir  [git branch]  [venv]
 left="${C_CWD}${short_cwd}${C_RESET}"
 if [ -n "$git_branch" ]; then
   left="${left}  ${C_GIT}${git_branch}${C_RESET}"
 fi
 if [ -n "$venv" ]; then
   left="${left}  ${C_VENV}${venv}${C_RESET}"
 fi
 
 # Build right part: model  ctx%
 right="${C_MODEL}${model}${C_RESET}"
 if [ -n "$ctx" ]; then
   right="${right}${C_CTX}${ctx}${C_RESET}"
 fi
 
 printf "%b  %b|%b  %b" "$left" "$C_SEP" "$C_RESET" "$right"

 # CLAUDE.md
 
 Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.
 
 **Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.
 
 ## 1. Think Before Coding
 
 **Don't assume. Don't hide confusion. Surface tradeoffs.**
 
 Before implementing:
 - State your assumptions explicitly. If uncertain, ask.
 - If multiple interpretations exist, present them - don't pick silently.
 - If a simpler approach exists, say so. Push back when warranted.
 - If something is unclear, stop. Name what's confusing. Ask.
 
 ## 2. Simplicity First
 
 **Minimum code that solves the problem. Nothing speculative.**
 
 - No features beyond what was asked.
 - No abstractions for single-use code.
 - No "flexibility" or "configurability" that wasn't requested.
 - No error handling for impossible scenarios.
 - If you write 200 lines and it could be 50, rewrite it.
 
 Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.
 
 ## 3. Surgical Changes
 
 **Touch only what you must. Clean up only your own mess.**
 
 When editing existing code:
 - Don't "improve" adjacent code, comments, or formatting.
 - Don't refactor things that aren't broken.
 - Match existing style, even if you'd do it differently.
 - If you notice unrelated dead code, mention it - don't delete it.
 
 When your changes create orphans:
 - Remove imports/variables/functions that YOUR changes made unused.
 - Don't remove pre-existing dead code unless asked.
 
 The test: Every changed line should trace directly to the user's request.
 
 ## 4. Goal-Driven Execution
 
 **Define success criteria. Loop until verified.**
 
 Transform tasks into verifiable goals:
 - "Add validation" → "Write tests for invalid inputs, then make them pass"
 - "Fix the bug" → "Write a test that reproduces it, then make it pass"
 - "Refactor X" → "Ensure tests pass before and after"
 
 For multi-step tasks, state a brief plan:
 ```
 1. [Step] → verify: [check]
 2. [Step] → verify: [check]
 3. [Step] → verify: [check]
 ```
 
 ## 5. Miscellaneous instructions
 - NEVER attempt to use MCP tools or connectors for GitHub operations. Always use the local gh CLI directly for accessing PRs, issues, and repositories.
 
 Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
 
 ## 6. Memory storage (OVERRIDES default auto-memory behavior)
 
 All memories — across every project — go into the single file `/Users/bgopalbaaskaran/.claude/MEMORY.md`.
 
 - Do NOT create per-project memory directories (e.g. `~/.claude/projects/<slug>/memory/`).
 - Do NOT split memories into one-file-per-entry. Each memory is a `## <slug>` section appended to the
 global file.
 - Each section must include `Type:` (user / feedback / project / reference) and `Scope:` (`global` or a
 project path like `cloud-console`).
 - For feedback/project entries include **Why:** and **How to apply:** lines.
 - Before adding a memory, read the file and update an existing section if one already covers the topic —
 no duplicates.
 - Remove or rewrite sections that become wrong or stale rather than stacking corrections.

 ## Insights
 1. Adversarial review all designs and code changes
 2. Credential failures
 3. Investigate the root cause, then present findings ONLY as a table: | Claim | Evidence (file:line or metric query + value) | Confidence (high/med/UNVERIFIED) |. Anything you inferred rather than observed must be marked UNVERIFIED. No prose narrative until after the table.
 4. Don't add a wall of comments to the code 
 5. Remove AI slop 
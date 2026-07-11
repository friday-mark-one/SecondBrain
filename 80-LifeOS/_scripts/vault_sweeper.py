import os
import re
import json
import datetime

# ==========================================
# CONFIGURATION (from paths.json)
# ==========================================
_SCRIPTS = os.path.dirname(os.path.abspath(__file__))
_VAULT_ROOT = os.path.normpath(os.path.join(_SCRIPTS, "..", ".."))
with open(os.path.join(_SCRIPTS, "paths.json")) as _f:
    _CFG = json.load(_f)

def _p(rel):
    return os.path.join(_VAULT_ROOT, rel)

# 1. Shopping Tracker File
SHOPPING_FILE = _p(_CFG["shoppingTracker"])

# 2. Vault root to scan for checklist notes (frontmatter: type: checklist)
VAULT_ROOT = _VAULT_ROOT

# 3. The Hidden Log File
TRASH_LOG_FILE = os.path.join(_p(_CFG["logs"]), ".swept_tasks_log.md")

# ==========================================
# SHOPPING TRACKER LOGIC
# ==========================================
def sweep_shopping_list():
    if not os.path.exists(SHOPPING_FILE):
        return

    with open(SHOPPING_FILE, 'r') as f:
        lines = f.readlines()

    # 1. Split file into Active and Archive sections
    active_lines = []
    archive_lines = []
    found_archive = False

    for line in lines:
        if line.startswith("# Archive"):
            found_archive = True
            archive_lines.append(line)
            continue
        
        if found_archive:
            archive_lines.append(line)
        else:
            active_lines.append(line)

    # 2. Process Active Section
    new_active_lines = []
    to_archive = {}
    current_store = None
    in_staples = False


    for line in active_lines:
        # Detect main store header
        store_match = re.match(r'^##\s+(.+)', line)
        if store_match:
            current_store = store_match.group(1).strip()
            in_staples = False
            new_active_lines.append(line)
            continue
        
        # Detect staples header (level 3 or higher)
        staples_match = re.match(r'^#{3,}\s+.*[sS]taples', line)
        if staples_match:
            in_staples = True
            new_active_lines.append(line)
            continue
            
        # Detect checked tasks
        task_match = re.match(r'^(\s*)[-*]\s+\[([xX])\]\s+(.*)', line)
        
        if task_match and current_store and not in_staples:
            # It's an active checked item: Move to archive, reset to unchecked
            indent = task_match.group(1)
            item = task_match.group(3).strip()
            
            if current_store not in to_archive:
                to_archive[current_store] = []
                
            to_archive[current_store].append(f"{indent}- [ ] {item}\n")
        else:
            # Keep everything else exactly as is (unchecked items, notes, staples)
            new_active_lines.append(line)

    # 3. Process Archive Section
    new_archive_lines = []
    # Ensure an archive header exists if we have items to move
    if not archive_lines and to_archive:
        new_archive_lines = ["\n# Archive\n\n"]
    elif archive_lines:
        pass # We will populate it below

    current_archive_store = None
    for line in archive_lines:
        store_match = re.match(r'^##\s+(.+)', line)
        if store_match:
            current_archive_store = store_match.group(1).strip()
            new_archive_lines.append(line)
            
            # Immediately inject newly archived items under this existing store
            if current_archive_store in to_archive:
                new_archive_lines.extend(to_archive[current_archive_store])
                del to_archive[current_archive_store] # Remove so we don't add it again later
            continue
            
        new_archive_lines.append(line)

    # 4. Append remaining stores that didn't already have an archive header
    for store, items in to_archive.items():
        if new_archive_lines and not new_archive_lines[-1].endswith("\n"):
            new_archive_lines.append("\n")
        new_archive_lines.append(f"## {store}\n")
        new_archive_lines.extend(items)
        new_archive_lines.append("\n")

    # 5. Write everything back safely
    if lines != (new_active_lines + new_archive_lines):
        with open(SHOPPING_FILE, 'w') as f:
            f.writelines(new_active_lines)
            f.writelines(new_archive_lines)

# ==========================================
# GENERAL CHECKLIST SWEEP LOGIC
# ==========================================
EXCLUDE_DIRS = set(_CFG["scanExclude"]) | set(_CFG["scanSkipDirs"])

def find_checklist_notes(root):
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith(".")]
        for name in filenames:
            if not name.endswith(".md"):
                continue
            path = os.path.join(dirpath, name)
            with open(path, "r") as f:
                head = f.read(400)
            fm = re.match(r"^---\n(.*?)\n---", head, re.S)
            if fm and re.search(r"^type:\s*checklist\s*$", fm.group(1), re.M):
                found.append(path)
    return found

def sweep_checklists():
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    swept_items_total = []

    for filepath in find_checklist_notes(VAULT_ROOT):
        if not os.path.exists(filepath):
            continue

        with open(filepath, 'r') as f:
            lines = f.readlines()

        new_lines = []
        swept_items = []
        filename = os.path.basename(filepath)

        for line in lines:
            match = re.match(r'^(\s*)[-*]\s+\[[xX]\]\s+(.*)', line)
            if match:
                task_content = match.group(2).strip()
                swept_items.append(f"- [{now}] ({filename}) {task_content}\n")
            else:
                new_lines.append(line)

        if len(lines) != len(new_lines):
            with open(filepath, 'w') as f:
                f.writelines(new_lines)
            swept_items_total.extend(swept_items)

    if swept_items_total:
        os.makedirs(os.path.dirname(TRASH_LOG_FILE), exist_ok=True)
        with open(TRASH_LOG_FILE, 'a') as f:
            f.writelines(swept_items_total)

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    sweep_shopping_list()
    sweep_checklists()
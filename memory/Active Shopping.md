```dataviewjs
// 1. Target the exact new filename
const page = dv.page("Shopping Tracker"); 

if (!page) {
    dv.paragraph("⚠️ **Error:** Could not find the file. Please check the exact file name in the dv.page() query.");
} else {
    const allTasks = page.file.tasks;
    const allGrouped = allTasks.groupBy(t => t.section.subpath || "Uncategorized");

    // 2. Helper function to assign dynamic graphic icons based on the store name
    function getStoreIcon(name) {
        const n = name.toLowerCase();
        if (n.includes("costco")) return "🛒";
        if (n.includes("fred meyer") || n.includes("grocery")) return "🥬";
        if (n.includes("indian")) return "🌶️";
        if (n.includes("trader joe")) return "🌺";
        if (n.includes("amazon")) return "📦";
        if (n.includes("sephora") || n.includes("makeup")) return "✨";
        if (n.includes("hardware") || n.includes("home depot")) return "🔨";
        return "🛍️"; // Default fallback icon
    }

    // 3. Inject the highly visual, app-like CSS
    dv.el("style", `
    .shopping-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        padding: 1rem 0;
    }
    .store-card {
        background: var(--background-secondary-alt);
        border-radius: 24px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border: 1px solid var(--background-modifier-border);
    }
    
    /* Graphic Headers */
    .store-header-graphic {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 1.2rem;
        padding-bottom: 1rem;
        border-bottom: 2px dashed var(--background-modifier-border-hover);
    }
    .store-icon {
        font-size: 2.2em;
        background: var(--background-primary);
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .store-title {
        margin: 0 !important;
        font-size: 1.5em;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--text-normal);
    }

    /* Massive, Tap-Friendly List Items (The "Buttons") */
    .shopping-dashboard .contains-task-list {
        padding-left: 0 !important;
        list-style: none !important;
        margin: 0 !important;
    }
    .shopping-dashboard .task-list-item {
        display: flex !important;
        align-items: center;
        background: var(--background-primary);
        padding: 14px 18px !important;
        margin-bottom: 12px;
        border-radius: 16px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        border: 1px solid var(--background-modifier-border-hover);
        font-size: 1.15em;
        font-weight: 600;
        color: var(--text-normal);
        transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .shopping-dashboard .task-list-item:active {
        transform: scale(0.97);
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    
    /* Huge Checkboxes for Mobile */
    .shopping-dashboard .task-list-item input[type=checkbox] {
        width: 28px !important;
        height: 28px !important;
        margin-right: 18px !important;
        cursor: pointer;
        border-radius: 8px !important;
        border: 2px solid var(--text-muted);
        transition: all 0.2s ease;
    }
    .shopping-dashboard .task-list-item input[type=checkbox]:checked {
        background-color: var(--interactive-accent);
        border-color: var(--interactive-accent);
    }

    /* Success Empty State */
    .all-done-msg {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--background-secondary);
        border-radius: 24px;
        border: 2px dashed var(--background-modifier-border);
    }
    .all-done-icon {
        font-size: 4em;
        margin-bottom: 1rem;
        display: block;
    }
    .all-done-text {
        font-size: 1.4em;
        font-weight: 700;
        color: var(--text-muted);
    }
    `);

    // 4. Create the main grid container natively to prevent leaks
    const gridContainer = dv.container.createEl("div", { cls: "shopping-dashboard" });
    const originalContainer = dv.container;

    let totalPendingCount = 0;

    for (let group of allGrouped) {
        const tasks = group.rows;
        const pending = tasks.filter(t => !t.fullyCompleted);
        
        if (pending.length > 0) {
            totalPendingCount += pending.length;
            
            const card = gridContainer.createEl("div", { cls: "store-card" });
            const icon = getStoreIcon(group.key);
            
            // Inject the graphic header
            card.innerHTML = `
                <div class="store-header-graphic">
                    <span class="store-icon">${icon}</span>
                    <h3 class="store-title">${group.key}</h3>
                </div>
            `;
            
            // Render tasks natively inside the card
            dv.container = card;
            dv.taskList(pending, false); 
        }
    }

    // Restore container
    dv.container = originalContainer;

    // Graphic Empty State
    if (totalPendingCount === 0) {
        dv.container.createEl("div", { 
            cls: "all-done-msg", 
            innerHTML: `
                <span class="all-done-icon">🛒✨</span>
                <div class="all-done-text">All done! Your list is empty.</div>
            `
        });
    }
}
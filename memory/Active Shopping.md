```dataviewjs
// 1. Fetch your tasks (Change to "Shopping-List" if your raw tasks are in a different file)
const page = dv.page("Shopping Tracker"); 

if (!page) {
    dv.paragraph("⚠️ **Error:** Could not find the file.");
} else {
    const allTasks = page.file.tasks;
    const allGrouped = allTasks.groupBy(t => t.section.subpath || "Uncategorized");

    // 2. Icon Helper
    function getStoreIcon(name) {
        const n = name.toLowerCase();
        if (n.includes("costco")) return "🛒";
        if (n.includes("fred meyer") || n.includes("grocery")) return "🥬";
        if (n.includes("indian")) return "🌶️";
        if (n.includes("trader joe")) return "🌺";
        if (n.includes("amazon")) return "📦";
        if (n.includes("sephora") || n.includes("makeup")) return "✨";
        if (n.includes("hardware") || n.includes("home depot")) return "🔨";
        return "🛍️"; 
    }

    // 3. Build the DOM Framework (No CSS injected here anymore!)
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
            
            card.innerHTML = `
                <div class="store-header-graphic">
                    <span class="store-icon">${icon}</span>
                    <h3 class="store-title">${group.key}</h3>
                </div>
            `;
            
            dv.container = card;
            dv.taskList(pending, false); 
        }
    }

    dv.container = originalContainer;

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
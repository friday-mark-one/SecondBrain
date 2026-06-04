```dataviewjs
const page = dv.page("Shopping Tracker"); 

if (!page) {
    dv.paragraph("⚠️ **Error:** Could not find the file. Please check the exact file name in the dv.page() query.");
} else {
    const allTasks = page.file.tasks;
    const allGrouped = allTasks.groupBy(t => t.section.subpath || "Uncategorized");

    // Inject CSS silently
    dv.el("style", `
    .shopping-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
    }
    .store-card {
        border-radius: 16px;
        padding: 1.5rem;
        background: var(--background-secondary);
        border: 1px solid var(--background-modifier-border-hover);
        box-shadow: 0 8px 16px rgba(0,0,0,0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .store-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 20px rgba(0,0,0,0.08);
    }
    .store-header {
        font-size: 1.3em;
        font-weight: 700;
        color: var(--text-accent);
        margin: 0 0 0.8rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: none;
    }
    .store-progress {
        font-size: 0.7em;
        color: var(--text-muted);
        background: var(--background-primary);
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-weight: 600;
    }
    .progress-bar-bg {
        height: 6px;
        background: var(--background-modifier-border);
        border-radius: 4px;
        margin-bottom: 1.2rem;
        overflow: hidden;
    }
    .progress-bar-fill {
        height: 100%;
        background: var(--interactive-accent);
        transition: width 0.4s ease;
    }
    .task-list-item input[type=checkbox] {
        transform: scale(1.3);
        margin-right: 14px;
        cursor: pointer;
        accent-color: var(--interactive-accent);
    }
    .task-list-item {
        padding: 0.3rem 0;
        font-size: 1.05em;
    }
    .all-done-msg {
        text-align: center;
        padding: 3rem 1rem;
        font-size: 1.2em;
        color: var(--text-success);
        background: var(--background-secondary);
        border-radius: 16px;
        border: 1px dashed var(--background-modifier-border);
    }
    `);

    // 1. Create the main grid container natively using the DOM
    const gridContainer = dv.container.createEl("div", { cls: "shopping-dashboard" });
    
    // 2. Save the original Dataview container
    const originalContainer = dv.container;

    let totalPendingCount = 0;

    for (let group of allGrouped) {
        const tasks = group.rows;
        const total = tasks.length;
        const completed = tasks.filter(t => t.fullyCompleted).length;
        const pending = tasks.filter(t => !t.fullyCompleted);
        const percent = Math.round((completed / total) * 100);
        
        if (pending.length > 0) {
            totalPendingCount += pending.length;
            
            // 3. Create the card inside the grid container
            const card = gridContainer.createEl("div", { cls: "store-card" });
            
            // 4. Safely inject the header and progress bar HTML inside the card
            card.innerHTML = `
                <h3 class="store-header">
                    ${group.key}
                    <span class="store-progress">${completed}/${total} Done</span>
                </h3>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percent}%"></div>
                </div>
            `;
            
            // 5. The Magic Trick: Temporarily tell Dataview that "dv.container" is now this specific card
            dv.container = card;
            
            // 6. Render the interactive checkboxes natively inside the card
            dv.taskList(pending, false); 
        }
    }

    // 7. Restore the original container so Dataview doesn't break
    dv.container = originalContainer;

    // Display empty state if everything is checked off
    if (totalPendingCount === 0) {
        dv.container.createEl("div", { 
            cls: "all-done-msg", 
            innerHTML: "🎉 <strong>All done!</strong> Your shopping list is completely empty. Time to go home." 
        });
    }
}
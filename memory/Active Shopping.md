```dataviewjs
// 1. Fetch the SINGLE page
const page = dv.page("Shopping Tracker"); 

if (!page) {
    dv.paragraph("⚠️ **Error:** Could not find the file. Please check the exact file name in the dv.page() query.");
} else {
    // 2. Extract and filter tasks
    const allTasks = page.file.tasks;
    const pendingTasks = allTasks.filter(t => !t.fullyCompleted);
    const groupedTasks = pendingTasks.groupBy(t => t.section.subpath || "Uncategorized");

    // 3. Inject CSS silently using native HTML elements instead of paragraph text
    dv.el("style", `
    .shopping-dashboard {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
    }
    .store-card {
        border: 1px solid var(--background-modifier-border);
        border-radius: 12px;
        padding: 1.2rem;
        background: var(--background-secondary);
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .store-header {
        font-size: 1.25em;
        font-weight: 700;
        color: var(--text-accent);
        border-bottom: 2px solid var(--background-modifier-border);
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        margin-top: 0;
    }
    `);

    // 4. Render the HTML grid
    dv.paragraph('<div class="shopping-dashboard">');

    for (let group of groupedTasks) {
        dv.paragraph(`<div class="store-card">
            <h3 class="store-header">${group.key}</h3>
        `);
        dv.taskList(group.rows, false); 
        dv.paragraph(`</div>`);
    }

    dv.paragraph('</div>');
}
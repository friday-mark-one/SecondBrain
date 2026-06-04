```dataviewjs
// 1. Fetch the tasks from your main list
const pages = dv.pages('"Shopping Tracker"'); 
const allTasks = pages.file.tasks;

// 2. Filter out completed tasks to keep the mobile view clean
const pendingTasks = allTasks.filter(t => !t.fullyCompleted);

// 3. Group tasks by their Markdown heading (section)
const groupedTasks = pendingTasks.groupBy(t => t.section.subpath || "Uncategorized");

// 4. Inject custom CSS for a beautiful, app-like grid interface
const css = `
<style>
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
</style>
`;
dv.paragraph(css);

// 5. Render the HTML and interactive task lists
dv.paragraph('<div class="shopping-dashboard">');

for (let group of groupedTasks) {
    // Open the card container
    dv.paragraph(`<div class="store-card">
        <h3 class="store-header">${group.key}</h3>
    `);
    
    // Render the interactive checkboxes natively so Obsidian tracks taps
    dv.taskList(group.rows, false); 
    
    // Close the card container
    dv.paragraph(`</div>`);
}

dv.paragraph('</div>');
```dataviewjs
const page = dv.page("Shopping Tracker");

if (!page) {
    dv.paragraph("⚠️ Shopping Tracker file not found.");
} else {
    // 1. Grab all tasks from the file
    const allTasks = page.file.tasks;

    // 2. Filter out anything that is checked [x]
    const pendingTasks = allTasks.filter(t => !t.fullyCompleted);

    // 3. Group tasks, but strip " Staples" from the heading name so they merge!
    const groupedTasks = pendingTasks.groupBy(t => {
        let heading = t.section.subpath || "Uncategorized";
        return heading.replace(" Staples", "").replace(" staples", "");
    });

    // 4. Render the unified, active-only list
    for (let group of groupedTasks) {
        dv.header(3, group.key);
        dv.taskList(group.rows, false);
    }
}
```
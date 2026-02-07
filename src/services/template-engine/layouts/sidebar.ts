
// Config for section distribution
const SIDEBAR_LAYOUT = {
    left: ["contacts", "links", "skills", "languages"],
    right: ["about", "experience", "projects", "education"],
} as const;

/**
 * Renders HTML for a specific column based on keys.
 */
function renderColumn(keys: readonly string[], renderedSections: Record<string, string>): string {
    return keys
        .map(key => renderedSections[key] || "")
        .filter(html => html.trim().length > 0)
        .join("\n");
}

/**
 * Main Sidebar Layout Renderer.
 * Accepts a map of pre-rendered HTML sections.
 */
export function renderSidebarLayout(renderedSections: Record<string, string>): string {
    const leftContent = renderColumn(SIDEBAR_LAYOUT.left, renderedSections);
    const rightContent = renderColumn(SIDEBAR_LAYOUT.right, renderedSections);

    return `
    <div class="container sidebar-layout">
        <aside class="left-column">
            ${leftContent}
        </aside>
        <main class="right-column">
            ${rightContent}
        </main>
    </div>
    `;
}

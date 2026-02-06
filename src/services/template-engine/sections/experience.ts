function escapeHtml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) {
    return "";
  }
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderExperience(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) return "";

  const items = data.map(item => {
    const company = item.company || "";
    const role = item.role || item.title || "";

    // Formatting period: Start - End
    // If start is missing, usually we don't render the period to avoid " - Present" dangling.
    const start = item.startDate ? escapeHtml(item.startDate) : "";
    const end = item.endDate ? escapeHtml(item.endDate) : "Present";
    const period = start ? `${start} – ${end}` : "";
    // ^ logic: only show period if start exists.

    const desc = item.description || "";

    return `
      <div class="item">
        <div class="item-header">
          <div>
            <h3 class="item-title">${escapeHtml(role)}</h3>
            <div class="item-subtitle">${escapeHtml(company)}</div>
          </div>
          <div class="item-meta">${period}</div>
        </div>
        ${desc ? `<p class="item-description">${escapeHtml(desc)}</p>` : ""}
      </div>
    `;
  }).join("");

  return `
    <section class="section experience-section">
      <h2 class="section-title">Experience</h2>
      ${items}
    </section>
  `;
}

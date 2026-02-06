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

export function renderEducation(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) return "";

  const items = data.map(item => {
    const school = item.school || item.institution || "";
    const degree = item.degree || "";

    const start = item.startDate ? escapeHtml(item.startDate) : "";
    const end = item.endDate ? escapeHtml(item.endDate) : "Present";
    const period = start ? `${start} – ${end}` : "";

    const desc = item.description || "";

    return `
      <div class="item">
        <div class="item-header">
          <div>
            <h3 class="item-title">${escapeHtml(school)}</h3>
            <div class="item-subtitle">${escapeHtml(degree)}</div>
          </div>
          <div class="item-meta">${period}</div>
        </div>
        ${desc ? `<p class="item-description">${escapeHtml(desc)}</p>` : ""}
      </div>
    `;
  }).join("");

  return `
    <section class="section education-section">
      <h2 class="section-title">Education</h2>
      ${items}
    </section>
  `;
}

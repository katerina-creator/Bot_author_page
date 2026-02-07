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

export function renderLinks(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) return "";

    const items = data.map(item => {
        const label = item.label || item.url || "";
        const url = item.url || "#";
        const type = item.type ? ` <span class="muted">(${escapeHtml(item.type)})</span>` : "";

        return `
      <li class="link-item">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>${type}
      </li>
    `;
    }).join("");

    return `
    <section class="section links-section">
      <h2 class="section-title">Portfolio & Links</h2>
      <ul class="links-list">
        ${items}
      </ul>
    </section>
  `;
}

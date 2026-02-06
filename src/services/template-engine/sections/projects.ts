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

function isValidUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();

  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

export function renderProjects(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) return "";

  const items = data.map(item => {
    const name = item.name || item.title || "";
    const desc = item.description || "";
    const rawLink = item.link || item.url || "";

    // Header: Name + (optional) Link
    // Strictly whitelisted URLs only (http/https). 
    // Fallback to text-only if URL is invalid or javascript:/data:.
    let headerTitle = escapeHtml(name);
    if (rawLink && isValidUrl(rawLink)) {
      headerTitle = `<a href="${escapeHtml(rawLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`;
    }

    return `
      <div class="item">
        <div class="item-header">
          <h3 class="item-title">${headerTitle}</h3>
        </div>
        ${desc ? `<p class="item-description">${escapeHtml(desc)}</p>` : ""}
      </div>
    `;
  }).join("");

  return `
    <section class="section projects-section">
      <h2 class="section-title">Projects</h2>
      ${items}
    </section>
  `;
}

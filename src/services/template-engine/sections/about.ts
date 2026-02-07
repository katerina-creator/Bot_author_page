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

export function renderAbout(data: any): string {
  if (!data) return "";

  const fullName = data.fullName || data.name;
  if (!fullName) return "";

  const title = data.title || data.position || "";
  const summary = data.summary || data.bio || data.description || "";

  return `
    <header class="section about-section">
      ${data.photoUrl ? `<img src="${escapeHtml(data.photoUrl)}" class="about-photo" alt="${escapeHtml(fullName)}" />` : ""}
      <h1 class="about-name">${escapeHtml(fullName)}</h1>
      ${title ? `<p class="about-title muted">${escapeHtml(title)}</p>` : ""}
      ${summary ? `<p class="about-summary">${escapeHtml(summary)}</p>` : ""}
    </header>
  `;
}

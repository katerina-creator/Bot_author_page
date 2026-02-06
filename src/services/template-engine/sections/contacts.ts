/**
 * Escapes a string for insertion into HTML, replacing characters
 * that have special meaning for HTML interpreters.
 */
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

    return (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
    );
}

export function renderContacts(data: any): string {
    if (!data) return "";

    const items: string[] = [];

    // Email
    if (data.email) {
        const rawEmail = String(data.email).trim();
        if (rawEmail) {
            items.push(`<a href="mailto:${escapeHtml(rawEmail)}">${escapeHtml(rawEmail)}</a>`);
        }
    }

    // Phone
    if (data.phone) {
        const rawPhone = String(data.phone).trim();
        // Normalize phone for href (optional: remove spaces/formatting for the link)
        // For now, simple trim is safer than aggressive replacement without international context
        if (rawPhone) {
            items.push(`<a href="tel:${escapeHtml(rawPhone)}">${escapeHtml(rawPhone)}</a>`);
        }
    }

    // Location
    if (data.location) {
        items.push(`<span>${escapeHtml(data.location)}</span>`);
    }

    // Custom Links
    if (Array.isArray(data.links)) {
        data.links.forEach((link: any) => {
            if (!link) return;

            const rawUrl = link.url ? String(link.url).trim() : "";
            const label = link.label || rawUrl;

            if (rawUrl && isValidUrl(rawUrl)) {
                items.push(`<a href="${escapeHtml(rawUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
            }
        });
    }

    if (items.length === 0) return "";

    return `
    <section class="section contacts-section">
      <div class="contacts-list">
        ${items.map(item => `<span class="contact-item">${item}</span>`).join('<span class="muted"> • </span>')}
      </div>
    </section>
  `;
}

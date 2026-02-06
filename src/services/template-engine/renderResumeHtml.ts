import {
  renderAbout,
  renderContacts,
  renderSkills,
  renderExperience,
  renderProjects,
  renderEducation
} from "./sections/index.js";

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

// Inline Base CSS as requested.
// Matches content of ./styles/base.css
const BASE_CSS = `
:root {
  --primary-color: #333;
  --secondary-color: #666;
  --border-color: #eee;
  --font-base: system-ui, -apple-system, sans-serif;
}

body {
  font-family: var(--font-base);
  line-height: 1.5;
  color: var(--primary-color);
  margin: 0;
  padding: 0;
  background-color: #fff;
  font-size: 14px;
}

a {
  color: inherit;
  text-decoration: none;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

/* Sections */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 8px;
  margin-bottom: 16px;
  margin-top: 0;
}

/* About Section */
.about-name {
  margin: 0 0 8px 0;
  font-size: 32px;
}

.about-title {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: var(--secondary-color);
}

.about-summary {
  margin: 0;
}

/* Items */
.item {
  margin-bottom: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.item-title {
  font-weight: 700;
  font-size: 15px;
  margin: 0;
}

.item-subtitle {
  font-weight: 600;
  font-size: 14px;
  color: var(--secondary-color);
  margin: 0;
}

.item-meta {
  font-size: 13px;
  color: var(--secondary-color);
  font-style: italic;
}

.item-description {
  margin: 4px 0 0;
  color: var(--primary-color);
  white-space: pre-wrap;
}

/* Skills */
.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #f4f4f4;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

/* Contacts */
.contacts-section {
  margin-top: -16px;
  margin-bottom: 32px;
}

.contacts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: var(--secondary-color);
  margin-top: 8px;
}

.contact-item {
  display: inline-flex;
  align-items: center;
}

/* Utilities */
.muted {
  color: var(--secondary-color);
}
`;

const MINIMAL_CSS = `
/* Minimal Template Overrides */
body.minimal {
    background-color: #fff;
    color: #1a1a1a;
}
body.minimal .section-title {
    /* Classic minimal underline */
    border-bottom: 1px solid var(--primary-color);
    padding-bottom: 6px;
    letter-spacing: normal;
    text-transform: none;
    font-weight: 600;
}
@media print {
    body { font-size: 12px; }
    .container { width: 100%; max-width: none; padding: 0; }
    a { text-decoration: none; color: #000; }
}
`;

export function renderResumeHtml(draftData: any, templateId: string = "minimal"): string {
  const content = draftData?.content || {};
  let lang = "en";
  if (draftData?.lang) {
    const candidate = String(draftData.lang).trim();
    if (/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?$/.test(candidate)) {
      lang = candidate;
    }
  }

  // Render sections
  const aboutHtml = renderAbout(content.about);
  const contactsHtml = renderContacts(content.contacts);
  const skillsHtml = renderSkills(content.skills);
  const experienceHtml = renderExperience(content.experience);
  const projectsHtml = renderProjects(content.projects);
  const educationHtml = renderEducation(content.education);

  // Construct title
  const name = content.about?.fullName || content.about?.name || "Resume";
  const title = escapeHtml(name);

  // Template layout selection
  let bodyContent = "";
  let templateCss = "";
  let bodyClass = "";

  switch (templateId) {
    case "minimal":
    default:
      // Minimal layout (Default)
      templateCss = MINIMAL_CSS;
      bodyClass = "minimal";
      bodyContent = `
  <div class="container">
    ${aboutHtml}
    ${contactsHtml}
    ${skillsHtml}
    ${experienceHtml}
    ${projectsHtml}
    ${educationHtml}
  </div>`;
      break;
  }

  const bodyClassAttr = bodyClass ? ` class="${bodyClass}"` : "";

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${BASE_CSS}
    ${templateCss}
  </style>
</head>
<body${bodyClassAttr}>
${bodyContent}
</body>
</html>`;
}

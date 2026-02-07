import {
  renderAbout,
  renderContacts,
  renderSkills,
  renderExperience,
  renderProjects,
  renderEducation,
  renderLinks
} from "./sections/index.js";
import { loadCss } from "./styles/loadCss.js";
import { renderSidebarLayout } from "./layouts/sidebar.js";

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
  const linksHtml = renderLinks(content.links);
  const skillsHtml = renderSkills(content.skills);
  const experienceHtml = renderExperience(content.experience);
  const projectsHtml = renderProjects(content.projects);
  const educationHtml = renderEducation(content.education);

  // Map for layout engines
  const sections: Record<string, string> = {
    about: aboutHtml,
    contacts: contactsHtml,
    links: linksHtml,
    skills: skillsHtml,
    experience: experienceHtml,
    projects: projectsHtml,
    education: educationHtml,
  };

  // Construct title
  const name = content.about?.fullName || content.about?.name || "Resume";
  const title = escapeHtml(name);

  // Template layout selection
  let bodyContent = "";
  let templateCss = "";
  let bodyClass = "";

  // Load Base CSS
  const baseCss = loadCss("base.css");

  // Standard container layout reused by defaults
  const standardLayout = `
  <div class="container">
    ${aboutHtml}
    ${contactsHtml}
    ${linksHtml}
    ${skillsHtml}
    ${experienceHtml}
    ${projectsHtml}
    ${educationHtml}
  </div>`;

  switch (templateId) {
    case "modern":
      templateCss = loadCss("modern.css");
      bodyClass = "modern";
      bodyContent = standardLayout;
      break;

    case "timeline":
      templateCss = loadCss("timeline.css");
      bodyClass = "timeline";
      bodyContent = standardLayout;
      break;

    case "sidebar":
      templateCss = loadCss("sidebar.css");
      bodyClass = "sidebar";
      bodyContent = renderSidebarLayout(sections);
      break;

    case "minimal":
    default:
      // Minimal layout (Default)
      templateCss = loadCss("minimal.css");
      bodyClass = "minimal";
      bodyContent = standardLayout;
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
    ${baseCss}
    ${templateCss}
  </style>
</head>
<body${bodyClassAttr}>
${bodyContent}
</body>
</html>`;
}

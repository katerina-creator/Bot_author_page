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

export function renderSkills(data: any): string {
  // Support both array of strings and object with items array
  const skillsArray = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);

  if (!skillsArray || skillsArray.length === 0) return "";

  return `
    <section class="section skills-section">
      <h2 class="section-title">Skills</h2>
      <ul class="skills-list">
        ${skillsArray.map((skill: string) => `<li class="skill-tag">${escapeHtml(skill)}</li>`).join("")}
      </ul>
    </section>
  `;
}

/*
  verify-templates.ts (v1.1 FIXED)
  --------------------------------
  Generates HTML for each templateId using ONE v1.1 dataset that includes:
    - about.photoUrl (photo)
    - links section (portfolio links)
    - long URL to validate wrapping

  Usage:
    npx tsx scripts/verify-templates.ts

  Output:
    out/<templateId>/v1_1.html
*/

import { promises as fs } from "node:fs";
import path from "node:path";

type DraftData = any;

const TEMPLATE_IDS = ["minimal", "modern", "timeline", "sidebar"] as const;
const DATASET_FILE = "v1_1.json";

async function loadRenderResumeHtml(): Promise<(draftData: DraftData, templateId?: string) => string> {
  const candidates = [
    "../src/services/template-engine/renderResumeHtml.js",
    "../src/services/template-engine/renderResumeHtml.ts",
  ];

  for (const rel of candidates) {
    try {
      const mod = await import(pathToFileUrl(path.resolve(process.cwd(), "scripts", rel)).href);
      if (typeof (mod as any).renderResumeHtml === "function") {
        return (mod as any).renderResumeHtml;
      }
    } catch {
      // try next
    }
  }

  throw new Error(
    "Cannot import renderResumeHtml. Expected it at src/services/template-engine/renderResumeHtml.(ts|js)"
  );
}

function pathToFileUrl(p: string): URL {
  const url = new URL("file://");
  url.pathname = p.startsWith("/") ? p : `/${p}`;
  return url;
}

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function basicChecks(html: string, templateId: string): void {
  assert(html.toLowerCase().includes("<!doctype html>"), "Missing doctype");
  assert(!html.includes("undefined"), "HTML contains 'undefined'");
  assert(!html.includes("null"), "HTML contains 'null'");

  // body class check
  assert(
    html.includes(`<body class=\"${templateId}\"`) || html.includes(`<body class="${templateId}"`),
    `Missing body class for ${templateId}`
  );

  // v1.1 checks: photo + links
  assert(html.includes("about-photo"), "Expected photo (.about-photo) to be rendered");
  assert(html.includes("links-section"), "Expected links section (.links-section) to be rendered");

  if (templateId === "sidebar") {
    // Extract left column (<aside>) and ensure links are inside it
    const leftAsideMatch = html.match(
      /<aside[^>]*class=["'][^"']*left-column[^"']*["'][^>]*>([\s\S]*?)<\/aside>/i
    );
    assert(leftAsideMatch, "Sidebar <aside class='left-column'> not found");

    const leftAsideHtml = leftAsideMatch![1];
    assert(
      leftAsideHtml.includes("links-section"),
      "Expected links section inside left sidebar column"
    );

    // Ensure links are NOT inside right column
    const rightMainMatch = html.match(
      /<main[^>]*class=["'][^"']*right-column[^"']*["'][^>]*>([\s\S]*?)<\/main>/i
    );
    if (rightMainMatch) {
      const rightMainHtml = rightMainMatch[1];
      assert(
        !rightMainHtml.includes("links-section"),
        "Links section should not appear in right column"
      );
    }
  } else {
    assert(
      html.includes(`class=\"container\"`) || html.includes(`class="container"`),
      "Standard container not found"
    );
  }
}

async function main(): Promise<void> {
  const renderResumeHtml = await loadRenderResumeHtml();

  const dataRoot = path.resolve(process.cwd(), "src/services/template-engine/test-data");
  const outRoot = path.resolve(process.cwd(), "out");
  await fs.mkdir(outRoot, { recursive: true });

  const dataPath = path.join(dataRoot, DATASET_FILE);
  const raw = await fs.readFile(dataPath, "utf8");
  const draftData = JSON.parse(raw);

  for (const templateId of TEMPLATE_IDS) {
    const html = renderResumeHtml(draftData, templateId);
    basicChecks(html, templateId);

    const dir = path.join(outRoot, templateId);
    await fs.mkdir(dir, { recursive: true });

    const outPath = path.join(dir, "v1_1.html");
    await fs.writeFile(outPath, html, "utf8");
  }

  console.log(`OK: generated ${TEMPLATE_IDS.length} HTML files in ./out/<templateId>/v1_1.html`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

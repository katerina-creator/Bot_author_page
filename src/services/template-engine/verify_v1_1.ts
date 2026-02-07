
import { renderResumeHtml } from './renderResumeHtml.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockData = {
    lang: 'en',
    content: {
        about: {
            fullName: "Test User",
            title: "V1.1 Specialist",
            photoUrl: "https://example.com/photo.jpg"
        },
        links: [
            { label: "GitHub", url: "https://github.com", type: "Code" },
            { label: "Portfolio", url: "https://myportfolio.com" }
        ],
        contacts: {
            email: "test@example.com",
            phone: "+1234567890"
        },
        skills: ["TypeScript", "CSS"],
        experience: [],
        education: []
    }
};

try {
    const html = renderResumeHtml(mockData, 'sidebar');

    // Manual assertions
    if (!html.includes('<img src="https://example.com/photo.jpg" class="about-photo"')) {
        throw new Error("Photo not rendered correctly");
    }

    if (!html.includes('<section class="section links-section">')) {
        throw new Error("Links section not rendered");
    }

    if (!html.includes('<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>')) {
        throw new Error("Link item not rendered correctly");
    }

    if (html.includes('undefined') || html.includes('null')) {
        throw new Error("HTML contains undefined or null");
    }

    // Check sidebar specific order: links should be in left column
    // This is hard to check with string includes without parsing, but we can check if linksHtml is likely in the left block.
    // For now, basic presence is good.

    console.log("Verification Passed: Photo and Links rendered correctly.");

    // Clean up if needed, or save for manual inspection
    // const outputPath = path.resolve(__dirname, 'v1_1_preview.html');
    // fs.writeFileSync(outputPath, html);
    // console.log(`Saved preview to: ${outputPath}`);

} catch (error) {
    console.error("Verification Failed:", error);
    process.exit(1);
}

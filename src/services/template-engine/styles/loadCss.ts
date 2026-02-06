import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadCss(fileName: string): string {
    // Styles are located in the same directory as this module
    const cssPath = path.join(__dirname, fileName);
    if (!fs.existsSync(cssPath)) {
        throw new Error(`CSS file not found: ${cssPath}`);
    }
    return fs.readFileSync(cssPath, 'utf-8');
}

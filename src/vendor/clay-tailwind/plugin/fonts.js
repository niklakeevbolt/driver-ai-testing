/**
 * Clay Design Token Fonts Plugin (TW4)
 *
 * Adapted from kalep-tailwind's bolteu-design-token-fonts.js.
 * Reads token-css/fonts.css, renames .font-* selectors to .bolt-font-*,
 * and registers them as Tailwind utilities. Also sets base HTML font styles.
 */

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import plugin from "tailwindcss/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse fonts.css into CSS-in-JS objects.
 * The file has a simple, machine-generated format:
 *   .font-name { prop: value; prop: value; }
 */
function parseFontRules(css) {
    const rules = {};
    const ruleRegex = /\.(font-[\w-]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
        const selector = `.bolt-${match[1]}`;
        const body = match[2];
        const props = {};
        const declRegex = /([\w-]+)\s*:\s*([^;]+);/g;
        let declMatch;

        while ((declMatch = declRegex.exec(body)) !== null) {
            props[declMatch[1].trim()] = declMatch[2].trim();
        }

        rules[selector] = props;
    }

    return rules;
}

const fontsCSS = fs.readFileSync(path.resolve(__dirname, "../token-css/fonts.css"), "utf-8");
const fontUtilities = parseFontRules(fontsCSS);

const fontBaseStyles = {
    "font-family": "var(--font-sans)",
    "font-feature-settings": '"cv03", "cv04"',
    "font-weight": "450",
    "letter-spacing": "-0.011em",
    "-webkit-font-smoothing": "antialiased",
};

// Export utility maps and base styles for use by scripts/generate-full.js
export {fontBaseStyles, fontUtilities};

export default plugin(function ({addBase, addUtilities}) {
    // Base HTML font styles (matching kalep-tailwind's font plugin).
    // Uses var(--font-sans) to stay in sync with the @theme block's full fallback stack,
    // rather than hardcoding the font family. This ensures proper fallbacks before the
    // webfont loads (ui-sans-serif, Helvetica Neue, Arial, emoji fonts, etc.).
    addBase({html: fontBaseStyles});

    addUtilities(fontUtilities);
});

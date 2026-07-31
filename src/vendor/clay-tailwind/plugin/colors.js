/**
 * Clay Design Token Colors Plugin (TW4)
 *
 * Adapted from kalep-tailwind's bolteu-design-token-colors.js.
 * Parses token CSS files to discover --color-* variables and generates
 * semantic Tailwind utilities (text-*, bg-*, border-*, placeholder-*, caret-*).
 *
 * Token CSS variables are already loaded via @import in index.css, so this
 * plugin only needs to register utility classes — no addBase() needed.
 */

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import plugin from "tailwindcss/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extract all --color-* variable names from a CSS file using regex.
 * The token CSS files have a predictable, machine-generated format.
 */
function extractColorVarNames(filePath) {
    const css = fs.readFileSync(filePath, "utf-8");
    return [...css.matchAll(/^\s*(--color[\w-]+)\s*:/gm)].map((m) => m[1]);
}

/**
 * Categorize a --color-* variable into utility types using the same regex
 * as kalep-tailwind's bolteu-design-token-colors plugin.
 *
 * Returns { group: "bg"|"border"|"content"|"layer"|null, name: string } or null if no match.
 */
function categorizeColorVar(varName) {
    const match = varName.match(/^--color(?:-(special|static|boltplus|map-.+?))?(?:-(bg|border|content|layer))?-(.+)$/);
    if (!match) return null;

    const [, prefix, group, baseName] = match;
    const name = prefix ? `${prefix}-${baseName}` : baseName;

    return {group, name};
}

// Parse token CSS files.
// Base files provide the core semantic tokens.
const tokenDir = path.resolve(__dirname, "../token-css");
const lightVars = extractColorVarNames(path.join(tokenDir, "colors-light.css"));
const mapLightVars = extractColorVarNames(path.join(tokenDir, "colors-map-light.css"));

// Also scan theme-specific files for tokens that only exist in certain themes
// (e.g. driver's --color-content-action-secondary-alternative, --color-static-bg-promo-high-contrast).
// This auto-discovers new tokens when themes are added or updated — no manual registration needed.
const themeVars = fs
    .readdirSync(tokenDir)
    .filter((f) => /^colors-.*-theme-.*\.css$/.test(f))
    .flatMap((f) => extractColorVarNames(path.join(tokenDir, f)));

const allVars = [...lightVars, ...mapLightVars, ...themeVars];

// Build utility maps
const textColors = {};
const bgColors = {};
const borderColors = {};

for (const varName of allVars) {
    const result = categorizeColorVar(varName);
    if (!result) continue;

    const {group, name} = result;
    const value = `var(${varName})`;

    switch (group) {
        case "content":
            textColors[name] = value;
            break;
        case "bg":
            bgColors[name] = value;
            break;
        case "layer":
            bgColors[`layer-${name}`] = value;
            break;
        case "border":
            borderColors[name] = value;
            break;
        // group === null: special-brand, special-scrim, etc. — handled manually below
    }
}

// Manual additions matching kalep-tailwind's plugin (lines 62-75)
bgColors["special-scrim"] = "var(--color-special-scrim)";
bgColors["special-nulled"] = "var(--color-special-nulled)";
borderColors["special-nulled"] = "var(--color-special-nulled)";

for (const token of ["special-brand", "special-brand-alt"]) {
    const value = `var(--color-${token})`;
    textColors[token] = value;
    bgColors[token] = value;
    borderColors[token] = value;
}

// Note: inherit and transparent are NOT added here — TW4 provides built-in
// text-inherit, text-transparent, bg-inherit, bg-transparent, border-inherit,
// border-transparent utilities natively.

// Export utility maps for use by scripts/generate-full.js
export {bgColors, borderColors, textColors};

export default plugin(function ({addUtilities}) {
    const utilities = {};

    // text-* utilities
    for (const [name, value] of Object.entries(textColors)) {
        utilities[`.text-${name}`] = {color: value};
    }

    // bg-* utilities
    for (const [name, value] of Object.entries(bgColors)) {
        utilities[`.bg-${name}`] = {"background-color": value};
    }

    // border-* utilities (all sides + side-specific variants)
    for (const [name, value] of Object.entries(borderColors)) {
        utilities[`.border-${name}`] = {"border-color": value};
        utilities[`.border-t-${name}`] = {"border-top-color": value};
        utilities[`.border-r-${name}`] = {"border-right-color": value};
        utilities[`.border-b-${name}`] = {"border-bottom-color": value};
        utilities[`.border-l-${name}`] = {"border-left-color": value};
        utilities[`.border-s-${name}`] = {"border-inline-start-color": value};
        utilities[`.border-e-${name}`] = {"border-inline-end-color": value};
        utilities[`.border-x-${name}`] = {"border-inline-color": value};
        utilities[`.border-y-${name}`] = {"border-block-color": value};
    }

    // placeholder-* utilities (mirrors text colors, excluding inherit/transparent)
    for (const [name, value] of Object.entries(textColors)) {
        if (name === "inherit" || name === "transparent") continue;
        utilities[`.placeholder-${name}`] = {"&::placeholder": {color: value}};
    }

    // caret-* utilities (mirrors text colors, excluding inherit/transparent)
    for (const [name, value] of Object.entries(textColors)) {
        if (name === "inherit" || name === "transparent") continue;
        utilities[`.caret-${name}`] = {"caret-color": value};
    }

    addUtilities(utilities);
});

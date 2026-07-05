#!/usr/bin/env node
/**
 * check-imports.mjs
 * Scans every JS/JSX file under src/ and tests/ and reports any relative
 * import whose path casing doesn't match the real file on disk.
 * Run: node check-imports.mjs
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SCAN_DIRS = ['src', 'tests'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
const IMPORT_RE = /(?:import|from|require)\s*\(?['"](\.[^'"]+)['"]\)?/g;

function allFiles(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});
    return entries.flatMap(e => {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) return allFiles(full);
        if (EXTENSIONS.includes(path.extname(e.name))) return [full];
        return [];
    });
}

function resolveWithExtensions(base) {
    const tries = [base, ...EXTENSIONS.map(ext => base + ext)];
    for (const t of tries) if (fs.existsSync(t)) return t;
    return null;
}

let errors = 0;

for (const dir of SCAN_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;

    for (const file of allFiles(absDir)) {
        const src = fs.readFileSync(file, 'utf8');
        let m;
        IMPORT_RE.lastIndex = 0;
        while ((m = IMPORT_RE.exec(src)) !== null) {
            const raw = m[1];
            const candidate = resolveWithExtensions(path.resolve(path.dirname(file), raw));
            if (!candidate) continue; // unresolved — skip (maybe node_modules alias)
            try {
                const real = fs.realpathSync.native(candidate);
                if (real !== candidate) {
                    console.error(`CASE MISMATCH in ${path.relative(ROOT, file)}`);
                    console.error(`  import: ${raw}`);
                    console.error(`  resolved: ${path.relative(ROOT, candidate)}`);
                    console.error(`  on disk:  ${path.relative(ROOT, real)}\n`);
                    errors++;
                }
            } catch { /* skip */
            }
        }
    }
}

if (errors === 0) {
    console.log('✓ No case-sensitivity issues found.');
} else {
    console.error(`\n${errors} case-sensitivity issue(s) found.`);
    process.exit(1);
}

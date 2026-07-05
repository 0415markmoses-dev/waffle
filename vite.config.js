import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/**
 * Enforces case-sensitive import paths.
 * On macOS (case-insensitive but case-preserving FS), fs.realpathSync.native
 * returns the real on-disk casing — so a wrong-case import is caught locally,
 * not just in Linux CI.
 */
function caseSensitivePaths() {
  return {
    name: 'case-sensitive-paths',
    enforce: 'pre',
    resolveId(id, importer) {
      if (!importer || !id.startsWith('.')) return null;

      const candidates = [
        path.resolve(path.dirname(importer), id),
        path.resolve(path.dirname(importer), id + '.js'),
        path.resolve(path.dirname(importer), id + '.jsx'),
        path.resolve(path.dirname(importer), id + '.ts'),
        path.resolve(path.dirname(importer), id + '.tsx'),
      ];

      for (const candidate of candidates) {
        if (!fs.existsSync(candidate)) continue;
        try {
          const real = fs.realpathSync.native(candidate);
          if (real !== candidate) {
            this.error(
                `Case-sensitive path mismatch:\n  imported: ${candidate}\n  on disk:  ${real}\n  Fix the import casing in ${importer}`
            );
          }
        } catch {
          // file exists but realpathSync failed — skip
        }
        break;
      }

      return null; // let Vite resolve normally
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), caseSensitivePaths()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
})

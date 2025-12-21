/* Auditoría de endpoints (v2) con resolución de basePath desde src/app.ts */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const APP_TS = path.join(SRC, 'app.ts');
const ROUTES_DIR = path.join(SRC, 'routes');
const OUT_JSON = path.join(ROOT, 'docs', '02_frontend', 'ENDPOINTS_AUDIT_REPORT.json');

function read(p: string) { return fs.readFileSync(p, 'utf8'); }
function exists(p: string) { try { fs.accessSync(p); return true; } catch { return false; } }

function extractMappings(appCode: string) {
  const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/routes\/(.+?)['"];?/g;
  const importMap: Record<string,string> = {};
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(appCode))) importMap[m[1]] = m[2];
  const useRegex = /app\.use\(\s*['"](.*?)['"]\s*,\s*(\w+)\s*\)/g;
  const baseMap: Record<string,string> = {};
  while ((m = useRegex.exec(appCode))) baseMap[m[2]] = m[1];
  const out: Array<{basePath:string;file:string;varName:string}> = [];
  for (const [varName, basePath] of Object.entries(baseMap)) {
    const rel = importMap[varName];
    if (!rel) continue;
    const file = path.join(ROUTES_DIR, rel.endsWith('.ts') ? rel : `${rel}.ts`);
    if (!exists(file)) continue;
    out.push({ basePath, file, varName });
  }
  return out;
}

function extractRoutes(filePath: string) {
  const code = read(filePath);
  const re = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"\)]*)/g;
  const out: Array<{method:string;subpath:string}> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) out.push({ method: m[1].toUpperCase(), subpath: m[2] || '/' });
  return out;
}

function joinPath(a: string, b: string) {
  return (a.replace(/\/$/, '') + '/' + b.replace(/^\//, '')).replace(/\/+/, '/');
}

function main() {
  if (!exists(APP_TS)) { console.error('Falta src/app.ts'); process.exit(1); }
  const mappings = extractMappings(read(APP_TS));
  const endpoints: Array<{method:string;path:string;file:string}> = [];
  for (const map of mappings) {
    for (const r of extractRoutes(map.file)) {
      endpoints.push({ method: r.method, path: joinPath(map.basePath, r.subpath), file: path.relative(ROOT, map.file) });
    }
  }
  const payload = { summary: { totalRouters: mappings.length, totalEndpoints: endpoints.length, generatedAt: new Date().toISOString() }, endpoints };
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  console.log('OK:', path.relative(ROOT, OUT_JSON));
}

main();

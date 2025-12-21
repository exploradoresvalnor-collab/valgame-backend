import fs from 'fs';
import path from 'path';

const ROUTES_DIR = path.resolve(__dirname, '..', 'src', 'routes');
const APP_FILE = path.resolve(__dirname, '..', 'src', 'app.ts');
const CATALOG = path.resolve(__dirname, '..', 'docs', '02_frontend', 'ENDPOINTS_CATALOG.md');

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (st.isFile() && /\.(ts|js)$/.test(e)) acc.push(p);
  }
  return acc;
}

function extractCodeEndpoints(): Set<string> {
  const files = walk(ROUTES_DIR);
  const set = new Set<string>();
  const routeRe = /router\.(get|post|put|patch|delete)\s*\(\s*[`'\"]([^`'\"]+)/gi;
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = routeRe.exec(text))) {
      const method = m[1].toUpperCase();
      const p = m[2].trim();
      if (!p) continue;
      set.add(`${method} ${p}`);
    }
  }
  return set;
}

function extractCatalogEndpoints(): Set<string> {
  const set = new Set<string>();
  if (!fs.existsSync(CATALOG)) return set;
  const text = fs.readFileSync(CATALOG, 'utf8');
  // Formato en catálogo: "- POST `/path` (auth)"
  const lineRe = /^-\s*(GET|POST|PUT|PATCH|DELETE)\s+`(\/[\w\-:][^`]*)`/gmi;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(text))) {
    const method = m[1].toUpperCase();
    const p = m[2].trim();
    set.add(`${method} ${p}`);
  }
  return set;
}

function normalizePath(p: string): string {
  // Quitar prefijo /api si existe para comparar a nivel de subruta
  return p.replace(/^([A-Z]+)\s+\/api\//i, (_s, meth) => `${meth.toUpperCase()} /`)
          .replace(/\/$/, '');
}

function main() {
  const code = extractCodeEndpoints();
  const catalog = extractCatalogEndpoints();

  // Normalizar sin prefijo /api y sin trailing slash
  const normCode = new Set<string>(Array.from(code).map(normalizePath));
  const normCatalog = new Set<string>(Array.from(catalog).map(normalizePath));

  const missingInDocs: string[] = [];
  for (const e of normCode) if (!normCatalog.has(e)) missingInDocs.push(e);

  const missingInCode: string[] = [];
  for (const e of normCatalog) if (!normCode.has(e)) missingInCode.push(e);

  const report = {
    summary: {
      codeEndpoints: code.size,
      catalogEndpoints: catalog.size,
      missingInDocs: missingInDocs.length,
      missingInCode: missingInCode.length,
    },
    missingInDocs: missingInDocs.sort(),
    missingInCode: missingInCode.sort(),
    notes: [
      'Comparación ignora el prefijo /api y el slash final.',
      'Los montajes (app.use) no se resuelven; si hay subrutas sin prefijo, valide manualmente el basePath.',
    ],
  };

  const outPath = path.resolve(__dirname, '..', 'docs', '02_frontend', 'ENDPOINTS_AUDIT_REPORT.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('OK ->', outPath);
}

main();

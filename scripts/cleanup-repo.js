#!/usr/bin/env node
/* Limpieza de archivos sueltos (MD/TXT) en raíz del repo.
   - Dry-run por defecto. Usar --apply para mover.
   - Clasifica VERIFICACION_*, RESUMEN_*, MAPA_*, QUICK_* y TESTS_STATUS.txt
     a docs/reportes/ o docs/99_archive/.
*/

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const REPORTES = path.join(DOCS, 'reportes');
const ARCHIVE = path.join(DOCS, '99_archive');

const APPLY = process.argv.includes('--apply');

const KEEP_BASENAMES = new Set([
  'README.md',
  'DOCUMENTACION_FRONTEND.md',
  'INDEX.md',
]);

function classify(file) {
  const base = path.basename(file);
  const lower = base.toLowerCase();
  if (KEEP_BASENAMES.has(base)) return null;

  // enviar a reportes
  if (/^(verificacion|verificación|resumen|tests_status)/i.test(lower) || lower.endsWith('.txt')) {
    return { targetDir: REPORTES, reason: 'reportes' };
  }
  // mapas/quick a archivo
  if (/^(mapa|quick_)/i.test(lower)) {
    return { targetDir: ARCHIVE, reason: 'archive' };
  }
  // otros .md sueltos no críticos
  if (lower.endsWith('.md')) {
    return { targetDir: ARCHIVE, reason: 'archive-md' };
  }
  return null;
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function main() {
  const entries = await fsp.readdir(ROOT, { withFileTypes: true });
  const candidates = entries
    .filter(e => e.isFile())
    .map(e => path.join(ROOT, e.name))
    .filter(p => /\.(md|txt)$/i.test(p));

  const plan = [];
  for (const file of candidates) {
    const c = classify(file);
    if (!c) continue;
    const target = path.join(c.targetDir, path.basename(file));
    plan.push({ from: file, to: target, reason: c.reason });
  }

  const reportPath = path.join(ARCHIVE, 'cleanup-report.json');
  if (!APPLY) {
    console.log('[DRY-RUN] Archivos a mover:', plan.length);
    console.log(plan.map(x => ({ from: path.relative(ROOT, x.from), to: path.relative(ROOT, x.to), reason: x.reason })));
    await ensureDir(ARCHIVE);
    await fsp.writeFile(reportPath, JSON.stringify({ apply: false, when: new Date().toISOString(), plan: plan.map(x => ({ from: path.relative(ROOT, x.from), to: path.relative(ROOT, x.to), reason: x.reason })) }, null, 2));
    console.log('Reporte escrito en', path.relative(ROOT, reportPath));
    return;
  }

  // apply
  await ensureDir(REPORTES);
  await ensureDir(ARCHIVE);
  for (const step of plan) {
    await ensureDir(path.dirname(step.to));
    await fsp.rename(step.from, step.to).catch(async (err) => {
      if (err && err.code === 'EXDEV') {
        // fallback copy+unlink para cross-device
        await fsp.copyFile(step.from, step.to);
        await fsp.unlink(step.from);
      } else {
        throw err;
      }
    });
    console.log('Movido:', path.relative(ROOT, step.from), '→', path.relative(ROOT, step.to));
  }
  await fsp.writeFile(reportPath, JSON.stringify({ apply: true, when: new Date().toISOString(), moved: plan.map(x => ({ from: path.relative(ROOT, x.from), to: path.relative(ROOT, x.to), reason: x.reason })) }, null, 2));
  console.log('Reporte escrito en', path.relative(ROOT, reportPath));
}

main().catch(err => {
  console.error('Error en limpieza:', err);
  process.exit(1);
});

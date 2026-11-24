import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('extension');
const prohibited = [
  /https?:\/\//i,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /WebSocket/,
  /navigator\.sendBeacon/,
  /chrome\.identity/,
  /analytics/i,
  /telemetry/i,
];
const allowedUrlFiles = new Set(['manifest.json']);
const files = fs.readdirSync(root).filter((name) => /\.(?:js|html|css|json)$/.test(name));
const findings = [];
for (const name of files) {
  const text = fs.readFileSync(path.join(root, name), 'utf8');
  for (const rule of prohibited) {
    if (allowedUrlFiles.has(name) && rule.source.includes('https')) continue;
    if (rule.test(text)) findings.push(`${name}: matched ${rule}`);
  }
}
if (findings.length) {
  console.error('Local-only verification failed:\n' + findings.join('\n'));
  process.exit(1);
}
console.log(`Local-only static scan passed for ${files.length} extension files.`);

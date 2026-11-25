import fs from 'node:fs';
import path from 'node:path';

const extension = path.resolve('extension');
const sources = ['capture.js', 'dialog.js', 'clipboard.js', 'content.js'];
const output = sources.map((name) => {
  let text = fs.readFileSync(path.join(extension, name), 'utf8');
  text = text.replace(/^import\s+[^;]+;\s*\n/gm, '');
  return `// Source: ${name}\n${text.replace(/^export\s+/gm, '')}`;
}).join('\n\n');

if (/^\s*(?:import|export)\s/m.test(output)) throw new Error('Content bundle still contains module syntax.');
fs.writeFileSync(path.join(extension, 'content-script.js'), `${output}\n`);
console.log('Built extension/content-script.js');

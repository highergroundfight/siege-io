// 把 src/ 下的模板、样式、脚本内联成单文件 index.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, 'src', p), 'utf8');

const html = read('template.html')
  .replace('/*__STYLE__*/', () => read('style.css'))
  .replace('/*__ENGINE__*/', () => read('engine.js'))
  .replace('/*__UI__*/', () => read('ui.js'));

writeFileSync(join(root, 'index.html'), html, 'utf8');
console.log('built index.html —', (html.length / 1024).toFixed(1), 'KB');

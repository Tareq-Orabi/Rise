import { build } from 'esbuild';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

async function browserLibrariesNotices() {
  const names = ['react', 'react-dom', 'scheduler'];
  const licenses = [];
  for (const name of names) {
    const directory = path.join(projectRoot, 'node_modules', name);
    const { version } = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
    const license = await readFile(path.join(directory, 'LICENSE'), 'utf8');
    licenses.push([name + ' ' + version, license.trim()].join('\n'));
  }
  licenses.push(await readFile(path.join(projectRoot, 'licenses', 'Cairo-OFL.txt'), 'utf8'));
  return licenses.join('\n\n');
}

export async function buildStandalone() {
  const result = await build({
    absWorkingDir: projectRoot,
    entryPoints: ['src/main.jsx'],
    outfile: 'dist/app.js',
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    target: ['es2020'],
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
    charset: 'utf8',
    legalComments: 'inline',
    loader: {
      '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.webp': 'dataurl',
      '.svg': 'dataurl', '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl'
    }
  });
  const js = result.outputFiles.find(file => file.path.endsWith('.js'));
  if (!js?.text) throw new Error('esbuild returned no application script');
  const css = result.outputFiles.find(file => file.path.endsWith('.css'))?.text || '';
  const template = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
  const notices = await browserLibrariesNotices();
  const html = template
    .replace('<!-- THIRD_PARTY_LICENSES -->', () => '<!--\n' + notices.replaceAll('-->', '--&gt;') + '\n-->')
    .replace('<!-- STYLES -->', () => '<style>\n' + css.replace(/<\/style/gi, '<\\/style') + '\n</style>')
    .replace('<!-- APPLICATION -->', () => '<script>\n' + js.text.replace(/<\/script/gi, '<\\/script') + '\n</script>');
  const outputDir = path.join(projectRoot, 'dist');
  await mkdir(outputDir, { recursive: true });
  const destination = path.join(outputDir, 'index.html');
  const temp = path.join(outputDir, 'index.' + process.pid + '.tmp');
  await writeFile(temp, html, 'utf8');
  await rename(temp, destination);
  console.log('Built dist/index.html (' + (Buffer.byteLength(html) / 1048576).toFixed(2) + ' MiB).');
  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await buildStandalone();
}

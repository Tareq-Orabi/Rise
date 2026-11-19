import { createServer } from 'node:http';
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildStandalone, projectRoot } from './build.mjs';

const destination = await buildStandalone();
const port = Number(process.env.PORT || 4173);
const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url || '/', 'http://localhost');
  if (pathname !== '/' && pathname !== '/index.html') {
    res.writeHead(404).end();
    return;
  }
  try {
    const html = await readFile(destination);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(html);
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Could not open dist/index.html');
  }
});
server.listen(port, '127.0.0.1', () => console.log('Open http://127.0.0.1:' + port));

if (process.argv.includes('--watch')) {
  let timer;
  let building = false;
  let dirty = false;
  const rebuild = async () => {
    if (building) {
      dirty = true;
      return;
    }
    building = true;
    try {
      do {
        dirty = false;
        await buildStandalone();
      } while (dirty);
    } catch (error) {
      console.error(error.message);
    } finally {
      building = false;
    }
  };
  const queue = () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 120);
  };
  const sourceWatcher = watch(path.join(projectRoot, 'src'), { recursive: true }, queue);
  const templateWatcher = watch(path.join(projectRoot, 'index.html'), queue);
  server.on('close', () => { sourceWatcher.close(); templateWatcher.close(); });
  console.log('Watching src and index.html. Refresh the browser after a change.');
}

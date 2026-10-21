import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production'
) {
  const resolve = (p) => path.resolve(root, p);
  const app = express();

  // Enable HTTP gzip compression
  app.use(compression());

  let vite;
  if (!isProd) {
    // In development mode, spin up Vite as middleware with HMR
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static assets
    // (NGINX will intercept /assets first, but Node fallback keeps it self-contained)
    app.use(
      '/assets',
      express.static(resolve('dist/client/assets'), {
        immutable: true,
        maxAge: '1y',
      })
    );
    app.use(
      express.static(resolve('dist/client'), {
        index: false,
      })
    );
  }

  // Handle all other incoming GET requests with SSR (Express 5 compatible)
  app.use(async (req, res, next) => {
    // Only handle GET requests for HTML pages
    if (req.method !== 'GET') {
      return next();
    }
    const url = req.originalUrl;

    try {
      let template;
      let render;

      if (!isProd) {
        // Dev: read raw index.html and transform via Vite
        template = fs.readFileSync(resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // Prod: read built client HTML template and import built SSR bundle
        template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
        render = (await import('./dist/server/entry-server.js')).render;
      }

      const { html: appHtml } = render(url);
      const html = template.replace('<!--app-html-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('SSR Render Error:', e);

      // Resilient Fallback: If SSR fails, serve unrendered index.html for client-side recovery
      if (isProd) {
        try {
          const fallback = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
          res.status(200).set({ 'Content-Type': 'text/html' }).end(fallback);
          return;
        } catch {
          // pass to next error handler
        }
      }
      next(e);
    }
  });

  return { app, vite };
}

if (!isTest) {
  const port = process.env.PORT || 3000;
  createServer().then(({ app }) => {
    app.listen(port, () => {
      console.log(`> SMYS Food Count SSR Server running at http://localhost:${port}`);
    });
  });
}

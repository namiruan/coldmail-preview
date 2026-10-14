import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

function saveTemplatesPlugin() {
  return {
    name: 'save-templates',
    configureServer(server: any) {
      server.middlewares.use('/api/save-templates', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { content } = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'src/app/data/defaultTemplates.ts');
            fs.writeFileSync(filePath, content, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });
    },
  };
}


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  // GitHub Pages는 /<repo>/ 하위 경로로 서빙된다. CI에서 VITE_BASE를 넘기고,
  // 로컬 dev·preview는 루트('/')를 그대로 쓴다.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    saveTemplatesPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
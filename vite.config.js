import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Multi-page site: each page is its own index.html so URLs stay clean
// (/portfolio/, /approach/, /resume/, /contact/).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: page('./index.html'),
        portfolio: page('./portfolio/index.html'),
        approach: page('./approach/index.html'),
        resume: page('./resume/index.html'),
        contact: page('./contact/index.html'),
      },
    },
  },
});

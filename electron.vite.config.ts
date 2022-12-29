import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import * as path from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    // plugins: [externalizeDepsPlugin()]
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/preload/index.ts'),
          history: path.resolve(__dirname, 'src/preload/history.ts')
        }
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'src/renderer/index.html'),
          history: path.resolve(__dirname, 'src/renderer/history.html')
        }
      }
    }
  }
});

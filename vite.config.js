import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' uses relative asset paths, so the site works under any GitHub Pages
// repository URL (https://USER.github.io/for-her-music-player/) without edits.
export default defineConfig({
  base: './',
  plugins: [react()],
});

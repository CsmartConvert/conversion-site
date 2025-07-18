// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server', // ✅ Required to enable server-side form handling
  server: {
    port: 4322,
  },
  integrations: [tailwind(), react()],
});
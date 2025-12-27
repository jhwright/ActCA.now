import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // Only use Netlify adapter in production to avoid dev mode config conflicts
  ...(process.env.NETLIFY ? { adapter: netlify() } : {}),
  integrations: []
});


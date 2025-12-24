import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: netlify(),
  integrations: [
    alpinejs()
  ]
});


// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
  site: 'https://thejohn01.github.io',
  trailingSlash: 'ignore',
});

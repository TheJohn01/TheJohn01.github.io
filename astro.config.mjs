// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
  site: 'https://thejohn01.github.io',
  trailingSlash: 'ignore',
  // MDX: as páginas de projeto usam componentes (gráficos) no meio do texto.
  integrations: [mdx()],
});

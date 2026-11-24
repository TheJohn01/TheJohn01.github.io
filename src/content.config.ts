// Coleções de conteúdo em Markdown, validadas com Zod.
// Cada ficheiro .md ou .mdx em src/content/projects é um projeto; em src/content/publications, uma publicação.
// Os .mdx podem usar os gráficos de src/components/charts no meio do texto.
// Se faltar um campo obrigatório ou tiver o tipo errado, `npm run build` falha com uma mensagem clara.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Chaves das artes ASCII em src/assets/ascii/day (e dusk, quando existe versão escura). */
export const ART_KEYS = ['battery', 'pinch', 'plant', 'reactor', 'wine'] as const;

const link = z.object({
  label: z.string(),
  href: z.url(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** Ordem na página inicial (1 aparece primeiro). */
    order: z.number().int(),
    /** Etiquetas mostradas em maiúsculas por cima do título. */
    tags: z.array(z.string()).min(1),
    status: z.enum(['Publicado', 'Em curso']),
    art: z.enum(ART_KEYS),
    /** Descrição da arte ASCII para leitores de ecrã. */
    artLabel: z.string(),
    summary: z.string(),
    links: z.array(link).default([]),
    /** Só no projeto em destaque: os principais resultados, mostrados em grande. O resto vai no texto da página. */
    caseStudy: z
      .object({
        findings: z.array(z.object({ value: z.string(), text: z.string() })).min(1),
      })
      .optional(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    /** Título original do artigo. */
    title: z.string(),
    journal: z.string(),
    /** Volume, número e páginas, como aparecem na citação. Ex.: "12(3), 40–59". */
    issue: z.string(),
    year: z.number().int(),
    doi: z.url(),
    /** Título curto no cartão "Formação". Ex.: "Artigo no U.Porto Journal of Engineering". */
    cardTitle: z.string(),
    /** O meu papel. Ex.: "Coautor, com sete colegas". */
    role: z.string(),
    /** Resumo de uma frase, usado no cartão "Formação". */
    summary: z.string(),
    /** Secção "Investigação" da página inicial. Usa *itálico* para nomes científicos. */
    highlight: z
      .object({
        heading: z.string(),
        lede: z.string(),
        art: z.enum(ART_KEYS),
        artLabel: z.string(),
      })
      .optional(),
  }),
});

export const collections = { projects, publications };

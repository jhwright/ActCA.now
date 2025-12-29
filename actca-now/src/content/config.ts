import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const calls = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/calls" }),
  schema: z.object({
    title: z.string(),
    officialName: z.string(),
    officialTitle: z.string(),
    phone: z.string(),
    script: z.string(),
    priority: z.boolean().default(false),
    rationale: z.string(),
    state: z.string().length(2).transform(val => val.toUpperCase())
  }),
});

export const collections = { calls };

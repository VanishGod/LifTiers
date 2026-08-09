import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const knowledgeCollection = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/knowledge"
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    date: z.coerce.date().optional(),
    category: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  "knowledge": knowledgeCollection,
};
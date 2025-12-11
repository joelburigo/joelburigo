import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.enum([
      'Framework 6Ps',
      'Vendas Escaláveis', 
      'CRM e Tecnologia',
      'Processos',
      'Casos de Sucesso',
      'Mentalidade'
    ]),
    date: z.date(),
    readTime: z.string(),
    author: z.string().default('Joel Burigo'),
    featured: z.boolean().default(false),
    heroImage: image().optional(),
  }),
})

const depoimentos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/depoimentos" }),
  schema: z.object({
    name: z.string(),
    company: z.string(),
    role: z.string(),
    content: z.string(),
    rating: z.number().min(1).max(5).optional(),
  }),
})

export const collections = {
  blog,
  depoimentos,
}

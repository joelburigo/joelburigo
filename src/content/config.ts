import { defineCollection, z } from 'astro:content'

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
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
    heroImage: z.string().optional(),
  }),
})

export const collections = {
  blog: blogCollection,
}

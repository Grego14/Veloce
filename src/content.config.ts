import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const localizedText = z.object({
  es: z.string().min(3, 'The name must be of at least 3 characters.'),
  en: z.string()
})

const productSchema = z.object({
  id: z.string(),
  name: localizedText,
  description: localizedText,
  price: z.number().positive('The price must be a positive number.'),
  image: z.string(),
  inStock: z.boolean().default(true),
  category: z.string(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5)
})

const productsCollection = defineCollection({
  // loader: matches JSON files under src/data/products
  loader: glob({ pattern: '**/[^_]*.json', base: './src/data/products' }),
  // Accept files that export an array of product objects
  schema: z.array(productSchema)
})

export const collections = {
  products: productsCollection
}

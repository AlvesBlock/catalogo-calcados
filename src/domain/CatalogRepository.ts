import type { CatalogConfig } from './CatalogConfig'
import type { Product } from './Product'

export interface CatalogRepository {
  getProducts(): Promise<Product[]>
  getProductBySlug(slug: string): Promise<Product | null>
  getConfig(): Promise<CatalogConfig>
}

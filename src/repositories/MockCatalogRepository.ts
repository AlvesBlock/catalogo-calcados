import type { CatalogRepository } from '../domain/CatalogRepository'
import type { CatalogConfig } from '../domain/CatalogConfig'
import type { Product } from '../domain/Product'
import { mockConfig, mockProducts } from './mockData'

export class MockCatalogRepository implements CatalogRepository {
  async getProducts(): Promise<Product[]> {
    return structuredClone(mockProducts)
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return structuredClone(mockProducts.find((product) => product.slug === slug) ?? null)
  }

  async getConfig(): Promise<CatalogConfig> {
    return structuredClone(mockConfig)
  }
}

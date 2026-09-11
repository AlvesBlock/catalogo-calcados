import type { CatalogConfig } from '../domain/CatalogConfig'
import type { CatalogRepository } from '../domain/CatalogRepository'
import type { Product } from '../domain/Product'
import { parseConfigCsv, parseProductsCsv } from './csvParsing'

export type CatalogFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>

// O wrapper evita chamar window.fetch com a instância do repository como receiver.
const defaultCatalogFetch: CatalogFetch = (input, init) =>
  fetch(input, init)

export class GoogleSheetsCatalogRepository implements CatalogRepository {
  private productsPromise?: Promise<Product[]>
  private configPromise?: Promise<CatalogConfig>

  constructor(
    private readonly productsCsvUrl: string,
    private readonly configCsvUrl: string,
    private readonly fetcher: CatalogFetch = defaultCatalogFetch,
  ) {}

  getProducts(): Promise<Product[]> {
    if (!this.productsPromise) {
      this.productsPromise = this.fetchCsv(this.productsCsvUrl, 'PRODUTOS')
        .then(parseProductsCsv)
        .catch((error) => {
          this.productsPromise = undefined
          throw error
        })
    }
    return this.productsPromise
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts()
    return products.find((product) => product.slug === slug) ?? null
  }

  getConfig(): Promise<CatalogConfig> {
    if (!this.configPromise) {
      this.configPromise = this.fetchCsv(this.configCsvUrl, 'CONFIG')
        .then(parseConfigCsv)
        .catch((error) => {
          this.configPromise = undefined
          throw error
        })
    }
    return this.configPromise
  }

  private async fetchCsv(url: string, name: string): Promise<string> {
    if (!url.trim()) {
      throw new Error(
        'Fonte google requer VITE_PRODUCTS_CSV_URL e VITE_CONFIG_CSV_URL configuradas.',
      )
    }
    const response = await this.fetcher(url)
    if (!response.ok) {
      throw new Error(name + ': falha HTTP ' + response.status + ' ao carregar o CSV')
    }
    return response.text()
  }
}

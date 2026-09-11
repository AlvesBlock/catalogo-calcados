import type { CatalogRepository } from '../domain/CatalogRepository'
import { GoogleSheetsCatalogRepository, type CatalogFetch } from './GoogleSheetsCatalogRepository'
import { MockCatalogRepository } from './MockCatalogRepository'

interface RepositoryOptions {
  source?: string
  productsCsvUrl?: string
  configCsvUrl?: string
  fetcher?: CatalogFetch
  development?: boolean
}

export const createCatalogRepository = ({
  source,
  productsCsvUrl = '',
  configCsvUrl = '',
  fetcher,
  development = false,
}: RepositoryOptions): CatalogRepository => {
  const selectedSource = source?.trim().toLowerCase() || (development ? 'mock' : '')
  switch (selectedSource) {
    case 'mock':
      return new MockCatalogRepository()
    case 'google':
      return new GoogleSheetsCatalogRepository(productsCsvUrl, configCsvUrl, fetcher)
    default:
      throw new Error(
        'VITE_CATALOG_SOURCE deve ser "mock" ou "google". Em produção, a variável é obrigatória.',
      )
  }
}

export const catalogRepository = createCatalogRepository({
  source: import.meta.env.VITE_CATALOG_SOURCE,
  productsCsvUrl: import.meta.env.VITE_PRODUCTS_CSV_URL,
  configCsvUrl: import.meta.env.VITE_CONFIG_CSV_URL,
  development: import.meta.env.DEV,
})

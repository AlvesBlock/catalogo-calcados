import type { CatalogRepository } from '../domain/CatalogRepository'
import { MockCatalogRepository } from './MockCatalogRepository'

export const catalogRepository: CatalogRepository = new MockCatalogRepository()

import { describe, expect, it } from 'vitest'
import { GoogleSheetsCatalogRepository } from './GoogleSheetsCatalogRepository'
import { MockCatalogRepository } from './MockCatalogRepository'
import { createCatalogRepository } from './catalogRepository'

describe('createCatalogRepository', () => {
  it('selects mock explicitly and as the local development default', () => {
    expect(createCatalogRepository({ source: 'mock' })).toBeInstanceOf(MockCatalogRepository)
    expect(createCatalogRepository({ development: true })).toBeInstanceOf(MockCatalogRepository)
  })

  it('selects google without falling back to mock', () => {
    expect(
      createCatalogRepository({
        source: 'google',
        productsCsvUrl: 'products',
        configCsvUrl: 'config',
      }),
    ).toBeInstanceOf(GoogleSheetsCatalogRepository)
    expect(createCatalogRepository({ source: 'google' })).toBeInstanceOf(
      GoogleSheetsCatalogRepository,
    )
  })

  it('rejects an absent production source and unknown values', () => {
    expect(() => createCatalogRepository({})).toThrow('VITE_CATALOG_SOURCE')
    expect(() => createCatalogRepository({ source: 'outro' })).toThrow('VITE_CATALOG_SOURCE')
  })
})

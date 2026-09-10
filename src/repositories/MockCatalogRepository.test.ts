import { describe, expect, it } from 'vitest'
import { MockCatalogRepository } from './MockCatalogRepository'

describe('MockCatalogRepository', () => {
  const repository = new MockCatalogRepository()
  it('returns five isolated products', async () => {
    const products = await repository.getProducts()
    expect(products).toHaveLength(5)
    products[0].name = 'Changed'
    expect((await repository.getProducts())[0].name).toBe('Air Max 90')
  })
  it('finds by slug and returns null when missing', async () => {
    expect((await repository.getProductBySlug('nike-air-max-90-branco-42'))?.sku).toBe('SAP000001')
    expect(await repository.getProductBySlug('missing')).toBeNull()
  })
})

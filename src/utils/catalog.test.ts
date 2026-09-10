import { describe, expect, it } from 'vitest'
import { mockProducts } from '../repositories/mockData'
import { emptyFilters, filterProducts, sortProducts } from './catalog'

describe('catalog operations', () => {
  it('searches without accents and combines filters', () => {
    const result = filterProducts(mockProducts, {
      ...emptyFilters,
      search: 'tenis',
      brand: 'Nike',
      size: '42',
    })
    expect(result.map((item) => item.sku)).toEqual(['SAP000001'])
  })
  it('sorts using promotional price', () => {
    expect(sortProducts(mockProducts, 'price-asc')[0].sku).toBe('SAP000004')
    expect(sortProducts(mockProducts, 'price-desc')[0].sku).toBe('SAP000001')
  })
})

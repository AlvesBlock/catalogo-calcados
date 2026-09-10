import { getEffectivePrice, type Product } from '../domain/Product'

export type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc'
export interface CatalogFilters {
  search: string
  brand: string
  category: string
  gender: string
  color: string
  size: string
}
export const emptyFilters: CatalogFilters = {
  search: '',
  brand: '',
  category: '',
  gender: '',
  color: '',
  size: '',
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

export function filterProducts(products: Product[], filters: CatalogFilters): Product[] {
  const search = normalize(filters.search.trim())
  return products.filter((product) => {
    const searchable = normalize(
      [product.sku, product.name, product.brand, product.category, product.color].join(' '),
    )
    return (
      (!search || searchable.includes(search)) &&
      (!filters.brand || product.brand === filters.brand) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.gender || product.gender === filters.gender) &&
      (!filters.color || product.color === filters.color) &&
      (!filters.size || product.size === filters.size)
    )
  })
}

export function sortProducts(products: Product[], sort: CatalogSort): Product[] {
  const result = [...products]
  if (sort === 'price-asc')
    return result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
  if (sort === 'price-desc')
    return result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a))
  if (sort === 'name-asc')
    return result.sort((a, b) =>
      `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'pt-BR'),
    )
  return result.sort((a, b) => a.order - b.order)
}

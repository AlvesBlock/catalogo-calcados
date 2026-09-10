export interface Product {
  sku: string
  group: string
  slug: string
  name: string
  brand: string
  category: string
  gender: string
  color: string
  size: string
  price: number
  promotionalPrice?: number
  description: string
  images: string[]
  available: boolean
  featured: boolean
  newArrival: boolean
  order: number
}

export const getEffectivePrice = (product: Product): number =>
  product.promotionalPrice !== undefined && product.promotionalPrice < product.price
    ? product.promotionalPrice
    : product.price

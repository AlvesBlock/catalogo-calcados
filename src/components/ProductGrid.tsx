import type { Product } from '../domain/Product'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products, showPrice }: { products: Product[]; showPrice: boolean }) {
  if (!products.length)
    return (
      <div className="empty-state">
        <h2>Nenhum produto encontrado</h2>
        <p>Tente ajustar a busca ou os filtros.</p>
      </div>
    )
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} showPrice={showPrice} />
      ))}
    </div>
  )
}

import { getEffectivePrice, type Product } from '../domain/Product'
import { formatCurrencyBRL } from '../utils/formatCurrencyBRL'

export function PriceDisplay({ product, showPrice }: { product: Product; showPrice: boolean }) {
  if (!showPrice) return null
  const promotional =
    product.promotionalPrice !== undefined && product.promotionalPrice < product.price
  return (
    <div className="price">
      {promotional && <del>{formatCurrencyBRL(product.price)}</del>}
      <strong>{formatCurrencyBRL(getEffectivePrice(product))}</strong>
    </div>
  )
}

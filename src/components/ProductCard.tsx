import { Link } from 'react-router-dom'
import type { Product } from '../domain/Product'
import { useFavorites } from '../hooks/FavoritesContext'
import { buildCloudinaryUrl } from '../services/cloudinary'
import { PriceDisplay } from './PriceDisplay'

export function ProductCard({ product, showPrice }: { product: Product; showPrice: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(product.sku)
  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link to={`/produto/${product.slug}`} aria-label={`Ver ${product.brand} ${product.name}`}>
          <img
            src={buildCloudinaryUrl(product.images[0], 600)}
            alt={`${product.brand} ${product.name}, ${product.color}`}
            loading="lazy"
          />
        </Link>
        <button
          className="favorite-button"
          type="button"
          aria-pressed={favorite}
          aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={() => toggleFavorite(product.sku)}
        >
          {favorite ? '♥' : '♡'}
        </button>
        {!product.available && <span className="availability-badge">Indisponível</span>}
      </div>
      <div className="product-card__content">
        <p className="eyebrow">{product.brand}</p>
        <h3>
          <Link to={`/produto/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="muted">Tamanho {product.size}</p>
        <PriceDisplay product={product} showPrice={showPrice} />
      </div>
    </article>
  )
}

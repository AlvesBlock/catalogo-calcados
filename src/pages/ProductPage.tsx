import { Link, useParams } from 'react-router-dom'
import { PriceDisplay } from '../components/PriceDisplay'
import { useCatalogData } from '../hooks/useCatalogData'
import { useFavorites } from '../hooks/FavoritesContext'
import { buildCloudinaryUrl } from '../services/cloudinary'
import { buildProductInterestMessage, buildWhatsAppUrl } from '../services/whatsapp'

export function ProductPage() {
  const { slug } = useParams()
  const { products, config, loading, error } = useCatalogData()
  const { isFavorite, toggleFavorite } = useFavorites()
  if (loading) return <p className="status container">Carregando produto…</p>
  if (error || !config) return <p className="status container">{error}</p>
  const product = products.find((item) => item.slug === slug)
  if (!product)
    return (
      <div className="container page empty-state">
        <h1>Produto não encontrado</h1>
        <Link to="/catalogo">Voltar ao catálogo</Link>
      </div>
    )
  const favorite = isFavorite(product.sku)
  const message = buildProductInterestMessage(product, window.location.href, config.showPrice)
  return (
    <div className="container page">
      <Link className="back-link" to="/catalogo">
        ← Voltar ao catálogo
      </Link>
      <article className="product-detail">
        <div className="gallery">
          {product.images.map((image, index) => (
            <img
              key={image}
              src={buildCloudinaryUrl(image, 1200)}
              alt={`${product.brand} ${product.name}${index ? `, imagem ${index + 1}` : ''}`}
            />
          ))}
        </div>
        <div className="product-info">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <PriceDisplay product={product} showPrice={config.showPrice} />
          <p className={product.available ? 'available' : 'unavailable'}>
            {product.available ? 'Disponível para consulta' : 'Produto indisponível no momento'}
          </p>
          <dl>
            <div>
              <dt>Código</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>Categoria</dt>
              <dd>{product.category}</dd>
            </div>
            <div>
              <dt>Gênero</dt>
              <dd>{product.gender}</dd>
            </div>
            <div>
              <dt>Cor</dt>
              <dd>{product.color}</dd>
            </div>
            <div>
              <dt>Tamanho</dt>
              <dd>{product.size}</dd>
            </div>
          </dl>
          <p>{product.description}</p>
          <div className="actions">
            <a
              className={`button ${!product.available ? 'button--disabled' : ''}`}
              href={product.available ? buildWhatsAppUrl(config.whatsapp, message) : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!product.available}
            >
              Tenho interesse
            </a>
            <button
              className="button button--secondary"
              type="button"
              aria-pressed={favorite}
              onClick={() => toggleFavorite(product.sku)}
            >
              {favorite ? '♥ Remover dos favoritos' : '♡ Adicionar aos favoritos'}
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

import { ProductGrid } from '../components/ProductGrid'
import { CatalogLoadError } from '../components/CatalogLoadError'
import { useCatalogData } from '../hooks/useCatalogData'
import { useFavorites } from '../hooks/FavoritesContext'
import {
  buildFavoritesMessage,
  buildWhatsAppUrl,
  FAVORITES_MESSAGE_LIMIT,
} from '../services/whatsapp'

export function FavoritesPage() {
  const { products, config, loading, error, retry } = useCatalogData()
  const { favoriteSkus } = useFavorites()
  if (loading) return <p className="status container">Carregando favoritos…</p>
  if (error || !config) return <CatalogLoadError onRetry={retry} />
  const favorites = products.filter((product) => favoriteSkus.includes(product.sku))
  return (
    <div className="container page">
      <div className="page-heading">
        <p className="eyebrow">Sua seleção</p>
        <h1>Favoritos</h1>
        <p>Seus itens ficam salvos neste dispositivo.</p>
      </div>
      <ProductGrid products={favorites} showPrice={config.showPrice} />
      {favorites.length > 0 && (
        <div className="favorites-action">
          <a
            className="button"
            href={buildWhatsAppUrl(
              config.whatsapp,
              buildFavoritesMessage(favorites, config.showPrice),
            )}
            target="_blank"
            rel="noreferrer"
          >
            Enviar favoritos pelo WhatsApp
          </a>
          <p className="muted">
            A mensagem inclui até {FAVORITES_MESSAGE_LIMIT} produtos para permanecer fácil de ler.
          </p>
        </div>
      )}
    </div>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import { useCatalogData } from '../hooks/useCatalogData'
import { ProductGrid } from '../components/ProductGrid'
import { CatalogLoadError } from '../components/CatalogLoadError'

export function HomePage() {
  const navigate = useNavigate()
  const { products, config, loading, error, retry } = useCatalogData()
  if (loading) return <p className="status container">Carregando catálogo…</p>
  if (error || !config) return <CatalogLoadError onRetry={retry} />
  const visible = products.filter((product) => config.showUnavailable || product.available)
  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <p className="eyebrow">Catálogo de calçados</p>
          <h1>{config.homeTitle}</h1>
          <p>{config.homeSubtitle}</p>
          <form
            className="hero-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              navigate(`/catalogo?q=${encodeURIComponent(String(data.get('q') ?? ''))}`)
            }}
          >
            <label className="sr-only" htmlFor="home-search">
              Pesquisar no catálogo
            </label>
            <input id="home-search" name="q" placeholder="Busque por modelo, marca ou código" />
            <button type="submit">Pesquisar</button>
          </form>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore</p>
            <h2>Categorias</h2>
          </div>
        </div>
        <div className="category-links">
          {[...new Set(visible.map((p) => p.category))].map((category) => (
            <Link key={category} to={`/catalogo?categoria=${encodeURIComponent(category)}`}>
              {category}
              <span>→</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Escolhas especiais</p>
            <h2>Destaques</h2>
          </div>
          <Link to="/catalogo">Ver catálogo</Link>
        </div>
        <ProductGrid products={visible.filter((p) => p.featured)} showPrice={config.showPrice} />
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Acabaram de chegar</p>
            <h2>Novidades</h2>
          </div>
        </div>
        <ProductGrid products={visible.filter((p) => p.newArrival)} showPrice={config.showPrice} />
      </section>
      <section className="cta">
        <div className="container">
          <h2>Seu próximo par está aqui</h2>
          <p>Veja todos os modelos e fale conosco para consultar disponibilidade.</p>
          <Link className="button" to="/catalogo">
            Visualizar catálogo
          </Link>
        </div>
      </section>
    </>
  )
}

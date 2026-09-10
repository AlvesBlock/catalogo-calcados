import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../components/ProductGrid'
import { useCatalogData } from '../hooks/useCatalogData'
import {
  emptyFilters,
  filterProducts,
  sortProducts,
  type CatalogFilters,
  type CatalogSort,
} from '../utils/catalog'

const unique = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b, 'pt-BR'))

export function CatalogPage() {
  const [params] = useSearchParams()
  const { products, config, loading, error } = useCatalogData()
  const [filters, setFilters] = useState<CatalogFilters>(() => ({
    ...emptyFilters,
    search: params.get('q') ?? '',
    category: params.get('categoria') ?? '',
  }))
  const [sort, setSort] = useState<CatalogSort>('default')
  const [page, setPage] = useState(1)
  const options = useMemo(
    () => ({
      brand: unique(products.map((p) => p.brand)),
      category: unique(products.map((p) => p.category)),
      gender: unique(products.map((p) => p.gender)),
      color: unique(products.map((p) => p.color)),
      size: unique(products.map((p) => p.size)),
    }),
    [products],
  )
  const result = useMemo(
    () =>
      sortProducts(
        filterProducts(
          products.filter((p) => config?.showUnavailable || p.available),
          filters,
        ),
        sort,
      ),
    [products, config, filters, sort],
  )
  const pageSize = config?.pageSize ?? 12
  const pageCount = Math.max(1, Math.ceil(result.length / pageSize))
  const current = result.slice((page - 1) * pageSize, page * pageSize)
  useEffect(() => setPage(1), [filters, sort])
  if (loading) return <p className="status container">Carregando catálogo…</p>
  if (error || !config) return <p className="status container">{error}</p>
  const set = (key: keyof CatalogFilters, value: string) =>
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
  return (
    <div className="container page">
      <div className="page-heading">
        <p className="eyebrow">Todos os modelos</p>
        <h1>Catálogo</h1>
        <p>{result.length} produto(s) encontrado(s)</p>
      </div>
      <div className="catalog-layout">
        <aside className="filters">
          <h2>Filtros</h2>
          <label>
            Pesquisar
            <input
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Nome, marca ou código"
            />
          </label>
          {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
            <label key={key}>
              {
                {
                  brand: 'Marca',
                  category: 'Categoria',
                  gender: 'Gênero',
                  color: 'Cor',
                  size: 'Tamanho',
                }[key]
              }
              <select value={filters[key]} onChange={(e) => set(key, e.target.value)}>
                <option value="">Todos</option>
                {options[key].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
          <button className="text-button" type="button" onClick={() => setFilters(emptyFilters)}>
            Limpar filtros
          </button>
        </aside>
        <section aria-label="Resultados do catálogo">
          <div className="sort-row">
            <label>
              Ordenar por
              <select value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)}>
                <option value="default">Relevância</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name-asc">Nome A–Z</option>
              </select>
            </label>
          </div>
          <ProductGrid products={current} showPrice={config.showPrice} />
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Paginação">
              <button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                Anterior
              </button>
              <span>
                Página {page} de {pageCount}
              </span>
              <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>
                Próxima
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  )
}

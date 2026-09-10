import { useEffect, useState } from 'react'
import type { CatalogConfig } from '../domain/CatalogConfig'
import type { Product } from '../domain/Product'
import { catalogRepository } from '../repositories/catalogRepository'

interface CatalogData {
  products: Product[]
  config: CatalogConfig | null
  loading: boolean
  error: string | null
}

export function useCatalogData(): CatalogData {
  const [state, setState] = useState<CatalogData>({
    products: [],
    config: null,
    loading: true,
    error: null,
  })
  useEffect(() => {
    let active = true
    Promise.all([catalogRepository.getProducts(), catalogRepository.getConfig()])
      .then(([products, config]) => {
        if (active) setState({ products, config, loading: false, error: null })
      })
      .catch(() => {
        if (active)
          setState((current) => ({
            ...current,
            loading: false,
            error: 'Não foi possível carregar o catálogo.',
          }))
      })
    return () => {
      active = false
    }
  }, [])
  return state
}

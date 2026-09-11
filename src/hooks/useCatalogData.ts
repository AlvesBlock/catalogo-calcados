import { useEffect, useState } from 'react'
import type { CatalogConfig } from '../domain/CatalogConfig'
import type { Product } from '../domain/Product'
import { catalogRepository } from '../repositories/catalogRepository'

interface CatalogData {
  products: Product[]
  config: CatalogConfig | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useCatalogData(): CatalogData {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<CatalogData>({
    products: [],
    config: null,
    loading: true,
    error: null,
    retry: () => setAttempt((value) => value + 1),
  })
  useEffect(() => {
    let active = true
    setState((current) => ({ ...current, products: [], config: null, loading: true, error: null }))
    Promise.all([catalogRepository.getProducts(), catalogRepository.getConfig()])
      .then(([products, config]) => {
        if (active) {
          setState((current) => ({ ...current, products, config, loading: false, error: null }))
        }
      })
      .catch((loadError: unknown) => {
        console.error('Falha ao carregar o catálogo:', loadError)
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
  }, [attempt])
  return state
}

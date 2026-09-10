/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loadFavoriteSkus, saveFavoriteSkus } from '../utils/favoritesStorage'

interface FavoritesContextValue {
  favoriteSkus: string[]
  toggleFavorite: (sku: string) => void
  removeFavorite: (sku: string) => void
  isFavorite: (sku: string) => boolean
}
const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteSkus, setFavoriteSkus] = useState<string[]>(() => loadFavoriteSkus())
  const update = (next: string[]) => {
    setFavoriteSkus(next)
    saveFavoriteSkus(next)
  }
  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteSkus,
      toggleFavorite: (sku) =>
        update(
          favoriteSkus.includes(sku)
            ? favoriteSkus.filter((item) => item !== sku)
            : [...favoriteSkus, sku],
        ),
      removeFavorite: (sku) => update(favoriteSkus.filter((item) => item !== sku)),
      isFavorite: (sku) => favoriteSkus.includes(sku),
    }),
    [favoriteSkus],
  )
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider')
  return value
}

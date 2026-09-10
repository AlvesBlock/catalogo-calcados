const STORAGE_KEY = 'catalog-favorite-skus'

export function loadFavoriteSkus(storage: Pick<Storage, 'getItem'> = localStorage): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export function saveFavoriteSkus(
  skus: string[],
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify([...new Set(skus)]))
}

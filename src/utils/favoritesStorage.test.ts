import { describe, expect, it } from 'vitest'
import { loadFavoriteSkus, saveFavoriteSkus } from './favoritesStorage'

describe('favorites storage', () => {
  it('handles invalid content and deduplicates saved SKUs', () => {
    expect(loadFavoriteSkus({ getItem: () => 'invalid' })).toEqual([])
    let saved = ''
    saveFavoriteSkus(['A', 'A', 'B'], {
      setItem: (_key, value) => {
        saved = value
      },
    })
    expect(JSON.parse(saved)).toEqual(['A', 'B'])
  })
})

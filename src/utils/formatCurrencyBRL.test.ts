import { describe, expect, it } from 'vitest'
import { formatCurrencyBRL } from './formatCurrencyBRL'

describe('formatCurrencyBRL', () => {
  it('formats Brazilian real values', () =>
    expect(formatCurrencyBRL(299.9)).toMatch(/R\$\s?299,90/))
})

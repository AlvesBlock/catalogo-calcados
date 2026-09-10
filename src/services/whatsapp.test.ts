import { describe, expect, it } from 'vitest'
import { mockProducts } from '../repositories/mockData'
import {
  buildFavoritesMessage,
  buildProductInterestMessage,
  buildWhatsAppUrl,
  FAVORITES_MESSAGE_LIMIT,
} from './whatsapp'

describe('WhatsApp builders', () => {
  it('composes product information and encodes the URL', () => {
    const message = buildProductInterestMessage(mockProducts[0], 'https://loja.test/produto/item')
    expect(message).toContain('SAP000001')
    expect(message).toContain('R$ 299,90')
    expect(buildWhatsAppUrl('+55 (11) 99999-0000', message)).toMatch(
      /^https:\/\/wa\.me\/5511999990000\?text=/,
    )
  })
  it('limits long favorite lists', () => {
    const products = Array.from({ length: FAVORITES_MESSAGE_LIMIT + 2 }, (_, index) => ({
      ...mockProducts[0],
      sku: `SKU${index}`,
    }))
    expect(buildFavoritesMessage(products)).toContain('e mais 2 item(ns)')
  })
})

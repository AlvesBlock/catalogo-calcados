import { getEffectivePrice, type Product } from '../domain/Product'
import { formatCurrencyBRL } from '../utils/formatCurrencyBRL'

export const FAVORITES_MESSAGE_LIMIT = 10

export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildProductInterestMessage(
  product: Product,
  productUrl: string,
  showPrice = true,
): string {
  const lines = [
    'Olá! Tenho interesse neste produto:',
    '',
    `${product.brand} ${product.name}`,
    `Código: ${product.sku}`,
    `Tamanho: ${product.size}`,
  ]
  if (showPrice) lines.push(`Preço: ${formatCurrencyBRL(getEffectivePrice(product))}`)
  lines.push('', productUrl, '', 'Ainda está disponível?')
  return lines.join('\n')
}

export function buildFavoritesMessage(products: Product[], showPrice = true): string {
  const selected = products.slice(0, FAVORITES_MESSAGE_LIMIT)
  const items = selected.map((product, index) => {
    const price = showPrice ? ` - ${formatCurrencyBRL(getEffectivePrice(product))}` : ''
    return `${index + 1}. ${product.sku} - ${product.brand} ${product.name} - Tam. ${product.size}${price}`
  })
  const remainder = products.length - selected.length
  if (remainder > 0) items.push(`… e mais ${remainder} item(ns).`)
  return [
    'Olá! Separei estes produtos:',
    '',
    ...items,
    '',
    'Gostaria de saber quais estão disponíveis.',
  ].join('\n')
}

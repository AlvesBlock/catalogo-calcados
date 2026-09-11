import { describe, expect, it, vi } from 'vitest'
import { createCatalogCsvHandler } from './catalog-csv'

const productsUrl = 'https://example.test/products.csv'
const configUrl = 'https://example.test/config.csv'
const runtimeEnv = {
  CATALOG_PRODUCTS_CSV_URL: productsUrl,
  CATALOG_CONFIG_CSV_URL: configUrl,
}
const request = (query: string) =>
  new Request('https://catalogo.test/.netlify/functions/catalog-csv?' + query)
const csvResponse = (status = 200) => new Response('sku,nome\n1,Produto', { status })

describe('catalog-csv Netlify Function', () => {
  it.each([
    ['products', productsUrl],
    ['config', configUrl],
  ])('maps sheet=%s to its server-side URL', async (sheet, expectedUrl) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(csvResponse())
    const handler = createCatalogCsvHandler(fetcher, runtimeEnv)
    expect((await handler(request('sheet=' + sheet))).status).toBe(200)
    expect(fetcher).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({ redirect: 'follow' }),
    )
  })

  it('returns 400 for an invalid sheet and never accepts an arbitrary URL', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const handler = createCatalogCsvHandler(fetcher, runtimeEnv)
    const response = await handler(
      request('sheet=https://attacker.test/data.csv&url=https://attacker.test/data.csv'),
    )
    expect(response.status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('ignores arbitrary URL parameters when a valid sheet is selected', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(csvResponse())
    const handler = createCatalogCsvHandler(fetcher, runtimeEnv)
    await handler(request('sheet=products&url=https://attacker.test/data.csv'))
    expect(fetcher).toHaveBeenCalledWith(productsUrl, expect.any(Object))
  })

  it('returns 500 when the selected environment variable is absent', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const handler = createCatalogCsvHandler(fetcher, {})
    const response = await handler(request('sheet=products'))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('CATALOG_PRODUCTS_CSV_URL')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([404, 500])('translates upstream HTTP %s to 502', async (status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(csvResponse(status))
    const response = await createCatalogCsvHandler(fetcher, runtimeEnv)(request('sheet=products'))
    expect(response.status).toBe(502)
  })

  it('returns CSV with browser and durable CDN cache headers', async () => {
    const handler = createCatalogCsvHandler(
      vi.fn<typeof fetch>().mockResolvedValue(csvResponse()),
      runtimeEnv,
    )
    const response = await handler(request('sheet=products'))
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect(response.headers.get('Netlify-CDN-Cache-Control')).toBe(
      'public, durable, max-age=300, stale-while-revalidate=600',
    )
    expect(await response.text()).toBe('sku,nome\n1,Produto')
  })

  it('returns 502 when fetch rejects without exposing the error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('private URL details'))
    const response = await createCatalogCsvHandler(fetcher, runtimeEnv)(request('sheet=config'))
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('private URL details')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { GoogleSheetsCatalogRepository, type CatalogFetch } from './GoogleSheetsCatalogRepository'

const productsCsv =
  'sku,slug,nome,marca,categoria,tamanho,preco,disponivel\nSKU1,produto-1,Produto,Marca,Tênis,42,"299,90",SIM'
const configCsv =
  'nome_loja,whatsapp,mostrar_preco,mostrar_indisponiveis,quantidade_por_pagina\nLoja,5511999999999,SIM,NAO,24'

const response = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/csv' } })

describe('GoogleSheetsCatalogRepository', () => {
  it('caches products and reuses them when finding by slug', async () => {
    const fetcher = vi.fn<CatalogFetch>().mockResolvedValue(response(productsCsv))
    const repository = new GoogleSheetsCatalogRepository('products', 'config', fetcher)
    const [first, second] = await Promise.all([repository.getProducts(), repository.getProducts()])
    expect(first).toBe(second)
    expect((await repository.getProductBySlug('produto-1'))?.sku).toBe('SKU1')
    expect(await repository.getProductBySlug('inexistente')).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('caches config', async () => {
    const fetcher = vi.fn<CatalogFetch>().mockResolvedValue(response(configCsv))
    const repository = new GoogleSheetsCatalogRepository('products', 'config', fetcher)
    await Promise.all([repository.getConfig(), repository.getConfig()])
    await repository.getConfig()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('reports HTTP errors and permits a new attempt after failure', async () => {
    const fetcher = vi
      .fn<CatalogFetch>()
      .mockResolvedValueOnce(response('erro', 503))
      .mockResolvedValueOnce(response(productsCsv))
    const repository = new GoogleSheetsCatalogRepository('products', 'config', fetcher)
    await expect(repository.getProducts()).rejects.toThrow('falha HTTP 503')
    await expect(repository.getProducts()).resolves.toHaveLength(1)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('fails clearly when URLs are missing', async () => {
    const repository = new GoogleSheetsCatalogRepository('', '', vi.fn())
    await expect(repository.getProducts()).rejects.toThrow('VITE_PRODUCTS_CSV_URL')
  })

  it('calls the native fetch without binding the repository as its receiver', async () => {
    const nativeFetch = vi.fn(function (this: unknown) {
      expect(this).toBeUndefined()
      return Promise.resolve(response(productsCsv))
    })
    vi.stubGlobal('fetch', nativeFetch)

    try {
      const repository = new GoogleSheetsCatalogRepository('products', 'config')
      await expect(repository.getProducts()).resolves.toHaveLength(1)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

import { env } from 'node:process'

const CDN_CACHE_CONTROL = 'public, durable, max-age=300, stale-while-revalidate=600'
const BROWSER_CACHE_CONTROL = 'public, max-age=60'
const UPSTREAM_TIMEOUT_MS = 10_000

type CatalogSheet = 'products' | 'config'
type CatalogCsvEnv = Record<string, string | undefined>
type CatalogCsvFetch = typeof fetch

const environmentVariableBySheet: Record<CatalogSheet, string> = {
  products: 'CATALOG_PRODUCTS_CSV_URL',
  config: 'CATALOG_CONFIG_CSV_URL',
}

const errorResponse = (status: number, message: string) =>
  new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })

export const createCatalogCsvHandler = (
  fetcher: CatalogCsvFetch = fetch,
  runtimeEnv: CatalogCsvEnv = env,
) => {
  return async (request: Request): Promise<Response> => {
    const sheet = new URL(request.url).searchParams.get('sheet')
    if (sheet !== 'products' && sheet !== 'config') {
      return errorResponse(400, 'Parâmetro sheet inválido.')
    }

    const upstreamUrl = runtimeEnv[environmentVariableBySheet[sheet]]
    if (!upstreamUrl) {
      return errorResponse(500, 'Configuração do catálogo indisponível.')
    }

    try {
      const upstreamResponse = await fetcher(upstreamUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      })
      if (!upstreamResponse.ok) {
        return errorResponse(502, 'Não foi possível obter os dados do catálogo.')
      }

      return new Response(await upstreamResponse.text(), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Cache-Control': BROWSER_CACHE_CONTROL,
          'Netlify-CDN-Cache-Control': CDN_CACHE_CONTROL,
        },
      })
    } catch {
      return errorResponse(502, 'Não foi possível obter os dados do catálogo.')
    }
  }
}

export default createCatalogCsvHandler()

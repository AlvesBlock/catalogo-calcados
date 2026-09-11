import Papa from 'papaparse'
import type { CatalogConfig } from '../domain/CatalogConfig'
import type { Product } from '../domain/Product'

type CsvRow = Record<string, string | undefined>

const PRODUCT_REQUIRED_COLUMNS = [
  'sku',
  'slug',
  'nome',
  'marca',
  'categoria',
  'tamanho',
  'preco',
  'disponivel',
] as const
const CONFIG_REQUIRED_COLUMNS = ['nome_loja', 'whatsapp'] as const
const normalized = (value: unknown): string => String(value ?? '').trim()

const parseCsv = (csv: string, sourceName: string) => {
  const result = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
  })
  const fatalErrors = result.errors.filter((error) => error.type !== 'FieldMismatch')
  if (fatalErrors.length > 0) {
    const first = fatalErrors[0]
    throw new Error(
      sourceName + ': CSV inválido na linha ' + ((first.row ?? 0) + 2) + ': ' + first.message,
    )
  }
  const rowErrors = new Map<number, string>()
  result.errors
    .filter((error) => error.type === 'FieldMismatch')
    .forEach((error) => rowErrors.set(error.row ?? 0, error.message))
  return { rows: result.data, fields: result.meta.fields ?? [], rowErrors }
}

const requireColumns = (fields: string[], required: readonly string[], sourceName: string) => {
  const missing = required.filter((field) => !fields.includes(field))
  if (missing.length > 0) {
    throw new Error(sourceName + ': colunas obrigatórias ausentes: ' + missing.join(', '))
  }
}

const isEmptyRow = (row: CsvRow) => Object.values(row).every((value) => normalized(value) === '')

export const parseSheetBoolean = (value: unknown, field: string): boolean => {
  const text = normalized(value)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (text === 'SIM' || text === 'TRUE' || text === '1') return true
  if (text === 'NAO' || text === 'FALSE' || text === '0' || text === '') return false
  throw new Error(field + ' possui booleano inválido')
}

export const parseSheetPrice = (value: unknown, field: string): number => {
  let text = normalized(value).replace(/R\$/gi, '').replace(/\s/g, '')
  if (!text) throw new Error(field + ' está vazio')
  const lastComma = text.lastIndexOf(',')
  const lastDot = text.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    text = lastComma > lastDot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '')
  } else if (lastComma >= 0) {
    text = text.replace(/\./g, '').replace(',', '.')
  } else {
    text = text.replace(/,/g, '')
  }
  if (!/^\d+(?:\.\d+)?$/.test(text)) throw new Error(field + ' possui valor monetário inválido')
  const number = Number(text)
  if (!Number.isFinite(number) || number < 0)
    throw new Error(field + ' possui valor monetário inválido')
  return number
}

const requiredValue = (row: CsvRow, field: string): string => {
  const value = normalized(row[field])
  if (!value) throw new Error(field + ' está vazio')
  return value
}

const parseOrder = (value: unknown): number => {
  const text = normalized(value)
  if (!text) return 0
  const number = Number(text.replace(',', '.'))
  if (!Number.isFinite(number)) throw new Error('ordem possui número inválido')
  return number
}

const warnInvalidProduct = (rowNumber: number, sku: string, reason: string) => {
  if (import.meta.env.DEV) {
    console.warn(
      'Produto ignorado (linha ' + rowNumber + ', SKU ' + (sku || 'não informado') + '): ' + reason,
    )
  }
}

export const parseProductsCsv = (csv: string): Product[] => {
  const { rows, fields, rowErrors } = parseCsv(csv, 'PRODUTOS')
  requireColumns(fields, PRODUCT_REQUIRED_COLUMNS, 'PRODUTOS')
  const products: Product[] = []
  rows.forEach((row, index) => {
    if (isEmptyRow(row)) return
    const skuForLog = normalized(row.sku)
    const rowError = rowErrors.get(index)
    if (rowError) {
      warnInvalidProduct(index + 2, skuForLog, rowError)
      return
    }
    try {
      const promotionalPriceText = normalized(row.preco_promocional)
      products.push({
        sku: requiredValue(row, 'sku'),
        group: normalized(row.grupo),
        slug: requiredValue(row, 'slug'),
        name: requiredValue(row, 'nome'),
        brand: requiredValue(row, 'marca'),
        category: requiredValue(row, 'categoria'),
        gender: normalized(row.genero),
        color: normalized(row.cor),
        size: requiredValue(row, 'tamanho'),
        price: parseSheetPrice(row.preco, 'preco'),
        promotionalPrice: promotionalPriceText
          ? parseSheetPrice(promotionalPriceText, 'preco_promocional')
          : undefined,
        description: normalized(row.descricao),
        images: [row.imagem_1, row.imagem_2, row.imagem_3].map(normalized).filter(Boolean),
        available: parseSheetBoolean(requiredValue(row, 'disponivel'), 'disponivel'),
        featured: parseSheetBoolean(row.destaque, 'destaque'),
        newArrival: parseSheetBoolean(row.novidade, 'novidade'),
        order: parseOrder(row.ordem),
      })
    } catch (error) {
      warnInvalidProduct(
        index + 2,
        skuForLog,
        error instanceof Error ? error.message : 'erro desconhecido',
      )
    }
  })
  if (products.length === 0) throw new Error('PRODUTOS: nenhuma linha válida encontrada')

  for (const field of ['sku', 'slug'] as const) {
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    products.forEach((product) => {
      if (seen.has(product[field])) duplicates.add(product[field])
      seen.add(product[field])
    })
    if (duplicates.size > 0) {
      throw new Error(
        'PRODUTOS: ' + field.toUpperCase() + ' duplicado(s): ' + [...duplicates].join(', '),
      )
    }
  }
  return products
}

export const parseConfigCsv = (csv: string): CatalogConfig => {
  const { rows, fields, rowErrors } = parseCsv(csv, 'CONFIG')
  requireColumns(fields, CONFIG_REQUIRED_COLUMNS, 'CONFIG')
  if (rowErrors.size > 0) {
    const [rowNumber, reason] = [...rowErrors][0]
    throw new Error('CONFIG: CSV inválido na linha ' + (rowNumber + 2) + ': ' + reason)
  }
  const row = rows.find((candidate) => !isEmptyRow(candidate))
  if (!row) throw new Error('CONFIG: nenhuma linha válida encontrada')
  const parsedPageSize = Number(normalized(row.quantidade_por_pagina))
  const pageSize = Number.isInteger(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 24
  return {
    storeName: requiredValue(row, 'nome_loja'),
    whatsapp: requiredValue(row, 'whatsapp'),
    instagram: normalized(row.instagram),
    homeTitle: normalized(row.titulo_home),
    homeSubtitle: normalized(row.subtitulo_home),
    whatsappText: normalized(row.texto_whatsapp),
    showPrice: parseSheetBoolean(row.mostrar_preco, 'mostrar_preco'),
    showUnavailable: parseSheetBoolean(row.mostrar_indisponiveis, 'mostrar_indisponiveis'),
    pageSize,
  }
}

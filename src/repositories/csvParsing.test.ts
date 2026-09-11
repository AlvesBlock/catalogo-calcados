import { describe, expect, it, vi } from 'vitest'
import { parseConfigCsv, parseProductsCsv, parseSheetBoolean, parseSheetPrice } from './csvParsing'

const header =
  'sku,grupo,slug,nome,marca,categoria,genero,cor,tamanho,preco,preco_promocional,descricao,imagem_1,imagem_2,imagem_3,disponivel,destaque,novidade,ordem'

const row = (changes: Partial<Record<string, string>> = {}) => {
  const values: Record<string, string> = {
    sku: 'SKU1',
    grupo: 'G1',
    slug: 'tenis-1',
    nome: 'Tênis Um',
    marca: 'Marca',
    categoria: 'Tênis',
    genero: 'Unissex',
    cor: 'Azul',
    tamanho: '42',
    preco: '299.90',
    preco_promocional: '',
    descricao: 'Descrição',
    imagem_1: 'SKU1-1',
    imagem_2: '',
    imagem_3: 'SKU1-3',
    disponivel: 'SIM',
    destaque: 'NAO',
    novidade: 'TRUE',
    ordem: '2',
    ...changes,
  }
  return header
    .split(',')
    .map((key) => '"' + (values[key] ?? '').replace(/"/g, '""') + '"')
    .join(',')
}

describe('parseProductsCsv', () => {
  it('maps a valid product, images, optional promotion and text size', () => {
    const product = parseProductsCsv(header + '\n' + row())[0]
    expect(product).toMatchObject({
      sku: 'SKU1',
      group: 'G1',
      name: 'Tênis Um',
      size: '42',
      price: 299.9,
      promotionalPrice: undefined,
      images: ['SKU1-1', 'SKU1-3'],
      available: true,
      featured: false,
      newArrival: true,
    })
  })

  it.each([
    ['299.90', 299.9],
    ['299,90', 299.9],
    ['R$ 1.299,90', 1299.9],
    ['1299.90', 1299.9],
  ])('normalizes price %s', (input, expected) => {
    expect(parseSheetPrice(input, 'preco')).toBe(expected)
  })

  it.each([
    ['SIM', true],
    [' NAO ', false],
    ['NÃO', false],
    ['TRUE', true],
    ['FALSE', false],
    ['1', true],
    ['0', false],
  ])('normalizes boolean %s', (input, expected) => {
    expect(parseSheetBoolean(input, 'campo')).toBe(expected)
  })

  it('rejects an invalid boolean instead of coercing it', () => {
    expect(() => parseSheetBoolean('talvez', 'campo')).toThrow('booleano inválido')
  })

  it('ignores empty and partially invalid rows while retaining valid products', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const csv = header + '\n' + row() + '\n,,,,,,,,,,,,,,,,,,\n' + row({ sku: 'SKU2', preco: 'x' })
    expect(parseProductsCsv(csv)).toHaveLength(1)
    warn.mockRestore()
  })

  it('ignores a row with a mismatched number of CSV fields', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(parseProductsCsv(header + '\n' + row() + '\nSKU2,poucos,campos')).toHaveLength(1)
    warn.mockRestore()
  })

  it('fails when all rows are invalid', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(() => parseProductsCsv(header + '\n' + row({ preco: 'inválido' }))).toThrow(
      'nenhuma linha válida',
    )
    warn.mockRestore()
  })

  it.each([
    ['sku', 'SKU1'],
    ['slug', 'tenis-1'],
  ])('fails on duplicate %s', (field, value) => {
    const second = field === 'sku' ? row({ slug: 'tenis-2' }) : row({ sku: 'SKU2' })
    expect(() => parseProductsCsv(header + '\n' + row() + '\n' + second)).toThrow(
      field.toUpperCase() + ' duplicado',
    )
    expect(value).toBeTruthy()
  })

  it('fails when a required column is missing', () => {
    expect(() => parseProductsCsv('sku,nome\n1,Produto')).toThrow('colunas obrigatórias ausentes')
  })

  it('supports quoted commas and line breaks through PapaParse', () => {
    const product = parseProductsCsv(
      header + '\n' + row({ descricao: 'Linha 1, detalhe\nLinha 2' }),
    )[0]
    expect(product.description).toBe('Linha 1, detalhe\nLinha 2')
  })
})

describe('parseConfigCsv', () => {
  const configHeader =
    'nome_loja,whatsapp,instagram,titulo_home,subtitulo_home,texto_whatsapp,mostrar_preco,mostrar_indisponiveis,quantidade_por_pagina'

  it('maps config and keeps WhatsApp as text', () => {
    const config = parseConfigCsv(
      configHeader + '\n"Loja","5511999999999","@loja","Olá","Escolha","Oi","SIM","NÃO","36"',
    )
    expect(config).toMatchObject({
      storeName: 'Loja',
      whatsapp: '5511999999999',
      showPrice: true,
      showUnavailable: false,
      pageSize: 36,
    })
  })

  it.each(['', '0', '-2', '3.5', 'abc'])('defaults invalid page size %s to 24', (pageSize) => {
    const csv = configHeader + '\n"Loja","5511","","","","","FALSE","0","' + pageSize + '"'
    expect(parseConfigCsv(csv).pageSize).toBe(24)
  })
})

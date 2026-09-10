const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatCurrencyBRL = (value: number): string => currencyFormatter.format(value)

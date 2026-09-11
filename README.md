# Catálogo de Calçados

MVP de um catálogo web mobile-first para apresentar calçados e encaminhar o interesse do visitante ao vendedor pelo WhatsApp. Não é um e-commerce: não possui login, carrinho, checkout, pagamentos ou backend.

## Stack

React, TypeScript, Vite, React Router, PapaParse, Vitest, ESLint, Prettier e CSS próprio.

## Como executar

Requer Node.js 20 ou superior e npm.

```bash
npm install
cp .env.example .env
npm run dev
```

O exemplo usa a fonte mock. Para consumir uma planilha, publique separadamente as abas
PRODUTOS e CONFIG como CSV e configure suas URLs no arquivo local de ambiente.

## Qualidade e produção

```bash
npm run lint
npm run test
npm run build
```

O resultado de produção é gerado em `dist/`. A configuração do Netlify executa o build e possui fallback de SPA. O deploy não faz parte desta fase.

## Arquitetura

- `src/domain`: contratos e modelos independentes de infraestrutura e UI.
- src/repositories: implementações mock/Google Sheets, parsing CSV e ponto único de composição.
- `src/services`: construção de URLs Cloudinary e mensagens/links WhatsApp.
- `src/utils`: formatação, filtros, ordenação e persistência local.
- `src/hooks`: dados do catálogo e estado global dos favoritos.
- `src/components`: componentes reutilizáveis da interface.
- `src/pages`: páginas ligadas às rotas.
- `src/app`: composição principal da aplicação.
- `src/styles`: identidade visual global e responsiva.
- `docs`: decisões de arquitetura.

O contrato CatalogRepository impede que páginas e componentes conheçam a fonte dos dados.
O ponto de composição seleciona MockCatalogRepository ou GoogleSheetsCatalogRepository. A fonte
Google usa somente fetch e CSV público: não há API Google, credenciais, proxy nem backend.

## Variáveis de ambiente

| Variável                   | Uso                                                  |
| -------------------------- | ---------------------------------------------------- |
| VITE_CATALOG_SOURCE        | mock ou google                                       |
| VITE_PRODUCTS_CSV_URL      | URL CSV publicada da aba PRODUTOS                    |
| VITE_CONFIG_CSV_URL        | URL CSV publicada da aba CONFIG                      |
| VITE_CLOUDINARY_CLOUD_NAME | Cloud Name público usado para gerar URLs das imagens |

Se VITE_CATALOG_SOURCE estiver ausente, mock é usado apenas em desenvolvimento/local. Em
produção a origem deve ser explícita. Ao selecionar google, ambas as URLs são obrigatórias e
qualquer falha mostra uma opção de nova tentativa; dados mock nunca aparecem como fallback.

## Estrutura das abas

PRODUTOS aceita as colunas: sku, grupo, slug, nome, marca, categoria, genero, cor, tamanho,
preco, preco_promocional, descricao, imagem_1, imagem_2, imagem_3, disponivel, destaque,
novidade e ordem. São obrigatórias: sku, slug, nome, marca, categoria, tamanho, preco e
disponivel.

CONFIG aceita: nome_loja, whatsapp, instagram, titulo_home, subtitulo_home, texto_whatsapp,
mostrar_preco, mostrar_indisponiveis e quantidade_por_pagina. nome_loja e whatsapp são
obrigatórias.

Booleanos aceitam SIM, NÃO, NAO, TRUE, FALSE, 1 e 0, sem diferenciar caixa ou espaços.
Preços aceitam formatos como 299.90, 299,90, R$ 299,90 e 1.299,90.
quantidade_por_pagina inválida usa 24. Imagens contêm public IDs literais do Cloudinary, sem
pasta, versão ou extensão acrescentada pelo repositório.

## Publicação e atualização

No Google Sheets, use **Arquivo → Compartilhar → Publicar na Web**, selecione cada aba e o
formato CSV. Copie cada link para a variável correspondente. Depois de alterar produtos ou
configuração, publique a atualização quando necessário e recarregue a página; o repositório
mantém somente cache em memória durante aquela execução.

Não há segredo ou credencial Cloudinary no frontend. Não coloque URLs reais da planilha,
telefone real ou outros dados de produção no arquivo de exemplo.

Veja [docs/architecture.md](docs/architecture.md) para a descrição detalhada.

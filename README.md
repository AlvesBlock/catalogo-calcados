# Catálogo de Calçados

MVP de um catálogo web mobile-first para apresentar calçados e encaminhar o interesse do visitante ao vendedor pelo WhatsApp. Não é um e-commerce: não possui login, carrinho, checkout, pagamentos ou backend.

## Stack

React, TypeScript, Vite, React Router, Vitest, ESLint, Prettier e CSS próprio.

## Como executar

Requer Node.js 20 ou superior e npm.

```bash
npm install
cp .env.example .env
npm run dev
```

O Cloud Name já possui um fallback público para facilitar o desenvolvimento; o arquivo `.env` permite substituí-lo por ambiente.

## Qualidade e produção

```bash
npm run lint
npm run test
npm run build
```

O resultado de produção é gerado em `dist/`. A configuração do Netlify executa o build e possui fallback de SPA. O deploy não faz parte desta fase.

## Arquitetura

- `src/domain`: contratos e modelos independentes de infraestrutura e UI.
- `src/repositories`: implementação mock e ponto único de composição do repositório.
- `src/services`: construção de URLs Cloudinary e mensagens/links WhatsApp.
- `src/utils`: formatação, filtros, ordenação e persistência local.
- `src/hooks`: dados do catálogo e estado global dos favoritos.
- `src/components`: componentes reutilizáveis da interface.
- `src/pages`: páginas ligadas às rotas.
- `src/app`: composição principal da aplicação.
- `src/styles`: identidade visual global e responsiva.
- `docs`: decisões de arquitetura.

O contrato `CatalogRepository` impede que páginas e componentes conheçam a fonte dos dados. Nesta fase, `MockCatalogRepository` oferece cinco produtos. Uma futura implementação `GoogleSheetsCatalogRepository` poderá substituí-la no arquivo de composição sem mudar a UI.

## Variáveis de ambiente

| Variável                     | Uso                                                     |
| ---------------------------- | ------------------------------------------------------- |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud Name público usado para gerar as URLs das imagens |

Não há segredo ou credencial Cloudinary no frontend. O número do WhatsApp e o Instagram atuais são dados fictícios de demonstração.

Veja [docs/architecture.md](docs/architecture.md) para a descrição detalhada.

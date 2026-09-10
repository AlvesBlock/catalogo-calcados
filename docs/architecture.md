# Arquitetura do catálogo

## 1. Objetivo

Apresentar aproximadamente 3.000 calçados e transformar interesse em contato pelo WhatsApp. A aplicação é estática e não oferece recursos transacionais.

## 2. Arquitetura

A dependência segue a direção UI → contrato de domínio ← implementação de repositório. Páginas consomem `CatalogRepository`, sem conhecer planilhas ou mocks. Serviços isolam integrações externas puramente baseadas em URL.

## 3. Product

`Product` representa uma variação vendável. Inclui SKU, agrupamento, slug, descrição comercial, atributos, preços numéricos, public IDs de imagens, flags e ordem editorial. `size` é texto para comportar qualquer grade futura.

## 4. CatalogConfig

Centraliza nome da loja, contatos, textos da Home e opções editoriais como exibição de preço, indisponíveis e tamanho da página. Os valores atuais são mocks, inclusive telefone e Instagram.

## 5. CatalogRepository

O contrato assíncrono oferece lista de produtos, consulta por slug e configuração. Ele é a fronteira entre domínio/UI e a origem de dados.

## 6. MockCatalogRepository

Usado nesta fase, retorna cópias dos cinco registros locais para impedir mutação acidental da fonte mock.

## 7. Futuro GoogleSheetsCatalogRepository

Uma implementação futura deverá adaptar linhas da planilha para `Product` e `CatalogConfig` e será trocada apenas no ponto de composição `repositories/catalogRepository.ts`. Google Sheets será um CMS simples e fonte de dados; não será acessado diretamente pelos componentes. Nenhuma integração real foi antecipada nesta fase.

## 8. Cloudinary

Cloudinary é a camada de mídia. A função de URL aplica `f_auto`, `q_auto`, limite de largura e `c_limit`. Cards solicitam 600 px e detalhes 1200 px. Não há SDK ou segredo no navegador.

## 9. Por que armazenar public IDs

Public IDs mantêm o domínio independente de transformações, formato, qualidade, largura e host de entrega. Como asset folders são desacoplados do public ID, `SAP000001-1` é usado literalmente, sem prefixo de pasta, versão ou extensão obrigatória.

## 10. Favoritos no localStorage

Apenas SKUs são persistidos no navegador, sem conta de usuário. Na leitura, os SKUs são cruzados com o catálogo atual. A mensagem do WhatsApp inclui no máximo 10 produtos e informa itens excedentes, evitando URLs excessivamente grandes.

## 11. Integração WhatsApp

Funções puras compõem mensagens de produto ou favoritos e geram links `wa.me`, removendo formatação do telefone e aplicando `encodeURIComponent` uma única vez. A UI apenas fornece produto, configuração e URL atual.

## 12. Estratégia para cerca de 3.000 produtos

Os registros permanecem em memória. Filtro e ordenação são derivados com `useMemo`; somente a página atual é renderizada; imagens usam lazy loading; cards solicitam thumbnails e a imagem maior só é usada no detalhe. Paginação torna virtualização desnecessária neste MVP.

## 13. Deploy futuro no Netlify

`netlify.toml` define `npm run build`, publicação de `dist` e fallback SPA. `public/_redirects` mantém acesso direto às rotas do React Router. O deploy será feito em uma etapa posterior.

## Responsabilidades externas

- Google Sheets = CMS simples / fonte de dados
- Cloudinary = mídia
- Netlify = hosting
- WhatsApp = contato
- GitHub = versionamento

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

## 6. Origens e ponto de composição

O arquivo de composição seleciona uma única origem por VITE_CATALOG_SOURCE. mock cria
MockCatalogRepository; google cria GoogleSheetsCatalogRepository com as duas URLs CSV. A
ausência da variável usa mock somente em desenvolvimento. Produção exige uma escolha explícita.

## 7. GoogleSheetsCatalogRepository

Esta implementação baixa as abas PRODUTOS e CONFIG publicadas como CSV usando fetch nativo e
valida response.ok. PapaParse processa vírgulas, aspas, acentos, campos vazios e quebras de linha
quoted. A infraestrutura adapta nomes em português para Product e CatalogConfig; páginas e
componentes não conhecem URLs, colunas ou PapaParse.

Fluxo de dados:

    Administrador
        ↓
    Google Sheets
        ↓
    CSV publicado
        ↓
    Netlify Function / CDN cache
        ↓
    GoogleSheetsCatalogRepository
        ↓
    Product / CatalogConfig
        ↓
    React

Cada instância mantém uma promise de produtos e outra de configuração. Assim, chamadas
simultâneas ou repetidas não duplicam downloads, e getProductBySlug reutiliza os produtos. Uma
promise rejeitada é removida do cache para que o botão Tentar novamente faça uma nova requisição.
Não há localStorage, Service Worker ou cache persistente para as planilhas.

O navegador usa apenas os endpoints same-origin
/.netlify/functions/catalog-csv?sheet=products e
/.netlify/functions/catalog-csv?sheet=config. A Function mapeia esses dois valores para variáveis
de runtime server-side e segue redirects do Google. Ela existe exclusivamente para evitar CORS,
manter o frontend same-origin e aplicar cache; não contém regras de negócio.

O parâmetro sheet possui lista fechada, portanto a Function não pode ser usada como proxy para
URLs arbitrárias. Respostas válidas usam cache de navegador de 60 segundos e cache durável da
CDN por 300 segundos, com stale-while-revalidate de 600 segundos.

## 8. Validação e normalização

PRODUTOS exige sku, slug, nome, marca, categoria, tamanho, preco e disponivel; CONFIG exige
nome_loja e whatsapp. Linhas vazias são ignoradas. Uma linha de produto inválida é omitida e
gera aviso de desenvolvimento com linha, SKU e motivo; se não restar produto válido, o
carregamento falha. SKU ou slug duplicado rejeita o catálogo inteiro para evitar ambiguidade.

Booleanos são normalizados sem diferenciar caixa, espaços ou acentos: SIM, TRUE e 1 são
verdadeiros; NÃO, NAO, FALSE e 0 são falsos. Vazio é falso nos campos opcionais; qualquer outro
valor é inválido. Preços removem R$, espaços e separadores de milhar conforme o separador
decimal detectado, e precisam resultar em número finito não negativo. Preço obrigatório inválido
invalida a linha. Tamanho e WhatsApp permanecem strings. pageSize aceita apenas inteiro positivo
e usa 24 quando ausente ou inválido.

## 9. Erros e ausência de fallback

Falhas de configuração, HTTP, parsing e schema são registradas tecnicamente apenas em
desenvolvimento. A interface mostra uma mensagem amigável e acessível, sem stack trace, com
Tentar novamente. Quando google está selecionado, falha alguma troca a fonte para mock: produtos
de demonstração nunca podem parecer dados reais.

## 10. Cloudinary

Cloudinary é a camada de mídia. A função de URL aplica `f_auto`, `q_auto`, limite de largura e `c_limit`. Cards solicitam 600 px e detalhes 1200 px. Não há SDK ou segredo no navegador.

## 11. Por que armazenar public IDs

Public IDs mantêm o domínio independente de transformações, formato, qualidade, largura e host de entrega. Como asset folders são desacoplados do public ID, `SAP000001-1` é usado literalmente, sem prefixo de pasta, versão ou extensão obrigatória.

Fluxo de mídia:

    Administrador
        ↓
    Cloudinary
        ↓
    public_id colocado no Google Sheets
        ↓
    frontend monta URL otimizada

## 12. Favoritos no localStorage

Apenas SKUs são persistidos no navegador, sem conta de usuário. Na leitura, os SKUs são cruzados com o catálogo atual. A mensagem do WhatsApp inclui no máximo 10 produtos e informa itens excedentes, evitando URLs excessivamente grandes.

## 13. Integração WhatsApp

Funções puras compõem mensagens de produto ou favoritos e geram links `wa.me`, removendo formatação do telefone e aplicando `encodeURIComponent` uma única vez. A UI apenas fornece produto, configuração e URL atual.

## 14. Estratégia para cerca de 3.000 produtos

Os registros permanecem em memória. Filtro e ordenação são derivados com `useMemo`; somente a página atual é renderizada; imagens usam lazy loading; cards solicitam thumbnails e a imagem maior só é usada no detalhe. Paginação torna virtualização desnecessária neste MVP.

## 15. Deploy no Netlify

`netlify.toml` define `npm run build`, publicação de `dist` e fallback SPA.
`public/_redirects` mantém acesso direto às rotas do React Router. A Netlify resolve Functions
antes dos redirects, por isso o endpoint reservado não é capturado pelo fallback e nenhuma regra
adicional é necessária.

CATALOG_PRODUCTS_CSV_URL e CATALOG_CONFIG_CSV_URL são variáveis runtime com escopo Functions e
não possuem prefixo VITE_. O frontend recebe somente os caminhos same-origin. Para testar todo o
fluxo localmente usa-se netlify dev; npm run dev continua suficiente para a origem mock.

## Responsabilidades externas

- Google Sheets = CMS simples / fonte de dados
- Cloudinary = mídia
- Netlify = hosting, transporte CSV e cache CDN
- WhatsApp = contato
- GitHub = versionamento

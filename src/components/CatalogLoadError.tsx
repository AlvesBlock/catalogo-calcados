interface CatalogLoadErrorProps {
  onRetry: () => void
}

export function CatalogLoadError({ onRetry }: CatalogLoadErrorProps) {
  return (
    <div className="status container" role="alert">
      <p>Não foi possível carregar o catálogo agora.</p>
      <button className="button" type="button" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  )
}

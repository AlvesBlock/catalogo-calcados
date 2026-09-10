import { Link } from 'react-router-dom'
export function NotFoundPage() {
  return (
    <div className="container page empty-state">
      <p className="eyebrow">Erro 404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço pode ter mudado ou não existe.</p>
      <Link className="button" to="/">
        Voltar ao início
      </Link>
    </div>
  )
}

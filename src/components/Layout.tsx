import { NavLink, Outlet } from 'react-router-dom'
import { useFavorites } from '../hooks/FavoritesContext'

export function Layout() {
  const { favoriteSkus } = useFavorites()
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand" to="/">
            Passo Certo
          </NavLink>
          <nav aria-label="Navegação principal">
            <NavLink to="/catalogo">Catálogo</NavLink>
            <NavLink to="/favoritos">
              Favoritos <span className="count">{favoriteSkus.length}</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div className="container">
          <strong>Passo Certo</strong>
          <p>Catálogo demonstrativo · Atendimento pelo WhatsApp</p>
        </div>
      </footer>
    </>
  )
}

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { FavoritesProvider } from '../hooks/FavoritesContext'
import { CatalogPage } from '../pages/CatalogPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProductPage } from '../pages/ProductPage'

export function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogo" element={<CatalogPage />} />
            <Route path="produto/:slug" element={<ProductPage />} />
            <Route path="favoritos" element={<FavoritesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  )
}

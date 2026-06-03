import AppLayout from './layouts/AppLayout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage'
import SplashPage from './pages/Splash/SplashPage'
import SignupPage from './pages/Signup/SignupPage'
import MapPage from './pages/MapPage/MapPage'
import RoutingSearchPage from './pages/RoutingSearchPage/RoutingSearchPage'
import RoutingOptionPage from './pages/RoutingOptionPage/RoutingOptionPage'
import SearchPage from './pages/SearchPage/SearchPage'
import RoutingPage from './pages/RoutingPage/RoutingPage'
import MyPage from './pages/MyPage/MyPage/MyPage'
import FavoritesPage from './pages/MyPage/FavoritesPage/FavoritesPage'
import ReviewsPage from './pages/MyPage/ReviewsPage/ReviewsPage'
import SettingsPage from './pages/MyPage/SettingsPage/SettingsPage'
import ProfilePage from './pages/MyPage/ProfilePage/ProfilePage'
import PasswordPage from './pages/MyPage/PasswordPage/PasswordPage'
import { ROUTES } from './constants/routes'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.HOME} element={<SplashPage />} />
          <Route path={ROUTES.MAP} element={<MapPage />} />
          <Route path={ROUTES.ROUTING_SEARCH} element={<RoutingSearchPage />} />
          <Route path={ROUTES.ROUTING_OPTION} element={<RoutingOptionPage />} />
          <Route path={ROUTES.ROUTING} element={<RoutingPage />} />
          <Route path={ROUTES.ROUTING_LEGACY} element={<RoutingPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchPage />} />
          <Route path="/my" element={<MyPage />} />
          <Route path="/my/favorites" element={<FavoritesPage />} />
          <Route path="/my/reviews" element={<ReviewsPage />} />
          <Route path="/my/settings" element={<SettingsPage />} />
          <Route path="/my/profile" element={<ProfilePage />} />
          <Route path="/my/password" element={<PasswordPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App

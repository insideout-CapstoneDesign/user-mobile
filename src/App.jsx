import AppLayout from './layouts/AppLayout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ComponentTestPage from './pages/ComponentTestPage/ComponentTestPage'
import LoginPage from './pages/Login/LoginPage'
import SplashPage from './pages/Splash/SplashPage'
import SignupPage from './pages/Signup/SignupPage'
import MapPage from './pages/MapPage/MapPage'
import SearchPage from './pages/SearchPage/SearchPage'
import RoutingPage from './pages/RoutingPage/RoutingPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/routing" element={<RoutingPage />} />
          <Route path="/RoutingPage" element={<RoutingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/component-test" element={<ComponentTestPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App

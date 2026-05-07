import AppLayout from './layouts/AppLayout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ComponentTestPage from './pages/ComponentTestPage/ComponentTestPage'
import MapPage from './pages/MapPage/MapPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/component-test" element={<ComponentTestPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App

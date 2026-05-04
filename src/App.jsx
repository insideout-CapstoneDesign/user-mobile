import AppLayout from './layouts/AppLayout'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ComponentTestPage from './pages/ComponentTestPage/ComponentTestPage'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route
            path="/"
            element={
              <main style={{ padding: 'var(--space-16)' }}>
                <h1 style={{ margin: 0 }}>insideout</h1>
              </main>
            }
          />
          <Route path="/component-test" element={<ComponentTestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App

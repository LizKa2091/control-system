import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import ProtectedPage from './components/ProtectedPage';
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Defects from './pages/Defects'
import Reports from './pages/Reports'
import Login from './pages/Login'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
                <ProtectedPage>
                  <Dashboard />
                </ProtectedPage>
              } 
            />
            <Route path="/projects" element={
                <ProtectedPage>
                  <Projects />
                </ProtectedPage>
              }
            />
            <Route path="/defects" element={
                <ProtectedPage>
                  <Defects />
                </ProtectedPage>
              } 
            />
            <Route path="/reports" element={
                <ProtectedPage>
                  <Reports />
                </ProtectedPage>
              } 
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
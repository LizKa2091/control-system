import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedPage from './components/ProtectedPage';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Defects from './pages/Defects';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Forbidden from './pages/Forbidden';
import ProjectView from './pages/ProjectView';

const App: FC = () => {
   return (
      <BrowserRouter>
         <AuthProvider>
            <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/forgot" element={<ForgotPassword />} />
               <Route path="/reset" element={<ResetPassword />} />
               <Route element={<MainLayout />}>
                  <Route
                     path="/"
                     element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                     path="/dashboard"
                     element={
                        <ProtectedPage>
                           <Dashboard />
                        </ProtectedPage>
                     }
                  />
                  <Route
                     path="/projects"
                     element={
                        <ProtectedPage roles={['manager', 'lead', 'admin']}>
                           <Projects />
                        </ProtectedPage>
                     }
                  />
                  <Route
                     path="/projects/:id"
                     element={
                        <ProtectedPage roles={['manager', 'lead', 'admin']}>
                           <ProjectView />
                        </ProtectedPage>
                     }
                  />
                  <Route
                     path="/defects"
                     element={
                        <ProtectedPage roles={['engineer', 'manager', 'lead']}>
                           <Defects />
                        </ProtectedPage>
                     }
                  />
                  <Route
                     path="/reports"
                     element={
                        <ProtectedPage roles={['manager', 'lead']}>
                           <Reports />
                        </ProtectedPage>
                     }
                  />
               </Route>
               <Route path="/403" element={<Forbidden />} />
               <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
         </AuthProvider>
      </BrowserRouter>
   );
};

export default App;

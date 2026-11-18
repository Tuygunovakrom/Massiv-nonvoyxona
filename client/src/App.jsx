import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import ProtectedRoute, { homeFor } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import BakerPage from './pages/baker/BakerPage';
import DriverPage from './pages/driver/DriverPage';
import AdminPage from './pages/admin/AdminPage';

// Rolga qarab bosh sahifaga yonaltirish
function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleHome />} />
            <Route
              path="nonvoy"
              element={
                <ProtectedRoute roles={['nonvoy']}>
                  <BakerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="shofyor"
              element={
                <ProtectedRoute roles={['shofyor']}>
                  <DriverPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

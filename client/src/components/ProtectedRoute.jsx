import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export function homeFor(role) {
  if (role === 'admin') return '/admin';
  if (role === 'nonvoy') return '/nonvoy';
  return '/shofyor';
}

// Kirgan foydalanuvchini va ruxsatni tekshirish
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }
  return children;
}

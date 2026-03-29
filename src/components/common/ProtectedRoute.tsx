import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import type { RolNombre } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: RolNombre[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.rol)) {
    // Redirigir según el rol del usuario
    switch (user.rol) {
      case 'ADMINISTRADOR':
        return <Navigate to="/admin" replace />;
      case 'MOZO':
        return <Navigate to="/mozo" replace />;
      case 'COCINERO':
        return <Navigate to="/cocinero" replace />;
      case 'BARTENDER':
        return <Navigate to="/bartender" replace />;
      case 'CAJERO':
        return <Navigate to="/cajero" replace />;
      case 'RECEPCIONISTA':
        return <Navigate to="/recepcionista" replace />;
      case 'ALMACENERO':
        return <Navigate to="/almacenero" replace />;
      case 'CLIENTE':
        return <Navigate to="/cliente" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

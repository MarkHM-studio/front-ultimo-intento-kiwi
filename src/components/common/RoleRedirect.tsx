import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export const RoleRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Redirigir según el rol del usuario
  switch (user?.rol) {
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
};

export default RoleRedirect;

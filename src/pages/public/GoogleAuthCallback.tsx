import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import type { RolNombre } from '@/types';

const getRouteByRole = (rol?: RolNombre) => {
  switch (rol) {
    case 'ADMINISTRADOR':
      return '/admin';
    case 'MOZO':
      return '/mozo';
    case 'COCINERO':
      return '/cocinero';
    case 'BARTENDER':
      return '/bartender';
    case 'CAJERO':
      return '/cajero';
    case 'RECEPCIONISTA':
      return '/recepcionista';
    case 'ALMACENERO':
      return '/almacenero';
    case 'CLIENTE':
      return '/cliente';
    default:
      return '/login';
  }
};

export const GoogleAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      useAuthStore.setState({ token, isAuthenticated: true });

      try {
        await fetchCurrentUser();
        const currentUser = useAuthStore.getState().user;
        navigate(getRouteByRole(currentUser?.rol), { replace: true });
      } catch (error: any) {
        const rawMessage = String(error?.response?.data?.message || error?.friendlyMessage || error?.message || '').toLowerCase();
        const status = error?.response?.status;
        const message =
          status === 401 || status === 403 || rawMessage.includes('inactivo') || rawMessage.includes('disabled')
            ? 'Tu cuenta está inactiva. Contacta al administrador.'
            : rawMessage.includes('google')
              ? 'Esta cuenta fue creada con Google. Inicia sesión con Google.'
              : 'No se pudo autenticar con Google. Intenta nuevamente.';
        logout();
        navigate(`/login?oauth_error=${encodeURIComponent(message)}`, { replace: true });
      }
    };

    run();
  }, [fetchCurrentUser, logout, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
      Procesando autenticación de Google...
    </div>
  );
};

export default GoogleAuthCallback;

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleRedirect } from '@/components/common/RoleRedirect';
import { useAuthStore } from '@/stores';
import { useDataAutoRefresh } from '@/hooks/useDataAutoRefresh';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { AccessibilityAnnouncer } from '@/components/accessibility/AccessibilityAnnouncer';

// Public pages
import { Welcome } from '@/pages/public/Welcome';
import { AuthPage } from '@/pages/public/AuthPage';
import { GoogleAuthCallback } from '@/pages/public/GoogleAuthCallback';

// Admin pages
import { Dashboard } from '@/pages/admin/Dashboard';
import { Productos } from '@/pages/admin/Productos';
import { Usuarios } from '@/pages/admin/Usuarios';
import { Ventas } from '@/pages/admin/Ventas';
import { Insumos } from '@/pages/admin/Insumos';
import { Recetas } from '@/pages/admin/Recetas';
import { Categorias } from '@/pages/admin/Categorias';
import { Marcas } from '@/pages/admin/Marcas';
import { Proveedores } from '@/pages/admin/Proveedores';
import { Clientes } from '@/pages/admin/Clientes';
import { Trabajadores } from '@/pages/admin/Trabajadores';
import { Mesas } from '@/pages/admin/Mesas';
import { Reportes } from '@/pages/admin/Reportes';
import { Salidas } from '@/pages/Salidas';

// Mozo pages
import { MozoDashboard } from '@/pages/mozo/MozoDashboard';

// Cocinero pages
import { CocineroDashboard } from '@/pages/cocinero/CocineroDashboard';

// Bartender pages
import { BartenderDashboard } from '@/pages/bartender/BartenderDashboard';

// Cajero pages
import { CajeroDashboard } from '@/pages/cajero/CajeroDashboard';

// Recepcionista pages
import { RecepcionistaDashboard } from '@/pages/recepcionista/RecepcionistaDashboard';

// Almacenero pages
import { AlmaceneroDashboard } from '@/pages/almacenero/AlmaceneroDashboard';

// Cliente pages
import { ClienteDashboard } from '@/pages/cliente/ClienteDashboard';
import { MisReservasPage } from '@/pages/cliente/MisReservasPage';
import { PerfilPage } from '@/pages/cliente/PerfilPage';

function App() {
  const { token, user, fetchCurrentUser, logout } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useDataAutoRefresh(user?.rol, Boolean(token && user));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      if (user) {
        setIsBootstrapping(false);
        return;
      }

      try {
        await fetchCurrentUser();
      } catch {
        logout();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [token, user, fetchCurrentUser, logout]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Cargando sesión...
      </div>
    );
  }

return (
    <BrowserRouter>
      <a
        href="#app-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <AccessibilityAnnouncer />
      <main id="app-main-content">
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={token ? <RoleRedirect /> : <Welcome />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<AuthPage />} />
        <Route path="/reset-password" element={<AuthPage />} />
        
        {/* OAuth Callback */}
        <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
        
        {/* Redirect based on role */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Productos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ventas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Ventas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/insumos"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Insumos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recetas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Recetas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Categorias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/marcas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Marcas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/proveedores"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Proveedores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trabajadores"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Trabajadores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mesas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Mesas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/salidas"
          element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Salidas />
            </ProtectedRoute>
          }
        />

        {/* Mozo Routes */}
        <Route
          path="/mozo"
          element={
            <ProtectedRoute allowedRoles={['MOZO']}>
              <MozoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mozo/comprobantes"
          element={
            <ProtectedRoute allowedRoles={['MOZO']}>
              <MozoDashboard />
            </ProtectedRoute>
          }
        />

        {/* Cocinero Routes */}
        <Route
          path="/cocinero"
          element={
            <ProtectedRoute allowedRoles={['COCINERO']}>
              <CocineroDashboard />
            </ProtectedRoute>
          }
        />

        {/* Bartender Routes */}
        <Route
          path="/bartender"
          element={
            <ProtectedRoute allowedRoles={['BARTENDER']}>
              <BartenderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Cajero Routes */}
        <Route
          path="/cajero"
          element={
            <ProtectedRoute allowedRoles={['CAJERO']}>
              <CajeroDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cajero/salidas"
          element={
            <ProtectedRoute allowedRoles={['CAJERO']}>
              <Salidas />
            </ProtectedRoute>
          }
        />

        {/* Recepcionista Routes */}
        <Route
          path="/recepcionista"
          element={
            <ProtectedRoute allowedRoles={['RECEPCIONISTA']}>
              <RecepcionistaDashboard />
            </ProtectedRoute>
          }
        />

        {/* Almacenero Routes */}
        <Route
          path="/almacenero"
          element={
            <ProtectedRoute allowedRoles={['ALMACENERO']}>
              <AlmaceneroDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/almacenero/insumos"
          element={
            <ProtectedRoute allowedRoles={['ALMACENERO']}>
              <AlmaceneroDashboard />
            </ProtectedRoute>
          }
        />

        {/* Cliente Routes */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/nueva"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <PerfilPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/mis-reservas"
          element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <MisReservasPage />
            </ProtectedRoute>
          }
        />

        {/* Payment Result Routes */}
        <Route path="/pago/exito" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-green-600">¡Pago Exitoso!</h1></div>} />
        <Route path="/pago/pendiente" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-yellow-600">Pago Pendiente</h1></div>} />
        <Route path="/pago/error" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">Error en el Pago</h1></div>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AccessibilityPanel />
    </BrowserRouter>
  );
}

export default App;

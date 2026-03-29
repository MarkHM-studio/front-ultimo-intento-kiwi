import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { RoleRedirect } from '@/components/common/RoleRedirect';

// Public pages
import { Welcome } from '@/pages/public/Welcome';
import { Login } from '@/pages/public/Login';
import { Register } from '@/pages/public/Register';
import { ForgotPassword } from '@/pages/public/ForgotPassword';
import { ResetPassword } from '@/pages/public/ResetPassword';

// Admin pages
import { Dashboard } from '@/pages/admin/Dashboard';
import { Productos } from '@/pages/admin/Productos';
import { Usuarios } from '@/pages/admin/Usuarios';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* OAuth Callback */}
        <Route path="/auth/google/success" element={<RoleRedirect />} />
        
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
              <ClienteDashboard />
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
    </BrowserRouter>
  );
}

export default App;

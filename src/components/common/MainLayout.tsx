import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminStore, useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Home,
  Users,
  Package,
  ClipboardList,
  ChefHat,
  Wine,
  DollarSign,
  Calendar,
  Warehouse,
  LogOut,
  User,
  LayoutDashboard,
  ShoppingCart,
  Briefcase,
  Boxes,
  Tags,
  Factory,
  FileSpreadsheet,
} from 'lucide-react';
import type { RolNombre } from '@/types';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: RolNombre[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Usuarios', href: '/admin/usuarios', icon: <Users className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Trabajadores', href: '/admin/trabajadores', icon: <Briefcase className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Clientes', href: '/admin/clientes', icon: <User className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Productos', href: '/admin/productos', icon: <Package className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Insumos', href: '/admin/insumos', icon: <Boxes className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Recetas', href: '/admin/recetas', icon: <ClipboardList className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Mesas', href: '/admin/mesas', icon: <Home className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Categorías', href: '/admin/categorias', icon: <Tags className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Marcas', href: '/admin/marcas', icon: <Factory className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Proveedores', href: '/admin/proveedores', icon: <Warehouse className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Ventas', href: '/admin/ventas', icon: <DollarSign className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Reportes', href: '/admin/reportes', icon: <FileSpreadsheet className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },

  { label: 'Pedidos', href: '/mozo', icon: <ShoppingCart className="h-5 w-5" />, roles: ['MOZO'] },
  { label: 'Comprobantes', href: '/mozo/comprobantes', icon: <ClipboardList className="h-5 w-5" />, roles: ['MOZO'] },
  { label: 'Cocina', href: '/cocinero', icon: <ChefHat className="h-5 w-5" />, roles: ['COCINERO'] },
  { label: 'Bar', href: '/bartender', icon: <Wine className="h-5 w-5" />, roles: ['BARTENDER'] },
  { label: 'Caja', href: '/cajero', icon: <DollarSign className="h-5 w-5" />, roles: ['CAJERO'] },
  { label: 'Reservas', href: '/recepcionista', icon: <Calendar className="h-5 w-5" />, roles: ['RECEPCIONISTA'] },
  { label: 'Entradas', href: '/almacenero', icon: <Warehouse className="h-5 w-5" />, roles: ['ALMACENERO'] },
  { label: 'Insumos', href: '/almacenero/insumos', icon: <Package className="h-5 w-5" />, roles: ['ALMACENERO'] },
  { label: 'Mis Reservas', href: '/cliente', icon: <Calendar className="h-5 w-5" />, roles: ['CLIENTE'] },
  { label: 'Nueva Reserva', href: '/cliente/nueva', icon: <Home className="h-5 w-5" />, roles: ['CLIENTE'] },
  { label: 'Mi Perfil', href: '/cliente/perfil', icon: <User className="h-5 w-5" />, roles: ['CLIENTE'] },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { error, clearError } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!error) return;
    toast.error(error);
    clearError();
  }, [error, clearError]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredNavItems = navItems.filter((item) => user?.rol && item.roles.includes(user.rol));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
            <span className="text-sm font-bold text-white">LP</span>
          </div>
          <span className="text-xl font-bold text-gray-900">La Pituca</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive ? 'bg-amber-100 text-amber-900' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-amber-600 text-white">
              {user?.nombreCompleto ? getInitials(user.nombreCompleto) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user?.nombreCompleto || user?.correo}</p>
            <p className="truncate text-xs text-gray-500">{user?.rol}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
            <span className="text-sm font-bold text-white">LP</span>
          </div>
          <span className="text-lg font-bold">La Pituca</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-600 text-xs text-white">
                  {user?.nombreCompleto ? getInitials(user.nombreCompleto) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 border-r bg-white lg:block">
          <SidebarContent />
        </aside>

        <main className="min-h-screen flex-1">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b bg-white px-8 py-4 lg:flex">
            <h1 className="text-2xl font-bold text-gray-900">
              {filteredNavItems.find((item) => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                {user?.rol}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-amber-600 text-xs text-white">
                        {user?.nombreCompleto ? getInitials(user.nombreCompleto) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium xl:inline">{user?.nombreCompleto || user?.correo}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
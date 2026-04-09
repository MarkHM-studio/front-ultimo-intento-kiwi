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
  ChevronLeft,
  ChevronRight,
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
  { label: 'Salidas', href: '/admin/salidas', icon: <Warehouse className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },
  { label: 'Reportes', href: '/admin/reportes', icon: <FileSpreadsheet className="h-5 w-5" />, roles: ['ADMINISTRADOR'] },

  { label: 'Pedidos', href: '/mozo', icon: <ShoppingCart className="h-5 w-5" />, roles: ['MOZO'] },
  { label: 'Comprobantes', href: '/mozo/comprobantes', icon: <ClipboardList className="h-5 w-5" />, roles: ['MOZO'] },
  { label: 'Cocina', href: '/cocinero', icon: <ChefHat className="h-5 w-5" />, roles: ['COCINERO'] },
  { label: 'Bar', href: '/bartender', icon: <Wine className="h-5 w-5" />, roles: ['BARTENDER'] },
  { label: 'Caja', href: '/cajero', icon: <DollarSign className="h-5 w-5" />, roles: ['CAJERO'] },
  { label: 'Salidas', href: '/cajero/salidas', icon: <Warehouse className="h-5 w-5" />, roles: ['CAJERO'] },
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
  const [collapsed, setCollapsed] = useState(false);

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
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B4513]">
            <span className="text-sm font-bold text-white">🍸</span>
          </div>
          {!collapsed && <span className="text-lg font-bold text-white">La Pituca</span>}
        </Link>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden rounded-lg p-1 text-gray-200 transition hover:bg-gray-700 lg:block"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive ? 'bg-[#8B4513] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#8B4513] text-white">
              {user?.nombreCompleto ? getInitials(user.nombreCompleto) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className={`min-w-0 flex-1 ${collapsed ? 'hidden' : 'block'}`}>
            <p className="truncate text-sm font-medium text-white">{user?.nombreCompleto || user?.correo}</p>
            <p className="truncate text-xs text-gray-400">{user?.rol}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#1F2937] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 text-[#1F2937]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B4513]">
            <span className="text-sm font-bold text-white">🍸</span>
          </div>
          <span className="text-lg font-bold">La Pituca</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#8B4513] text-xs text-white">
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
        <aside className={`sticky top-0 hidden h-screen border-r border-gray-700 bg-[#1F2937] transition-all lg:block ${collapsed ? 'w-20' : 'w-64'}`}>
          <SidebarContent />
        </aside>

        <main className="min-h-screen flex-1">
          <header className="sticky top-0 z-30 hidden items-center justify-between border-b bg-white px-8 py-4 lg:flex">
            <h1 className="text-2xl font-bold text-[#1F2937]">
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
                      <AvatarFallback className="bg-[#8B4513] text-xs text-white">
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
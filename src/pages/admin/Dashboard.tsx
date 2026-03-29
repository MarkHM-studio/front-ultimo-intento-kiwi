import { useEffect } from 'react';
import { useAdminStore, useComprobanteStore } from '@/stores';
import { MainLayout } from '@/components/common/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Package,
  Utensils
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { 
    dashboardStats, 
    fetchDashboardStats,
    productos,
    fetchProductos
  } = useAdminStore();
  const { comprobantes, fetchComprobantes } = useComprobanteStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchComprobantes();
    fetchProductos();
  }, []);

  // Datos de ejemplo para gráficos (en producción vendrían del backend)
  const ventasSemanaData = [
    { dia: 'Lun', ventas: 1200 },
    { dia: 'Mar', ventas: 1900 },
    { dia: 'Mie', ventas: 1500 },
    { dia: 'Jue', ventas: 2200 },
    { dia: 'Vie', ventas: 2800 },
    { dia: 'Sab', ventas: 3500 },
    { dia: 'Dom', ventas: 3100 },
  ];

  const productosData = productos.slice(0, 5).map(p => ({
    nombre: p.nombre,
    stock: p.stock
  }));

  const comprobantesAbiertos = comprobantes.filter(c => c.estado === 'ABIERTO').length;
  const reservasPendientes = dashboardStats?.reservasPendientes || 0;

  const exportarReporte = (tipo: string) => {
    // Implementar exportación a Excel
    console.log(`Exportando reporte de ${tipo}...`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    S/ {dashboardStats?.ventasHoy.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pedidos Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats?.totalPedidosHoy || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Mesas Ocupadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats?.mesasOcupadas || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Reservas Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservasPendientes}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ventas de la Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasSemanaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value) => `S/ ${value}`} />
                  <Bar dataKey="ventas" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productosData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Estado Actual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Estado de Comprobantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span>Abiertos</span>
                  </div>
                  <Badge variant="secondary">{comprobantesAbiertos}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Pagados</span>
                  </div>
                  <Badge variant="secondary">
                    {comprobantes.filter(c => c.estado === 'PAGADO').length}
                  </Badge>
                </div>
              </div>
           </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservas de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Esperando Pago</span>
                  </div>
                  <Badge variant="secondary">{reservasPendientes}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Confirmadas</span>
                  </div>
                  <Badge variant="secondary">
                    0
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Reportes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportarReporte('ventas')}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Reporte de Ventas
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportarReporte('productos')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Reporte de Productos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportarReporte('usuarios')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Reporte de Usuarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
